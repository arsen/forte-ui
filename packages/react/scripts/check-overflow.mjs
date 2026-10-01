/**
 * Overflow gate — a check, not a generator; it writes nothing.
 *
 * AnimatedBorder's `beam` is a 6rem glow riding `offset-path: border-box`,
 * centered ON the edge, so half of it is always outside the host. The root's
 * mask hides that half — but a mask is paint, not layout, and the hidden
 * half still counted as scrollable overflow. On a phone, a card flush against
 * the right edge made the page 435px wide on a 412px screen every time the
 * beam passed that edge; mobile Chrome then widened the layout viewport, so
 * a bottom Drawer was cut off at the right and bottom and every `100vw`
 * background looked narrower than the page. Nothing about it shows in a
 * desktop browser with a mouse, and nothing about it shows in a screenshot
 * taken while the beam is anywhere else, which is why it is a gate rather
 * than a thing to remember to look for.
 *
 * What it does: serve `overflow-fixture/` through Vite (the real component,
 * its real CSS Module, the real theme), open it in headless Chrome emulating
 * a Pixel 7, and for each case below step every running animation through
 * its whole lap — paused, at 200 points — reading the document's
 * `scrollWidth` and `clientWidth` at each. Any point where they differ, or
 * where `clientWidth` is not the device width, fails.
 *
 * It also requires the light to have actually REACHED the viewport edge on
 * at least one step of every beam case. Without that the check passes
 * vacuously the day someone moves the fixture card off the edge, or the
 * beam stops rendering at all.
 *
 * Needs Google Chrome. It looks in the usual places; set CHROME_PATH to
 * point it somewhere else. A missing browser is a failure, not a skip — a
 * gate that silently passes on a machine without one is not a gate.
 *
 *   pnpm --filter @forte-ui/react check:overflow
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const fixture = fileURLToPath(new URL("./overflow-fixture/", import.meta.url));

/** Pixel 7 — the device the bug was reported on. `mobile: true` matters:
 * it is what turns on the meta-viewport handling that widens the layout
 * viewport to fit overflowing content, i.e. the actual failure mode. */
const DEVICE = { width: 412, height: 915, deviceScaleFactor: 2.625, mobile: true };
const STEPS = 200;

const CASES = [
  { query: "variant=beam", reaches: true },
  { query: "variant=beam&reverse=1", reaches: true },
  { query: "variant=beam&width=full", reaches: true },
  { query: "variant=beam&dir=rtl", reaches: true },
  { query: "variant=beam&width=full&dir=rtl", reaches: true },
  // Neither paints outside the root's box, so neither ever overflowed; they
  // are here so a future variant that does cannot slip in beside them.
  { query: "variant=shine", reaches: false },
  { query: "variant=rotate", reaches: false },
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

/** Runs in the page. Steps every animation on the page through one lap and
 * reports the worst document width seen, and whether the beam's box ever
 * reached the inline-end edge of the viewport. Paused animations at a set
 * `currentTime` make this deterministic: no frame timing, no flake. */
function sweep(steps) {
  const animations = document.getAnimations();
  for (const a of animations) a.pause();
  const doc = document.documentElement;
  const rtl = doc.dir === "rtl";
  const beam = document.querySelector('[data-forte="animated-border-beam"]');
  const failures = [];
  let reached = false;
  for (let i = 0; i < steps; i++) {
    for (const a of animations) {
      const { duration, delay } = a.effect.getComputedTiming();
      a.currentTime = delay + (duration * i) / steps;
    }
    const { scrollWidth, clientWidth } = doc;
    if (beam) {
      const r = beam.getBoundingClientRect();
      if (rtl ? r.left < 0 : r.right > clientWidth) reached = true;
    }
    if (scrollWidth !== clientWidth || clientWidth !== window.innerWidth) {
      failures.push({ step: i, scrollWidth, clientWidth, innerWidth: window.innerWidth });
    }
  }
  return { animations: animations.length, reached, failures };
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error(
      "check:overflow needs Google Chrome or Chromium and found neither — set CHROME_PATH.",
    );
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

  const profile = mkdtempSync(join(tmpdir(), "forte-overflow-"));
  const { proc, browserUrl } = await launchChrome(chrome, profile);
  let failed = false;

  try {
    const cdp = await connect(browserUrl);
    for (const { query, reaches } of CASES) {
      // A fresh page per case, so one case's layout-viewport widening cannot
      // leak into the next one's reading.
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      await cdp.send("Page.enable", {}, sessionId);
      await cdp.send("Emulation.setDeviceMetricsOverride", DEVICE, sessionId);
      const loaded = cdp.once("Page.loadEventFired", sessionId);
      await cdp.send("Page.navigate", { url: `${origin}/?${query}` }, sessionId);
      await loaded;

      const { result, exceptionDetails } = await cdp.send(
        "Runtime.evaluate",
        {
          // The component mounts from a module script, so wait for it rather
          // than trusting that `load` came after the first render.
          expression: `(async () => {
            for (let i = 0; i < 100 && !document.querySelector('[data-forte="animated-border"]'); i++)
              await new Promise((r) => setTimeout(r, 50));
            await document.fonts.ready;
            return (${sweep})(${STEPS});
          })()`,
          awaitPromise: true,
          returnByValue: true,
        },
        sessionId,
      );
      await cdp.send("Target.closeTarget", { targetId });

      if (exceptionDetails) {
        failed = true;
        console.error(`✗ ${query}: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
        continue;
      }
      const { animations, reached, failures } = result.value;
      const problems = [];
      if (animations === 0) problems.push("no animations found — the fixture did not render");
      if (reaches && !reached) {
        problems.push("the beam never reached the viewport edge, so nothing was tested");
      }
      if (failures.length > 0) {
        const worst = failures.reduce((a, b) => (b.scrollWidth > a.scrollWidth ? b : a));
        problems.push(
          `the page overflowed on ${failures.length}/${STEPS} steps — worst at step ${worst.step}: ` +
            `scrollWidth ${worst.scrollWidth}, clientWidth ${worst.clientWidth}, ` +
            `innerWidth ${worst.innerWidth} (device ${DEVICE.width})`,
        );
      }
      if (problems.length > 0) {
        failed = true;
        console.error(`✗ ${query}`);
        for (const p of problems) console.error(`    ${p}`);
      } else {
        console.log(`✓ ${query}`);
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
    console.error("\nAnimatedBorder widens the page on a narrow viewport — see the header of this script.");
    process.exit(1);
  }
  console.log(`\nNo case widened a ${DEVICE.width}px viewport.`);
}

await main();
