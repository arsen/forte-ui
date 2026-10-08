/**
 * Document-clock gate — a check, not a generator; it writes nothing.
 *
 * `Skeleton` and `Shimmer` loop on plain CSS animations, and a CSS animation
 * starts at its first keyframe when its element is first styled. So a
 * placeholder replaced by an identical one — a route's `loading.tsx` handing
 * over to the page's own `<Suspense fallback>`, a key change, a swap between
 * boundaries — restarted mid-loop: the shimmer band jumped back to the edge
 * halfway across. Both components now pin their loops to the document
 * timeline (`src/internal/document-clock.ts`), and this is what holds them
 * there. Nothing about it shows in a screenshot, and a restart lasts one
 * frame in a recording — which is why it is a gate.
 *
 * What it does: serve `clock-fixture/` through Vite (the real components,
 * their real CSS Modules, the real theme), open it in headless Chrome, and
 *
 * - SWAP: mount A, let it run to mid-cycle, replace it with an identical B in
 *   one commit, and compare A on the last frame it was painted in with B on
 *   the first frame it is. Every loop must have advanced by exactly the time
 *   between those frames — not restarted. `Shimmer once` is the inverse: a
 *   single pass pinned to the document's time zero would be over before it
 *   was painted, so B must start from the beginning.
 * - CHANGE: the prop changes that start a loop without a key change —
 *   `animation`, `loading` coming back, `active`, `once` going false — must
 *   be pinned too.
 * - UNIT: the helper on its own, against real animations it must tell apart
 *   (a descendant's loop, a finite run, a paused loop, a transition, an
 *   `animate()` loop, a scroll-driven one), a mocked `getAnimations`, and an
 *   environment with no Web Animations API.
 *
 * Headless Chrome rather than a background tab or a hidden pane, and not as
 * a matter of taste: a hidden document produces no frames, and its timeline's
 * `currentTime` stands still, so every phase reads as a restart.
 *
 * Needs Google Chrome. It looks in the usual places; set CHROME_PATH to
 * point it somewhere else. A missing browser is a failure, not a skip — a
 * gate that silently passes on a machine without one is not a gate.
 *
 *   pnpm --filter @forte-ui/react check:clock
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const fixture = fileURLToPath(new URL("./clock-fixture/", import.meta.url));

/** How far a loop may drift from the clock, in ms. The timeline's time is
 * coarsened, and a restart is off by a whole cycle's worth of phase, so the
 * margin can afford to be tiny. */
const TOLERANCE = 1;

/** `primary` is the loop the swap waits on, and `window` the phase it must be
 * in first: mid-travel, where a restart cannot pass for a loop that happened
 * to be at its start anyway. */
const SWAPS = [
  { name: "Skeleton shimmer", scene: { animation: "shimmer" }, primary: "sweep", window: [0.3, 0.5] },
  { name: "Skeleton pulse", scene: { animation: "pulse" }, primary: "pulse", window: [0.3, 0.7] },
  {
    name: "Skeleton shimmer, rtl",
    query: "dir=rtl",
    scene: { animation: "shimmer" },
    primary: "sweep",
    window: [0.3, 0.5],
  },
  // Under reduced motion the band is hidden and the breathe is the cue, so
  // that is the loop that must not restart.
  {
    name: "Skeleton shimmer, reduced motion",
    query: "motion=reduce",
    scene: { animation: "shimmer" },
    primary: "breathe",
    window: [0.3, 0.7],
  },
  { name: "Shimmer", scene: { kind: "shimmer" }, primary: "sweep", window: [0.3, 0.7] },
  {
    name: "Shimmer once",
    scene: { kind: "shimmer", once: true },
    primary: "sweep",
    window: [0.3, 0.6],
    restarts: true,
  },
];

const CHANGES = [
  { name: "Skeleton animation pulse → shimmer", from: { animation: "pulse" }, steps: [{ animation: "shimmer" }] },
  { name: "Skeleton animation none → shimmer", from: { animation: "none" }, steps: [{ animation: "shimmer" }] },
  { name: "Skeleton loading off → on", from: {}, steps: [{ loading: false }, { loading: true }] },
  { name: "Shimmer active off → on", from: { kind: "shimmer", active: false }, steps: [{ active: true }] },
  { name: "Shimmer once → loop", from: { kind: "shimmer", once: true }, steps: [{ once: false }] },
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

/** A fresh page per case, so one case's animations cannot leak into the
 * next one's reading. Resolves with what `expression` returned in it. */
async function run(cdp, url, expression) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  try {
    await cdp.send("Page.enable", {}, sessionId);
    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await cdp.send("Page.navigate", { url }, sessionId);
    await loaded;
    const { result, exceptionDetails } = await cdp.send(
      "Runtime.evaluate",
      {
        // The fixture installs `__fx` from a module script, so wait for it
        // rather than trusting that `load` came after it ran.
        expression: `(async () => {
          for (let i = 0; i < 100 && !window.__fx?.ready(); i++)
            await new Promise((r) => setTimeout(r, 50));
          return ${expression};
        })()`,
        awaitPromise: true,
        returnByValue: true,
      },
      sessionId,
    );
    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    }
    return result.value;
  } finally {
    await cdp.send("Target.closeTarget", { targetId });
  }
}

const key = (loop) => `${loop.name}${loop.pseudo ?? ""}`;
const phase = (loop) => (loop.currentTime % loop.duration) / loop.duration;
/** The short form of a hashed keyframe name, for the report. */
const label = (loop) =>
  `${loop.name.match(/(forte-[a-z-]+?)(?:_|$)/)?.[1] ?? loop.name}${loop.pseudo ?? ""}`;

/** Judges one swap: what went wrong, and the phases to print either way. */
function judgeSwap({ remounted, t1, t2, before, after }, { primary, restarts }) {
  const problems = [];
  const report = [];
  if (!remounted) problems.push("B is the same element as A, so nothing was replaced");
  const loops = before.filter((l) => l.infinite || restarts);
  if (!loops.some((l) => l.name.includes(primary))) problems.push(`A has no "${primary}" loop`);

  for (const a of loops) {
    const b = after.find((l) => key(l) === key(a));
    if (!b) {
      problems.push(`${label(a)}: B has no such animation`);
      continue;
    }
    report.push(`${label(a)} ${phase(a).toFixed(3)} → ${phase(b).toFixed(3)}`);
    if (restarts) {
      // Started over, and still running — not pinned into having finished.
      if (b.playState !== "running" || b.currentTime > t2 - t1 + TOLERANCE) {
        problems.push(
          `${label(a)}: B should start its single pass from the beginning, but is at ` +
            `${b.currentTime.toFixed(1)}ms and ${b.playState}`,
        );
      }
      continue;
    }
    const drift = (((b.currentTime - a.currentTime - (t2 - t1)) % a.duration) + a.duration) % a.duration;
    const off = Math.min(drift, a.duration - drift);
    if (off > TOLERANCE) {
      problems.push(
        `${label(a)}: B is ${off.toFixed(1)}ms off A's clock — phase ${phase(a).toFixed(3)} on A's ` +
          `last frame, ${phase(b).toFixed(3)} on B's first, ${(t2 - t1).toFixed(1)}ms apart`,
      );
    }
  }
  return { problems, report };
}

function judgeChange({ t, loops }) {
  if (!loops) return ["nothing rendered"];
  const infinite = loops.filter((l) => l.infinite);
  if (infinite.length === 0) return ["no loop running after the change, so nothing was tested"];
  return infinite
    .filter((l) => l.startTime !== 0 || Math.abs(l.currentTime - t) > TOLERANCE)
    .map((l) => `${label(l)} is not on the document clock: start time ${l.startTime}`);
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("check:clock needs Google Chrome or Chromium and found neither — set CHROME_PATH.");
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

  const profile = mkdtempSync(join(tmpdir(), "forte-clock-"));
  const { proc, browserUrl } = await launchChrome(chrome, profile);
  let failed = false;
  const result = (name, problems, detail) => {
    if (problems.length > 0) {
      failed = true;
      console.error(`✗ ${name}${detail ? `  (${detail})` : ""}`);
      for (const p of problems) console.error(`    ${p}`);
    } else {
      console.log(`✓ ${name}${detail ? `  (${detail})` : ""}`);
    }
  };

  try {
    const cdp = await connect(browserUrl);

    for (const swap of SWAPS) {
      const url = `${origin}/${swap.query ? `?${swap.query}` : ""}`;
      try {
        const value = await run(
          cdp,
          url,
          `window.__fx.swap(${JSON.stringify(swap.scene)}, ${JSON.stringify(swap.primary)}, ${JSON.stringify(swap.window)})`,
        );
        const { problems, report } = judgeSwap(value, swap);
        result(`swap: ${swap.name}`, problems, report.join(", "));
      } catch (error) {
        result(`swap: ${swap.name}`, [error.message]);
      }
    }

    for (const change of CHANGES) {
      try {
        const value = await run(
          cdp,
          `${origin}/`,
          `window.__fx.change(${JSON.stringify(change.from)}, ${JSON.stringify(change.steps)})`,
        );
        result(`change: ${change.name}`, judgeChange(value));
      } catch (error) {
        result(`change: ${change.name}`, [error.message]);
      }
    }

    try {
      for (const { name, ok, detail } of await run(cdp, `${origin}/`, "window.__fx.unit()")) {
        result(`unit: ${name}`, ok ? [] : [`got ${detail}`]);
      }
    } catch (error) {
      result("unit", [error.message]);
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
    console.error("\nA looping placeholder left the document clock — see the header of this script.");
    process.exit(1);
  }
  console.log("\nEvery loop carried on across its swap.");
}

await main();
