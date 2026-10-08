/*
 * The page check-clock.mjs loads: ONE placeholder at a time, described by a
 * `Scene` the script sets through `window.__fx`, so every case runs in one
 * build. Each commit is a `flushSync`, so "replace A with B" is one commit —
 * the shape of a `loading.tsx` handing over to a `<Suspense fallback>`.
 *
 * The page reports, the script judges: every function here returns what the
 * browser's own animations said — current and start times, the timeline's
 * time on the frame they were read in — and `check-clock.mjs` decides
 * whether that is a loop carrying on or a loop that restarted.
 *
 *   dir     rtl → a right-to-left document
 *   motion  reduce → `data-forte-motion="reduce"` on the root
 *
 * The real components from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { Shimmer } from "../../src/components/shimmer";
import { Skeleton, type SkeletonAnimation } from "../../src/components/skeleton";
import { pinToDocumentClock } from "../../src/internal/document-clock";

type Scene = {
  kind: "skeleton" | "shimmer";
  key: number;
  animation: SkeletonAnimation;
  loading: boolean;
  active: boolean;
  once: boolean;
};

type Loop = {
  /** CSS Modules hashes keyframe names, so the script matches on a part. */
  name: string;
  pseudo: string | null;
  currentTime: number;
  startTime: number | null;
  duration: number;
  /** Not `iterations`: the page hands its results back as JSON, and JSON
   * has no Infinity — it arrives as `null`. */
  infinite: boolean;
  playState: AnimationPlayState;
};

type Unit = { name: string; ok: boolean; detail?: string };

declare global {
  interface Window {
    __fx: {
      ready: () => boolean;
      swap: (scene: Partial<Scene>, primary: string, window: [number, number]) => Promise<unknown>;
      change: (from: Partial<Scene>, steps: Partial<Scene>[]) => Promise<unknown>;
      unit: () => Promise<Unit[]>;
    };
  }
}

const params = new URLSearchParams(location.search);
document.documentElement.dir = params.get("dir") === "rtl" ? "rtl" : "ltr";
if (params.get("motion") === "reduce") document.documentElement.dataset.forteMotion = "reduce";

const DEFAULT: Scene = {
  kind: "skeleton",
  key: 0,
  animation: "shimmer",
  loading: true,
  active: true,
  once: false,
};

let setScene: (update: (scene: Scene | null) => Scene) => void = () => {};

function App() {
  const [scene, set] = React.useState<Scene | null>(null);
  setScene = set;
  if (!scene) return null;
  return scene.kind === "skeleton" ? (
    <Skeleton.Root
      key={scene.key}
      animation={scene.animation}
      loading={scene.loading}
      width="16rem"
      height="4rem"
    />
  ) : (
    <Shimmer key={scene.key} active={scene.active} once={scene.once}>
      Generating response…
    </Shimmer>
  );
}

const commit = (update: Partial<Scene>) =>
  flushSync(() => setScene((scene) => ({ ...(scene ?? DEFAULT), ...update })));

const current = () =>
  document.querySelector<HTMLElement>('[data-forte="skeleton"], [data-forte="shimmer"]');

/** The next animation frame, resolved with the timeline's time for it.
 * Time-boxed: a document that is not producing frames — a hidden tab — would
 * otherwise hang the whole run instead of failing it. */
const frame = () =>
  new Promise<number>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("no animation frame in 1s")), 1000);
    requestAnimationFrame(() => {
      clearTimeout(timer);
      resolve(document.timeline.currentTime as number);
    });
  });

/** The component's own animations — its root's and its pseudo-elements'. */
function loops(node: Element): Loop[] {
  return node
    .getAnimations({ subtree: true })
    .filter((a) => (a.effect as KeyframeEffect | null)?.target === node)
    .map((a) => {
      const effect = a.effect as KeyframeEffect;
      const timing = effect.getComputedTiming();
      return {
        name: (a as CSSAnimation).animationName ?? "",
        pseudo: effect.pseudoElement,
        currentTime: Number(a.currentTime),
        startTime: a.startTime === null ? null : Number(a.startTime),
        duration: Number(timing.duration),
        infinite: timing.iterations === Infinity,
        playState: a.playState,
      };
    });
}

window.__fx = {
  ready: () => true,

  /* Mount A, let it run until its `primary` loop is inside `window` (a phase,
   * 0–1, chosen mid-travel so a restart cannot hide), then replace it with an
   * identical B in one commit — between frames, so `before` is A on the last
   * frame it was painted in and `after` is B on the first frame it is. */
  async swap(scene, primary, [lo, hi]) {
    commit({ ...scene, key: 1 });
    const a = current()!;
    const deadline = performance.now() + 5000;
    for (;;) {
      await frame();
      const loop = loops(a).find((l) => l.name.includes(primary));
      if (!loop) throw new Error(`A has no "${primary}" animation`);
      const phase = (loop.currentTime % loop.duration) / loop.duration;
      if (phase >= lo && phase <= hi) break;
      if (performance.now() > deadline) throw new Error(`A never reached phase ${lo}–${hi}`);
    }
    const t1 = await frame();
    const before = loops(a);
    await new Promise((resolve) => setTimeout(resolve));
    commit({ key: 2 });
    const b = current()!;
    const t2 = await frame();
    const after = loops(b);
    return { remounted: a !== b && !a.isConnected, t1, t2, before, after };
  },

  /* Mount, let a few frames pass, then apply each step as its own commit and
   * read what is on the page a frame later — for the changes that start a
   * loop without a key change, so no swap would ever catch them. */
  async change(from, steps) {
    commit({ ...from, key: 1 });
    for (let i = 0; i < 5; i++) await frame();
    for (const step of steps) {
      commit(step);
      await frame();
    }
    const node = current();
    const t = await frame();
    return { t, loops: node ? loops(node) : null };
  },

  /* The helper on its own, against animations whose kinds it must tell
   * apart. Real ones first — a loop and its `::after`, a descendant's loop, a
   * finite run, a paused loop, a transition, a script's `animate()` loop and
   * a scroll-driven loop — then a mocked `getAnimations` for the shapes the
   * browser here cannot produce, and an environment with no API at all. */
  async unit() {
    const results: Unit[] = [];
    const check = (name: string, ok: boolean, detail?: unknown) =>
      results.push({ name, ok, detail: ok ? undefined : JSON.stringify(detail) });

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fx-move { to { translate: 10px 0; } }
      .fx-loop, .fx-loop::after, .fx-child { animation: fx-move 1s linear infinite; }
      .fx-loop::after { content: ""; }
      .fx-finite { animation: fx-move 1s linear 3; }
      .fx-paused { animation: fx-move 1s linear infinite paused; }
      .fx-fade { transition: opacity 5s linear; }
      .fx-scroll { animation: fx-move 1s linear infinite; animation-timeline: scroll(root); }
    `;
    document.head.append(style);
    const host = document.createElement("div");
    host.innerHTML = `
      <div class="fx-loop" id="fx-loop"><span class="fx-child" id="fx-child"></span></div>
      <div class="fx-finite" id="fx-finite"></div>
      <div class="fx-paused" id="fx-paused"></div>
      <div class="fx-fade" id="fx-fade"></div>
      <div id="fx-scripted"></div>
      <div class="fx-scroll" id="fx-scroll"></div>
    `;
    document.body.append(host);
    const el = (id: string) => document.getElementById(id)!;
    const only = (node: Element) =>
      node.getAnimations({ subtree: true }).filter((a) => (a.effect as KeyframeEffect).target === node);

    // Let every animation start on its own clock first, so "pinned" is a
    // change the helper made rather than a coincidence of mounting at zero.
    for (let i = 0; i < 3; i++) await frame();
    getComputedStyle(el("fx-fade")).opacity;
    el("fx-fade").style.opacity = "0";
    el("fx-scripted").animate([{ opacity: 1 }, { opacity: 0.5 }], {
      duration: 1000,
      iterations: Infinity,
    });
    for (let i = 0; i < 3; i++) await frame();

    // One at a time, and a throw is a failure of its own: the helper runs in
    // a layout effect, where an exception takes the consumer's tree down —
    // and Chrome DOES throw on an absolute start time for a scroll-driven
    // animation, so a missing timeline check shows up here as an error.
    for (const id of ["fx-loop", "fx-finite", "fx-paused", "fx-fade", "fx-scripted", "fx-scroll"]) {
      try {
        pinToDocumentClock(el(id));
      } catch (error) {
        check(`#${id} does not throw`, false, String(error));
      }
    }

    const loop = only(el("fx-loop"));
    check(
      "a loop and its ::after are pinned",
      loop.length === 2 && loop.every((a) => a.startTime === 0),
      loop.map((a) => [(a.effect as KeyframeEffect).pseudoElement, a.startTime]),
    );
    // The one animation each of these runs — or nothing, which fails the
    // check rather than letting it pass with nothing to look at.
    const sole = (id: string) => {
      const found = only(el(id));
      return found.length === 1 ? found[0] : undefined;
    };
    const child = sole("fx-child");
    check("a descendant's loop is left alone", !!child && child.startTime !== 0, child?.startTime);
    const finite = sole("fx-finite");
    check("a finite animation is left alone", !!finite && finite.startTime !== 0, finite?.startTime);
    const paused = sole("fx-paused");
    check(
      "a paused loop is left alone, and stays paused",
      !!paused && paused.startTime === null && paused.playState === "paused",
      [paused?.startTime, paused?.playState],
    );
    const fade = sole("fx-fade");
    check(
      "a transition is left alone",
      fade instanceof CSSTransition && fade.startTime !== 0,
      [fade?.constructor.name, fade?.startTime],
    );
    const scripted = sole("fx-scripted");
    check("an animate() loop is left alone", !!scripted && scripted.startTime !== 0, scripted?.startTime);
    const scroll = sole("fx-scroll");
    check(
      "a scroll-driven loop is left alone",
      !!scroll && scroll.timeline !== document.timeline && scroll.startTime !== 0,
      String(scroll?.startTime),
    );

    // Mocked: the conditions one at a time, each on an otherwise-pinnable loop.
    type Fake = Record<string, unknown> & { startTime: number | null };
    const node: { ownerDocument: Document; getAnimations?: () => Fake[] } = {
      ownerDocument: document,
    };
    const fake = (over: Record<string, unknown> = {}): Fake => ({
      animationName: "fx",
      effect: { target: node, getTiming: () => ({ iterations: Infinity }) },
      timeline: document.timeline,
      playState: "running",
      startTime: null,
      ...over,
    });
    const scriptedFake = fake();
    delete scriptedFake.animationName;
    const fakes = {
      pinnable: fake(),
      finite: fake({ effect: { target: node, getTiming: () => ({ iterations: 3 }) } }),
      descendant: fake({ effect: { target: {}, getTiming: () => ({ iterations: Infinity }) } }),
      "no effect": fake({ effect: null }),
      scripted: scriptedFake,
      paused: fake({ playState: "paused" }),
      "other timeline": fake({ timeline: {} }),
    };
    node.getAnimations = () => Object.values(fakes);
    pinToDocumentClock(node as unknown as Element);
    const pinned = Object.entries(fakes)
      .filter(([, f]) => f.startTime === 0)
      .map(([k]) => k);
    check("mocked: only the infinite CSS loop on the node is pinned", pinned.join() === "pinnable", pinned);

    // jsdom's shape: an element, and no `getAnimations` on it.
    try {
      pinToDocumentClock({ ownerDocument: document } as unknown as Element);
      check("without the Web Animations API it does nothing", true);
    } catch (error) {
      check("without the Web Animations API it does nothing", false, String(error));
    }

    host.remove();
    style.remove();
    return results;
  },
};

createRoot(document.getElementById("root")!).render(<App />);
