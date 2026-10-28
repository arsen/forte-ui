/**
 * Touch-pan gate — a check, not a generator; it writes nothing.
 *
 * `touch-action` is a promise to the browser about which pans an element
 * will handle itself, and the browser keeps it to the letter: an axis the
 * element claims is never panned from a touch that starts on it, by the
 * element or by any scroller around it. The Carousel's viewport claimed the
 * inline axis on every carousel, draggable or not, so one turned only by its
 * arrows — or holding a single slide — took the axis from the page and then
 * did nothing with it. In a row of cards scrolling sideways, a swipe that
 * started on a card's text scrolled the row and one that started on its
 * carousel was thrown away (#167). A mouse never shows it, a screenshot
 * never shows it, and a desktop browser's touch emulation shows it only to
 * someone who thinks to swipe on the carousel rather than beside it.
 *
 * What it does: serve `pan-fixture/` through Vite (the real component, its
 * real CSS Module, the real theme), open it in headless Chrome as a touch
 * Pixel 7, and for each case below synthesize a real touch scroll gesture
 * with `Input.synthesizeScrollGesture` — the compositor's own gesture path,
 * so `touch-action` is honored exactly as for a finger — starting on the
 * carousel's viewport (or on the block beside it), then read how far the
 * fixture's scroller moved and which slide is active.
 *
 * Both halves are held, because each fix for one breaks the other:
 *
 *   - a carousel that cannot be dragged lets a pan along its axis through to
 *     the scroller around it, and does not change slide;
 *   - one that can be dragged keeps that axis — the scroller stays put and
 *     the slide changes — and still lets the OTHER axis through, which is
 *     what `none` would break.
 *
 * The first case swipes beside the carousel. It is the control: if the
 * scroller does not move there, the harness is broken and every "let it
 * through" case below would be meaningless, so it fails rather than passes.
 *
 * Needs Google Chrome. It looks in the usual places; set CHROME_PATH to
 * point it somewhere else. A missing browser is a failure, not a skip — a
 * gate that silently passes on a machine without one is not a gate.
 *
 *   pnpm --filter @forte-ui/react check:pan
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const fixture = fileURLToPath(new URL("./pan-fixture/", import.meta.url));

/** Pixel 7, touch: `touch-action` decides nothing for a mouse. */
const DEVICE = { width: 412, height: 915, deviceScaleFactor: 2.625, mobile: true };
/** How far the finger travels, in CSS pixels. Well past the carousel's drag
 * threshold and the browser's touch slop, and between half and one of the
 * fixture's 240px slides — the gesture ends without a fling, so a drag that
 * is meant to turn the carousel has to cover half a slide by itself. */
const DISTANCE = 150;
/** A pan the scroller took moves it nearly the whole distance (the touch
 * slop is eaten first); one it did not take moves it not at all. */
const SCROLLED = 100;

/*
 * `from`   where the finger lands: the carousel's viewport, or the block
 *          beside it
 * `axis`   which way it travels — `inline` is left/right, `block` up/down
 * `pans`   the scroller must move along that axis (else it must not)
 * `turns`  the carousel must change slide (else it must not)
 */
const CASES = [
  { query: "draggable=0", from: "outside", axis: "inline", pans: true, turns: false },
  // The bug: neither of these can be dragged, and both used to keep the axis.
  { query: "draggable=0", from: "viewport", axis: "inline", pans: true, turns: false },
  { query: "slides=1", from: "viewport", axis: "inline", pans: true, turns: false },
  { query: "orientation=vertical&draggable=0", from: "viewport", axis: "block", pans: true, turns: false },
  { query: "orientation=vertical&slides=1", from: "viewport", axis: "block", pans: true, turns: false },
  // What the claim is for, so a fix that drops it everywhere fails here.
  { query: "", from: "viewport", axis: "inline", pans: false, turns: true },
  { query: "orientation=vertical", from: "viewport", axis: "block", pans: false, turns: true },
  // And what `none` would break: the other axis still reaches the page.
  { query: "", from: "viewport", axis: "block", pans: true, turns: false },
  { query: "orientation=vertical", from: "viewport", axis: "inline", pans: true, turns: false },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ];
  return candidates.find((p) => p && existsSync(p));
}

/** Starts Chrome on a random debugging port and resolves the browser's
 * WebSocket URL from the line it prints on stderr. */
function launchChrome(binary, profile) {
  const proc = spawn(
    binary,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  return new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(() => reject(new Error(`Chrome did not start:\n${log}`)), 15000);
    proc.stderr.on("data", (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve({ proc, browserUrl: match[1] });
      }
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited with ${code}:\n${log}`));
    });
  });
}

/** The smallest CDP client that does the job: one socket, flattened
 * sessions, request/response by id, and a waiter for one-off events. */
function connect(url) {
  const socket = new WebSocket(url);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id !== undefined) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
    } else {
      for (const listener of listeners) listener(msg);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const once = (method, sessionId) =>
    new Promise((resolve) => {
      const listener = (msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          listeners.delete(listener);
          resolve(msg.params);
        }
      };
      listeners.add(listener);
    });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({ send, once, close: () => socket.close() }));
    socket.addEventListener("error", () => reject(new Error(`could not connect to ${url}`)));
  });
}

/** Runs in the page: where the scroller is and which slide is active. */
function read() {
  const scroller = document.querySelector("[data-fixture-scroller]");
  const slides = [...document.querySelectorAll('[data-forte="carousel-slide"]')];
  return {
    left: scroller.scrollLeft,
    top: scroller.scrollTop,
    active: slides.findIndex((s) => s.hasAttribute("data-active")),
  };
}

function label({ query, from, axis }) {
  return `${query || "draggable"} · ${axis} swipe from ${from}`;
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("check:pan needs Google Chrome or Chromium and found neither — set CHROME_PATH.");
    process.exit(1);
  }

  const server = await createServer({
    root: fixture,
    configFile: false,
    logLevel: "error",
    plugins: [react()],
    server: { port: 0, strictPort: false },
  });
  await server.listen();
  const origin = server.resolvedUrls.local[0].replace(/\/$/, "");

  const profile = mkdtempSync(join(tmpdir(), "forte-pan-"));
  const { proc, browserUrl } = await launchChrome(chrome, profile);
  let failed = false;

  try {
    const cdp = await connect(browserUrl);
    for (const c of CASES) {
      // A fresh page per case: a slide one case turned, or a scroll offset
      // it left, must not be what the next case reads as its own.
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      const evaluate = async (expression) => {
        const { result, exceptionDetails } = await cdp.send(
          "Runtime.evaluate",
          { expression, awaitPromise: true, returnByValue: true },
          sessionId,
        );
        if (exceptionDetails) {
          throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
        }
        return result.value;
      };

      const problems = [];
      try {
        await cdp.send("Page.enable", {}, sessionId);
        await cdp.send("Emulation.setDeviceMetricsOverride", DEVICE, sessionId);
        await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, sessionId);
        const loaded = cdp.once("Page.loadEventFired", sessionId);
        await cdp.send("Page.navigate", { url: `${origin}/?${c.query}` }, sessionId);
        await loaded;

        // The component mounts from a module script, so wait for it rather
        // than trusting that `load` came after the first render; then two
        // frames, so the start offset the fixture sets is painted.
        const selector = c.from === "viewport" ? '[data-forte="carousel-viewport"]' : "[data-fixture-outside]";
        const point = await evaluate(`(async () => {
          for (let i = 0; i < 100 && !document.querySelector('${selector}'); i++)
            await new Promise((r) => setTimeout(r, 50));
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const r = document.querySelector('${selector}').getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })()`);
        const before = await evaluate(`(${read})()`);

        await cdp.send(
          "Input.synthesizeScrollGesture",
          {
            x: point.x,
            y: point.y,
            xDistance: c.axis === "inline" ? -DISTANCE : 0,
            yDistance: c.axis === "block" ? -DISTANCE : 0,
            gestureSourceType: "touch",
            speed: 600,
          },
          sessionId,
        );
        // Long enough for the release's settle to commit the new slide.
        await evaluate(`new Promise((r) => setTimeout(r, 400))`);
        const after = await evaluate(`(${read})()`);

        const moved = Math.abs(c.axis === "inline" ? after.left - before.left : after.top - before.top);
        const turned = after.active !== before.active;
        if (before.active < 0) problems.push("no active slide — the fixture did not render");
        if (c.pans && moved < SCROLLED) {
          problems.push(
            c.from === "outside"
              ? `the scroller moved ${moved}px from OUTSIDE the carousel — the harness is broken, nothing was tested`
              : `the scroller moved ${moved}px of a ${DISTANCE}px swipe — the carousel kept a pan it does not use`,
          );
        }
        if (!c.pans && moved !== 0) {
          problems.push(`the scroller moved ${moved}px — the drag's axis leaked to the page`);
        }
        if (c.turns && !turned) problems.push(`the carousel stayed on slide ${before.active} — the drag never got the gesture`);
        if (!c.turns && turned) problems.push(`the carousel turned from slide ${before.active} to ${after.active}`);
      } catch (error) {
        problems.push(error.message);
      }
      await cdp.send("Target.closeTarget", { targetId });

      if (problems.length > 0) {
        failed = true;
        console.error(`✗ ${label(c)}`);
        for (const p of problems) console.error(`    ${p}`);
      } else {
        console.log(`✓ ${label(c)}`);
      }
    }
    cdp.close();
  } finally {
    // Chrome keeps writing to its profile for a moment after the signal, so
    // removing the directory before it has exited races it (ENOTEMPTY).
    const exited = new Promise((resolve) => proc.once("exit", resolve));
    proc.kill();
    await exited;
    await server.close();
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  }

  if (failed) {
    console.error("\nCarousel's viewport claims a touch pan it should not, or loses one it should keep — see the header of this script.");
    process.exit(1);
  }
  console.log(`\nEvery carousel kept exactly the pans it uses.`);
}

await main();
