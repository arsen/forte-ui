/**
 * Fit gate — a check, not a generator; it writes nothing.
 *
 * An `InputGroup` is the same height as the `Input` or `Select.Trigger`
 * beside it at every size and density — that is what its `size` prop
 * promises. Buttons in its addons fill the field's inner height, which at
 * `sm` is 18px, below the 24px SC 2.5.8 floor; `.forte-target` keeps the
 * HIT area at 24px while the visual box tracks the field. Button's own
 * `iconOnly` rule floors the visual box at 24px on both axes, and the group
 * once reset only the width floor: an `sm` search field grew from 28px to
 * 34px the moment its clear (×) button appeared (issue #161). `md` and `lg`
 * hid it, because their inner height is 24px or more already — which is how
 * it shipped, and why it is a gate rather than a thing to remember to look
 * at.
 *
 * What it does: serve `fit-fixture/` through Vite (the real component, its
 * real CSS Module, the real theme), open it in headless Chrome, and for every
 * case — density × size × variant × what the addons hold — check that
 *
 * - the group's border box is exactly the `--forte-control-h-*` of its size,
 *   read off a probe in the same density scope rather than hard-coded;
 * - every addon button's hit area (`.forte-target`'s `::after`) is at least
 *   `--forte-target-min` on both axes, so the fix cannot be "make the
 *   button 24px again and let the field grow".
 *
 * It also requires at least one button to be visually SMALLER than the
 * target minimum. Without that the check passes vacuously the day the `sm`
 * inner height reaches 24px, or the fixture stops rendering `sm` at all —
 * and that is the one case the bug lived in.
 *
 * Needs Google Chrome. It looks in the usual places; set CHROME_PATH to
 * point it somewhere else. A missing browser is a failure, not a skip — a
 * gate that silently passes on a machine without one is not a gate.
 *
 *   pnpm --filter @forte-ui/react check:fit
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const fixture = fileURLToPath(new URL("./fit-fixture/", import.meta.url));

/** Layout lands on fractions of a pixel at `compact` (1.875rem is 30px, but
 * a 1px border on a 2x screen is not always 1px), so compare with a hair of
 * slack — far below the 6px the bug cost. */
const EPSILON = 0.05;

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

/** Runs in the page. Measures every case and returns the raw numbers; the
 * judging happens in Node so a failure can print all of them. */
function measure() {
  return [...document.querySelectorAll("[data-case]")].map((cell) => {
    const height = (el) => el.getBoundingClientRect().height;
    const root = cell.querySelector('[data-forte="input-group"]');
    const buttons = [...cell.querySelectorAll('[data-forte="button"]')].map((button) => {
      const hit = getComputedStyle(button, "::after");
      return {
        label: button.getAttribute("aria-label") ?? button.textContent,
        height: height(button),
        hitWidth: parseFloat(hit.width),
        hitHeight: parseFloat(hit.height),
      };
    });
    return {
      name: cell.dataset.case,
      control: height(cell.querySelector('[data-probe="control"]')),
      target: height(cell.querySelector('[data-probe="target"]')),
      root: root ? height(root) : null,
      buttons,
    };
  });
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("check:fit needs Google Chrome or Chromium and found neither — set CHROME_PATH.");
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

  const profile = mkdtempSync(join(tmpdir(), "forte-fit-"));
  const { proc, browserUrl } = await launchChrome(chrome, profile);
  const failures = [];
  let cases = [];

  try {
    const cdp = await connect(browserUrl);
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: 1600, height: 1200, deviceScaleFactor: 2, mobile: false },
      sessionId,
    );
    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await cdp.send("Page.navigate", { url: `${origin}/` }, sessionId);
    await loaded;

    const { result, exceptionDetails } = await cdp.send(
      "Runtime.evaluate",
      {
        // The fixture mounts from a module script, so wait for it rather
        // than trusting that `load` came after the first render.
        expression: `(async () => {
          for (let i = 0; i < 100 && !document.querySelector('[data-forte="input-group"]'); i++)
            await new Promise((r) => setTimeout(r, 50));
          await document.fonts.ready;
          return (${measure})();
        })()`,
        awaitPromise: true,
        returnByValue: true,
      },
      sessionId,
    );
    await cdp.send("Target.closeTarget", { targetId });
    cdp.close();

    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    }
    cases = result.value;
  } finally {
    // Chrome keeps writing to its profile for a moment after the signal, so
    // removing the directory before it has exited races it (ENOTEMPTY).
    const exited = new Promise((resolve) => proc.once("exit", resolve));
    proc.kill();
    await exited;
    await server.close();
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  }

  if (cases.length === 0) failures.push("no cases found — the fixture did not render");
  let undersized = 0;
  for (const c of cases) {
    const problems = [];
    if (c.root === null) {
      problems.push("no InputGroup rendered");
    } else if (Math.abs(c.root - c.control) > EPSILON) {
      problems.push(`group is ${c.root}px, its control height is ${c.control}px`);
    }
    for (const b of c.buttons) {
      if (b.height < c.target - EPSILON) undersized++;
      if (b.hitWidth < c.target - EPSILON || b.hitHeight < c.target - EPSILON) {
        problems.push(
          `"${b.label}" hit area is ${b.hitWidth}×${b.hitHeight}px, under the ${c.target}px target`,
        );
      }
    }
    if (problems.length > 0) failures.push(`${c.name}: ${problems.join("; ")}`);
  }
  if (cases.length > 0 && undersized === 0) {
    failures.push(
      "no addon button was visually under the target minimum, so the hit-area floor was never tested",
    );
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`✗ ${f}`);
    console.error(
      `\n${failures.length} problem(s) — an InputGroup outgrew its control height or lost its ` +
        "hit area. See the header of this script.",
    );
    process.exit(1);
  }
  console.log(
    `✓ ${cases.length} InputGroups at their control height; ${undersized} addon buttons under ` +
      "the target minimum, every hit area at it or above.",
  );
}

await main();
