/**
 * Reorderable gate — a check, not a generator; it writes nothing.
 *
 * A reorderable list is the component with the most ways to be quietly
 * wrong: a drag that also clicks the row it ended on, a long press that opens
 * the context menu under the finger, a nested list that drags its parent, a
 * keyboard drag whose arrow keys also nudge the canvas behind it, a drop that
 * jumps. None of it shows in a screenshot, and most of it needs a finger or a
 * screen reader to notice — so it is driven here, through real input, instead
 * of remembered.
 *
 * What it does: serve `reorderable-fixture/` through Vite (the real component,
 * its real CSS Module, the real theme), open it in headless Chrome, and for
 * each case below drive a mouse, a finger or the keyboard over the Chrome
 * DevTools Protocol, then assert on what the list REPORTED — the fixture logs
 * every callback, every row click, every announcement and every keydown the
 * page's own listeners saw. Each case gets a fresh page, and any exception or
 * console error on it fails the case.
 *
 * Needs Google Chrome. It looks in the usual places; set CHROME_PATH to
 * point it somewhere else. A missing browser is a failure, not a skip — a
 * gate that silently passes on a machine without one is not a gate.
 *
 *   pnpm --filter @forte-ui/react check:reorderable
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const fixture = fileURLToPath(new URL("./reorderable-fixture/", import.meta.url));
const VIEWPORT = { width: 800, height: 900, deviceScaleFactor: 1, mobile: false };
const STEP_TIMEOUT = 10000;
/* Long enough for the slide and the lift fade to finish and the settle
 * timer to clear the inline styles behind them. */
const SETTLE = 450;

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
  const on = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({ send, once, on, close: () => socket.close() }));
    socket.addEventListener("error", () => reject(new Error(`could not connect to ${url}`)));
  });
}

/** A step that never answers fails with its own name instead of hanging. */
function timed(label, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out: ${label}`)), STEP_TIMEOUT)),
  ]);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const KEYS = {
  " ": { code: "Space", keyCode: 32, text: " " },
  Enter: { code: "Enter", keyCode: 13, text: "\r" },
  Escape: { code: "Escape", keyCode: 27 },
  Tab: { code: "Tab", keyCode: 9 },
  Delete: { code: "Delete", keyCode: 46 },
  Home: { code: "Home", keyCode: 36 },
  End: { code: "End", keyCode: 35 },
  ArrowUp: { code: "ArrowUp", keyCode: 38 },
  ArrowDown: { code: "ArrowDown", keyCode: 40 },
  ArrowLeft: { code: "ArrowLeft", keyCode: 37 },
  ArrowRight: { code: "ArrowRight", keyCode: 39 },
};

/** Everything a case needs, bound to one page. */
function driver(cdp, sessionId) {
  const send = (method, params) => timed(method, cdp.send(method, params, sessionId));
  let buttons = 0;
  const t = {
    /** Runs `fn` in the page with JSON-serializable arguments. */
    async eval(fn, ...args) {
      const { result, exceptionDetails } = await send("Runtime.evaluate", {
        expression: `(${fn})(${args.map((a) => JSON.stringify(a)).join(",")})`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (exceptionDetails) {
        throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      }
      return result.value;
    },
    rect(selector) {
      return t.eval((s) => {
        const el = document.querySelector(s);
        if (!el) throw new Error(`no element for ${s}`);
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
      }, selector);
    },
    log: () => t.eval(() => window.__log),
    clearLog: () => t.eval(() => void (window.__log.length = 0)),
    order: (list = "outer") =>
      t.eval(
        (l) =>
          [...document.querySelectorAll(`[data-testid="list-${l}"] > [data-forte="reorderable-item"]`)].map(
            (el) => el.dataset.id,
          ),
        list,
      ),
    mouse(type, x, y) {
      if (type === "mousePressed") buttons = 1;
      if (type === "mouseReleased") buttons = 0;
      return send("Input.dispatchMouseEvent", {
        type,
        x,
        y,
        button: type === "mouseMoved" && buttons === 0 ? "none" : "left",
        buttons,
        clickCount: type === "mouseMoved" ? 0 : 1,
      });
    },
    /** Press at `from`, travel to `to` in `steps` moves a frame apart, hold,
     * release. */
    async drag(from, to, { steps = 12, hold = 0, release = true } = {}) {
      await t.mouse("mousePressed", from.x, from.y);
      for (let i = 1; i <= steps; i += 1) {
        await t.mouse("mouseMoved", from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
        await sleep(16);
      }
      if (hold) await sleep(hold);
      if (release) await t.mouse("mouseReleased", to.x, to.y);
    },
    touch(type, x, y) {
      return send("Input.dispatchTouchEvent", {
        type,
        touchPoints: type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
      });
    },
    async swipe(from, to, { wait = 0, steps = 10 } = {}) {
      await t.touch("touchStart", from.x, from.y);
      if (wait) await sleep(wait);
      for (let i = 1; i <= steps; i += 1) {
        await t.touch("touchMove", from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
        await sleep(16);
      }
      await t.touch("touchEnd");
    },
    async key(key) {
      const k = KEYS[key];
      if (!k) throw new Error(`unknown key ${key}`);
      const base = { key, code: k.code, windowsVirtualKeyCode: k.keyCode, nativeVirtualKeyCode: k.keyCode };
      await send("Input.dispatchKeyEvent", { type: k.text ? "keyDown" : "rawKeyDown", ...base, ...(k.text ? { text: k.text } : {}) });
      await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
      await sleep(30);
    },
    focus: (selector) => t.eval((s) => document.querySelector(s).focus(), selector),
  };
  return t;
}

class Failure extends Error {}
function expect(condition, message) {
  if (!condition) throw new Failure(message);
}
const of = (log, type, extra = {}) =>
  log.filter((e) => e.type === type && Object.entries(extra).every(([k, v]) => e[k] === v));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const item = (id) => `[data-forte="reorderable-item"][data-id="${id}"]`;
const testid = (id) => `[data-testid="${id}"]`;

/** Inline positions are the engine's working state; once a drop has settled
 * there must be none left on any item. */
async function expectSettled(t, message = "items still carry inline translate after the drop settled") {
  const leftovers = await t.eval(() =>
    [...document.querySelectorAll('[data-forte="reorderable-item"]')]
      .filter((el) => el.style.translate || el.style.transition)
      .map((el) => el.dataset.id),
  );
  expect(leftovers.length === 0, `${message}: ${leftovers.join(", ")}`);
  const reordering = await t.eval(() => document.querySelector('[data-forte="reorderable"][data-reordering]') !== null);
  expect(!reordering, "the list still says data-reordering after the drag ended");
}

const CASES = [
  {
    name: "1 basic vertical list — a mouse drag moves an item and reports the move",
    query: "",
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      await t.drag({ x: a.cx, y: a.cy }, { x: a.cx, y: c.cy });
      await sleep(SETTLE);
      const log = await t.log();
      const [change] = of(log, "change");
      expect(change, "no onValueChange after dragging A onto C");
      expect(same(change.next, ["B", "C", "A", "D", "E"]), `wrong order: ${JSON.stringify(change.next)}`);
      expect(
        change.id === "A" && change.overId === "C" && change.placement === "after" && change.from === 0 && change.to === 2,
        `wrong details: ${JSON.stringify(change)}`,
      );
      expect(change.pointerType === "mouse", `pointerType ${change.pointerType}`);
      expect(of(log, "start").length === 1 && of(log, "end").length === 1, "expected one start and one end");
      expect(of(log, "click").length === 0, `the drop also clicked a row: ${JSON.stringify(of(log, "click"))}`);
      expect(same(await t.order(), ["B", "C", "A", "D", "E"]), "the DOM did not follow the new value");
      const landed = await t.rect(item("A"));
      expect(Math.abs(landed.y - c.y) < 1.5, `A settled at ${landed.y}, expected ${c.y}`);
      await expectSettled(t);
      const announced = of(log, "announce").map((e) => e.text);
      expect(
        announced.some((text) => text.includes("dropped at position 3 of 5")),
        `no drop announcement: ${JSON.stringify(announced)}`,
      );
    },
  },
  {
    name: "1b a click without movement is still a click, and starts nothing",
    query: "",
    async run(t) {
      const b = await t.rect(item("B"));
      await t.mouse("mousePressed", b.cx, b.cy);
      await t.mouse("mouseMoved", b.cx + 2, b.cy + 1);
      await t.mouse("mouseReleased", b.cx + 2, b.cy + 1);
      await sleep(100);
      const log = await t.log();
      expect(of(log, "click", { id: "B" }).length === 1, "the click on B did not reach the row");
      expect(of(log, "start").length === 0, "a 2px press started a drag");
    },
  },
  {
    name: "1c a refused change animates back and leaves the order alone",
    query: "ignore=1",
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      await t.drag({ x: a.cx, y: a.cy }, { x: a.cx, y: c.cy });
      await sleep(SETTLE);
      const log = await t.log();
      expect(of(log, "change").length === 1, "the move was not offered");
      expect(same(await t.order(), ["A", "B", "C", "D", "E"]), "the DOM moved without the app applying it");
      const back = await t.rect(item("A"));
      expect(Math.abs(back.y - a.y) < 1.5, `A came to rest at ${back.y}, not back at ${a.y}`);
      await expectSettled(t);
    },
  },
  {
    name: "1d an item caught while it is still settling is held where it was caught",
    query: "",
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      await t.drag({ x: a.cx, y: a.cy }, { x: a.cx, y: c.cy + a.height * 0.6 });
      // A few frames into the settle: A is still sliding toward its slot.
      await sleep(40);
      const caught = await t.rect(item("A"));
      const slot = await t.eval((s) => {
        const el = document.querySelector(s);
        const r = el.getBoundingClientRect();
        const [, y = "0px"] = getComputedStyle(el).translate.split(" ");
        return r.y - (parseFloat(y) || 0);
      }, item("A"));
      expect(Math.abs(caught.y - slot) > 4, `A had already settled (${caught.y} vs slot ${slot}); nothing was tested`);
      await t.mouse("mousePressed", caught.cx, caught.cy);
      await t.mouse("mouseMoved", caught.cx, caught.cy + 6);
      await t.mouse("mouseMoved", caught.cx, caught.cy + 8);
      await sleep(50);
      const held = await t.rect(item("A"));
      await t.mouse("mouseReleased", caught.cx, caught.cy + 8);
      await sleep(SETTLE);
      expect(
        Math.abs(held.y - (caught.y + 8)) < 2.5,
        `A jumped when caught mid-settle: drawn at ${caught.y}, held at ${held.y}, expected ${caught.y + 8}`,
      );
    },
  },
  {
    name: "2 rows with buttons — a press on a control never drags, and the Menu still opens",
    query: "handles=1&controls=1",
    async run(t) {
      const button = await t.rect(testid("button-A"));
      await t.drag({ x: button.cx, y: button.cy }, { x: button.cx, y: button.cy + 90 });
      await sleep(100);
      let log = await t.log();
      expect(of(log, "start").length === 0, "pressing the row's Button started a drag");

      const menu = await t.rect(testid("menu-B"));
      await t.mouse("mousePressed", menu.cx, menu.cy);
      await t.mouse("mouseReleased", menu.cx, menu.cy);
      await sleep(200);
      log = await t.log();
      expect(of(log, "menu", { id: "B", open: true }).length === 1, "the Menu trigger inside the row did not open");
      expect(of(log, "start").length === 0, "the Menu trigger started a drag");
    },
  },
  {
    name: "2b rows with buttons — the handle and the row body both drag",
    query: "handles=1&controls=1",
    async run(t) {
      const handle = await t.rect(testid("handle-B"));
      const d = await t.rect(item("D"));
      await t.drag({ x: handle.cx, y: handle.cy }, { x: handle.cx, y: d.cy });
      await sleep(SETTLE);
      let log = await t.log();
      const [first] = of(log, "change");
      expect(first && first.id === "B" && first.to === 3, `handle drag: ${JSON.stringify(first)}`);

      /* UPWARD, on purpose. Moving an item down makes React re-insert the
       * dragged row's own node, and Chrome forgets a press whose node left
       * the document — so a drop that moves down never clicks, capture or
       * not. Moving up, React moves the neighbors instead, the pressed node
       * stays put, and only the root's pointer capture keeps the release
       * from clicking the row: this is the drag that proves it. */
      await t.clearLog();
      const text = await t.rect(testid("text-E"));
      const a = await t.rect(item("A"));
      await t.drag({ x: text.cx, y: text.cy }, { x: text.cx, y: a.cy });
      await sleep(SETTLE);
      log = await t.log();
      const [second] = of(log, "change");
      expect(second && second.id === "E" && second.to === 0, `row-body drag: ${JSON.stringify(second)}`);
      expect(of(log, "click").length === 0, "the row-body drag also clicked a row");
    },
  },
  {
    name: "3 nested list — an inner drag never moves the outer list",
    query: "nested=1&handles=1",
    async run(t) {
      const inner = await t.rect(testid("text-BA"));
      const last = await t.rect(item("BC"));
      await t.drag({ x: inner.cx, y: inner.cy }, { x: inner.cx, y: last.cy });
      await sleep(SETTLE);
      let log = await t.log();
      const changes = of(log, "change");
      expect(changes.length === 1 && changes[0].list === "inner", `inner drag reported ${JSON.stringify(changes)}`);
      expect(same(changes[0].next, ["BB", "BC", "BA"]), `inner order ${JSON.stringify(changes[0].next)}`);
      expect(of(log, "start", { list: "outer" }).length === 0, "the outer list started a drag too");
      expect(same(await t.order(), ["A", "B", "C", "D", "E"]), "the outer list moved");

      await t.clearLog();
      const handle = await t.rect(testid("handle-A"));
      const b = await t.rect(item("B"));
      await t.drag({ x: handle.cx, y: handle.cy }, { x: handle.cx, y: b.y + b.height - 4 });
      await sleep(SETTLE);
      log = await t.log();
      const outer = of(log, "change", { list: "outer" });
      expect(outer.length === 1 && outer[0].id === "A" && outer[0].to === 1, `outer drag: ${JSON.stringify(outer)}`);
    },
  },
  {
    name: "4 100 items in a ScrollArea — dragging to the edge scrolls the viewport",
    query: "scroll=1&count=100",
    async run(t) {
      const viewport = await t.rect(testid("viewport"));
      const start = await t.rect(item("I2"));
      await t.drag({ x: start.cx, y: start.cy }, { x: start.cx, y: viewport.y + viewport.height - 6 }, {
        hold: 1500,
        release: false,
      });
      const scrolled = await t.eval(() => document.querySelector('[data-testid="viewport"]').scrollTop);
      // Keep the pointer alive at the edge, then drop.
      await t.mouse("mouseMoved", start.cx, viewport.y + viewport.height - 5);
      await t.mouse("mouseReleased", start.cx, viewport.y + viewport.height - 5);
      await sleep(SETTLE);
      expect(scrolled > 300, `the viewport scrolled only ${scrolled}px in 1.5s at its edge`);
      const log = await t.log();
      const [change] = of(log, "change");
      expect(change && change.id === "I2" && change.to > 12, `the drop after auto-scroll: ${JSON.stringify(change)}`);
      await expectSettled(t);
    },
  },
  {
    name: "4b a finger swiping a row with a handle scrolls the list instead of dragging",
    query: "scroll=1&count=100&handles=1",
    touch: true,
    async run(t) {
      const text = await t.rect(testid("text-I4"));
      await t.swipe({ x: text.cx, y: text.cy }, { x: text.cx, y: text.cy - 160 }, { steps: 12 });
      await sleep(300);
      const top = await t.eval(() => document.querySelector('[data-testid="viewport"]').scrollTop);
      const log = await t.log();
      expect(of(log, "start").length === 0, "a swipe across a row started a drag");
      expect(top > 40, `the list did not scroll under the finger (scrollTop ${top})`);
    },
  },
  {
    name: "5 ContextMenu on items — a long press on the handle drags and never opens the menu",
    query: "handles=1&contextmenu=1",
    touch: true,
    async run(t) {
      const handle = await t.rect(testid("handle-B"));
      const d = await t.rect(item("D"));
      await t.touch("touchStart", handle.cx, handle.cy);
      await sleep(800);
      for (let i = 1; i <= 10; i += 1) {
        await t.touch("touchMove", handle.cx, handle.cy + ((d.cy - handle.cy) * i) / 10);
        await sleep(16);
      }
      await t.touch("touchEnd");
      await sleep(SETTLE);
      const log = await t.log();
      expect(of(log, "context", { open: true }).length === 0, "the context menu opened under the handle");
      const [change] = of(log, "change");
      expect(change && change.id === "B" && change.to === 3 && change.pointerType === "touch", `touch drag: ${JSON.stringify(change)}`);
    },
  },
  {
    name: "5b ContextMenu on items — a long press on the row body still opens the menu",
    query: "handles=1&contextmenu=1",
    touch: true,
    async run(t) {
      const text = await t.rect(testid("text-C"));
      await t.touch("touchStart", text.cx, text.cy);
      await sleep(800);
      await t.touch("touchEnd");
      await sleep(200);
      const log = await t.log();
      expect(of(log, "context", { id: "C", open: true }).length === 1, "a long press on the row did not open its menu");
      expect(of(log, "start").length === 0, "a long press on a row with a handle started a drag");
    },
  },
  {
    name: "5c a finger held on an item without a handle picks it up",
    query: "",
    touch: true,
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      await t.swipe({ x: a.cx, y: a.cy }, { x: a.cx, y: c.cy }, { wait: 400 });
      await sleep(SETTLE);
      let log = await t.log();
      const [change] = of(log, "change");
      expect(change && change.id === "A" && change.to === 2 && change.pointerType === "touch", `hold drag: ${JSON.stringify(change)}`);

      await t.clearLog();
      const b = await t.rect(item("B"));
      await t.swipe({ x: b.cx, y: b.cy }, { x: b.cx, y: b.cy + 80 });
      await sleep(200);
      log = await t.log();
      expect(of(log, "start").length === 0, "a finger that moved at once picked the item up");
    },
  },
  {
    name: "6 horizontal list, left to right",
    query: "orientation=horizontal",
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      expect(c.x > a.x, "the row does not run left to right");
      await t.drag({ x: a.cx, y: a.cy }, { x: c.cx, y: a.cy });
      await sleep(SETTLE);
      const [change] = of(await t.log(), "change");
      expect(change && change.id === "A" && change.to === 2, `LTR drag: ${JSON.stringify(change)}`);
      await expectSettled(t);
    },
  },
  {
    name: "6b horizontal list, right to left",
    query: "orientation=horizontal&dir=rtl&handles=1",
    async run(t) {
      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      expect(c.x < a.x, "the row does not run right to left");
      await t.drag({ x: a.cx, y: a.cy }, { x: c.cx, y: a.cy });
      await sleep(SETTLE);
      let [change] = of(await t.log(), "change");
      expect(change && change.id === "A" && change.to === 2, `RTL drag: ${JSON.stringify(change)}`);

      // The order is now B, C, A, D, E. ArrowLeft points toward the end in
      // a right-to-left row.
      await t.clearLog();
      await t.focus(testid("handle-B"));
      await t.key(" ");
      await t.key("ArrowLeft");
      await t.key(" ");
      await sleep(SETTLE);
      [change] = of(await t.log(), "change");
      expect(change && change.id === "B" && change.from === 0 && change.to === 1, `RTL keyboard: ${JSON.stringify(change)}`);
    },
  },
  {
    name: "7 a disabled item cannot be picked up, but others pass over it",
    query: "disabled=B",
    async run(t) {
      const b = await t.rect(item("B"));
      const d = await t.rect(item("D"));
      await t.drag({ x: b.cx, y: b.cy }, { x: b.cx, y: d.cy });
      await sleep(200);
      let log = await t.log();
      expect(of(log, "start").length === 0, "the disabled item was picked up");

      const a = await t.rect(item("A"));
      const c = await t.rect(item("C"));
      await t.drag({ x: a.cx, y: a.cy }, { x: a.cx, y: c.cy });
      await sleep(SETTLE);
      log = await t.log();
      const [change] = of(log, "change");
      expect(change && same(change.next, ["B", "C", "A", "D", "E"]), `passing over B: ${JSON.stringify(change)}`);
    },
  },
  {
    name: "7b handleOnly — the mouse needs the handle",
    query: "handleOnly=1&handles=1",
    async run(t) {
      const text = await t.rect(testid("text-A"));
      const c = await t.rect(item("C"));
      await t.drag({ x: text.cx, y: text.cy }, { x: text.cx, y: c.cy });
      await sleep(200);
      expect(of(await t.log(), "start").length === 0, "a press on the row body dragged under handleOnly");
      const handle = await t.rect(testid("handle-A"));
      await t.drag({ x: handle.cx, y: handle.cy }, { x: handle.cx, y: c.cy });
      await sleep(SETTLE);
      const [change] = of(await t.log(), "change");
      expect(change && change.id === "A" && change.to === 2, `handle drag: ${JSON.stringify(change)}`);
    },
  },
  {
    name: "8 keyboard drag — moves, announces, keeps focus, and honors the shortcut contract",
    query: "handles=1",
    async run(t) {
      const label = await t.eval(() => {
        const h = document.querySelector('[data-testid="handle-A"]');
        const described = document.getElementById(h.getAttribute("aria-describedby").split(" ")[0]);
        return { name: h.getAttribute("aria-label"), described: described?.textContent ?? "" };
      });
      expect(label.name === "Reorder Item A", `handle name: ${label.name}`);
      expect(label.described.includes("Space or Enter"), `handle instructions: ${label.described}`);

      await t.focus(testid("handle-A"));
      await t.key(" ");
      await t.key("ArrowDown");
      await t.key("ArrowDown");
      await t.key("Delete");
      await t.key(" ");
      await sleep(SETTLE);
      let log = await t.log();
      const [change] = of(log, "change");
      expect(
        change && change.id === "A" && change.from === 0 && change.to === 2 && change.pointerType === "keyboard",
        `keyboard drop: ${JSON.stringify(change)}`,
      );
      const announced = of(log, "announce").map((e) => e.text);
      for (const expected of ["Picked up Item A. Position 1 of 5.", "Item A, position 2 of 5.", "Item A, position 3 of 5.", "Item A dropped at position 3 of 5."]) {
        expect(announced.includes(expected), `missing announcement "${expected}" in ${JSON.stringify(announced)}`);
      }
      // Every key the drag handled was already prevented when the page's
      // first document listener and its window listener saw it.
      for (const type of ["doc-key", "win-key"]) {
        const keys = of(log, type);
        expect(keys.length === 5, `${type} saw ${keys.length} keydowns — something stopped one`);
        const leaked = keys.filter((k) => !k.prevented).map((k) => k.key);
        expect(leaked.length === 0, `${type} saw unprevented keys: ${JSON.stringify(leaked)}`);
      }
      const focused = await t.eval(() => document.activeElement?.getAttribute("data-testid"));
      expect(focused === "handle-A", `focus after the drop: ${focused}`);

      await t.clearLog();
      await t.key(" ");
      await t.key("ArrowUp");
      await t.key("Escape");
      await sleep(SETTLE);
      log = await t.log();
      expect(of(log, "change").length === 0, "Escape still changed the order");
      expect(of(log, "cancel", { reason: "escape" }).length === 1, "no cancel with reason escape");
      expect(same(await t.order(), ["B", "C", "A", "D", "E"]), "the canceled drag moved something");
      expect(
        of(log, "announce").some((e) => e.text.startsWith("Reorder canceled.")),
        "no cancel announcement",
      );
      await expectSettled(t);
    },
  },
  {
    name: "8b Tab during a keyboard drag cancels it",
    query: "handles=1",
    async run(t) {
      await t.focus(testid("handle-A"));
      await t.key(" ");
      await t.key("ArrowDown");
      await t.key("Tab");
      await sleep(SETTLE);
      const log = await t.log();
      expect(of(log, "cancel", { reason: "interrupted" }).length === 1, "Tab did not cancel the drag");
      expect(of(log, "change").length === 0, "Tab dropped the item");
      await expectSettled(t);
    },
  },
  {
    name: "9 an item removed from outside mid-drag cancels quietly",
    query: "",
    async run(t) {
      const c = await t.rect(item("C"));
      await t.drag({ x: c.cx, y: c.cy }, { x: c.cx, y: c.cy + 20 }, { release: false });
      await t.eval(() => window.__fx.remove("C"));
      await sleep(120);
      let log = await t.log();
      expect(of(log, "cancel", { id: "C", reason: "removed" }).length === 1, "no cancel with reason removed");
      await t.mouse("mouseMoved", c.cx, c.cy + 60);
      await t.mouse("mouseReleased", c.cx, c.cy + 60);
      await sleep(SETTLE);
      log = await t.log();
      expect(of(log, "change").length === 0 && of(log, "end").length === 0, "the removed item still dropped");
      expect(same(await t.order(), ["A", "B", "D", "E"]), "the list is not what the app rendered");
      await expectSettled(t);
    },
  },
  {
    name: "9b an item added above mid-drag does not move the dragged one",
    query: "",
    async run(t) {
      const c = await t.rect(item("C"));
      await t.drag({ x: c.cx, y: c.cy }, { x: c.cx, y: c.cy + 10 }, { release: false });
      await sleep(50);
      const before = await t.rect(item("C"));
      const d = await t.rect(item("D"));
      await t.eval(() => window.__fx.insertTop("Z"));
      await sleep(50);
      const after = await t.rect(item("C"));
      expect(Math.abs(after.y - before.y) < 1, `the dragged item jumped ${after.y - before.y}px when Z arrived`);
      // The neighbors made room for Z: D, which was below C, is a row lower.
      const moved = await t.eval(
        (s) => document.querySelector(s).getBoundingClientRect().y,
        item("D"),
      );
      await sleep(SETTLE);
      const dNow = await t.rect(item("D"));
      expect(dNow.y > d.y + d.height / 2, `D did not make room for Z (${d.y} → ${dNow.y}, mid-slide ${moved})`);
      // Measured AFTER the insert: E is a row lower than it was.
      const e = await t.rect(item("E"));
      for (let i = 1; i <= 8; i += 1) {
        await t.mouse("mouseMoved", c.cx, c.cy + 10 + ((e.cy - c.cy - 10) * i) / 8);
        await sleep(16);
      }
      await t.mouse("mouseReleased", c.cx, e.cy);
      await sleep(SETTLE);
      const [change] = of(await t.log(), "change");
      expect(change && same(change.next, ["Z", "A", "B", "D", "E", "C"]), `drop after the insert: ${JSON.stringify(change)}`);
      await expectSettled(t);
    },
  },
  {
    name: "10 preview — a copy follows the pointer in a portal while the item holds its place",
    query: "preview=1&scroll=1&count=30",
    async run(t) {
      const a = await t.rect(item("I1"));
      const three = await t.rect(item("I3"));
      // Two rows down: the leading edge passes I3's center, not I4's.
      const travel = three.cy - a.cy;
      await t.drag({ x: a.cx, y: a.cy }, { x: a.cx, y: a.cy + travel }, { release: false });
      await sleep(80);
      const state = await t.eval(() => {
        const preview = document.querySelector('[data-forte="reorderable-preview"]');
        const item = document.querySelector('[data-forte="reorderable-item"][data-id="I1"]');
        return {
          preview: preview ? preview.getBoundingClientRect().y : null,
          outside: preview ? !preview.closest('[data-testid="viewport"]') : false,
          placeholder: item.hasAttribute("data-placeholder"),
        };
      });
      expect(state.preview !== null, "no preview while dragging");
      expect(state.outside, "the preview is inside the scroll viewport, where it can be clipped");
      expect(state.placeholder, "the item did not become a placeholder");
      expect(Math.abs(state.preview - (a.y + travel)) < 2, `the preview is at ${state.preview}, expected ${a.y + travel}`);
      await t.mouse("mouseReleased", a.cx, a.cy + travel);
      await sleep(SETTLE);
      const [change] = of(await t.log(), "change");
      expect(change && change.id === "I1" && change.to === 3, `preview drop: ${JSON.stringify(change)}`);
      const gone = await t.eval(() => document.querySelector('[data-forte="reorderable-preview"]') === null);
      expect(gone, "the preview outlived the drag");
      await expectSettled(t);
    },
  },
];

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("check:reorderable needs Google Chrome or Chromium and found neither — set CHROME_PATH.");
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

  const profile = mkdtempSync(join(tmpdir(), "forte-reorderable-"));
  const { proc, browserUrl } = await launchChrome(chrome, profile);
  const only = process.argv[2];
  let failed = 0;
  let ran = 0;

  try {
    const cdp = await connect(browserUrl);
    for (const c of CASES) {
      if (only && !c.name.startsWith(only)) continue;
      ran += 1;
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      const errors = [];
      const off = cdp.on((msg) => {
        if (msg.sessionId !== sessionId) return;
        if (msg.method === "Runtime.exceptionThrown") {
          errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
        }
        if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
          errors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
        }
      });
      try {
        await cdp.send("Page.enable", {}, sessionId);
        await cdp.send("Runtime.enable", {}, sessionId);
        await cdp.send("Emulation.setDeviceMetricsOverride", VIEWPORT, sessionId);
        if (c.touch) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, sessionId);
        const loaded = cdp.once("Page.loadEventFired", sessionId);
        await cdp.send("Page.navigate", { url: `${origin}/?${c.query}` }, sessionId);
        await timed("load", loaded);
        const t = driver(cdp, sessionId);
        await t.eval(async () => {
          for (let i = 0; i < 100 && !document.querySelector('[data-forte="reorderable-item"]'); i++) {
            await new Promise((r) => setTimeout(r, 50));
          }
          await document.fonts.ready;
          await new Promise((r) => setTimeout(r, 100));
        });
        try {
          await c.run(t);
        } finally {
          // REORDERABLE_DEBUG=1 prints what the page reported, pass or fail.
          if (process.env.REORDERABLE_DEBUG) {
            console.log(JSON.stringify(await t.log().catch(() => "unavailable"), null, 1));
          }
        }
        expect(errors.length === 0, `the page logged errors:\n      ${errors.join("\n      ")}`);
        console.log(`✓ ${c.name}`);
      } catch (error) {
        failed += 1;
        console.error(`✗ ${c.name}`);
        console.error(`    ${error instanceof Failure ? error.message : error.stack ?? error}`);
        if (errors.length && !(error instanceof Failure && error.message.startsWith("the page logged"))) {
          console.error(`    page errors:\n      ${errors.join("\n      ")}`);
        }
      } finally {
        off();
        await cdp.send("Target.closeTarget", { targetId }).catch(() => {});
      }
    }
    cdp.close();
  } finally {
    const exited = new Promise((resolve) => proc.once("exit", resolve));
    proc.kill();
    await exited;
    await server.close();
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  }

  if (ran === 0) {
    console.error(`\nNo case matched "${only}".`);
    process.exit(1);
  }
  if (failed > 0) {
    console.error(`\n${failed} of ${ran} Reorderable cases failed — see the header of this script.`);
    process.exit(1);
  }
  console.log(`\nAll ${ran} Reorderable cases passed.`);
}

await main();
