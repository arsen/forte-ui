"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Carousel.module.css";

/* -------------------------------------------------------------------------
 * Carousel
 *
 * Base UI has no carousel primitive, so this component owns its own engine.
 * Four decisions shape everything below.
 *
 * 1 — The track is moved by ONE number, in slides. `--forte-carousel-position`
 *     on the track is "which slide sits at the start edge", and the
 *     stylesheet turns it into a `translate` with `calc()`: position × (100%
 *     + gap) ÷ slides-per-view. A percentage in `translate` is the track's
 *     own size, which is the viewport's, so the resting positions never need
 *     measuring — a resize, a density change or a gap override lands the
 *     track on the same slide with no JavaScript. Only a DRAG needs pixels,
 *     to turn the pointer's travel into slides, and that is measured once
 *     at pointerdown.
 *
 * 2 — Moves are CSS transitions of `translate`, so a click on Next while the
 *     track is still travelling retargets from wherever it has got to instead
 *     of snapping back and restarting. During a drag the transition is off
 *     and the same variable is written straight to the DOM every frame,
 *     bypassing React; the release is one state update that puts the
 *     transition back and sets the target, and the browser tweens from the
 *     dragged position.
 *
 * 3 — Looping is clones plus an instant pre-jump. The track holds copies of
 *     the last few slides before the real ones and of the first few after
 *     them, enough to fill the view plus one for a peek. A move that would
 *     cross the boundary — Next from the last slide — first jumps the track,
 *     with the transition off, to the clone that shows the identical picture
 *     (the copy of the last slide sitting just before the first), and then
 *     animates one step forward to the real first slide. The jump is invisible
 *     because both positions paint the same pixels, and the track always
 *     comes to rest on a REAL slide, so there is nothing to fix up after the
 *     transition and no `transitionend` to wait for — which matters, because
 *     a transition in a background tab may never end.
 *
 * 4 — A slide learns its index from its position among `Track`'s children,
 *     not from a registry filled in after mount. The index is what decides
 *     whether a lazy slide renders its content at all, so it has to be known
 *     on the FIRST render — the server render — or the active slide would
 *     ship empty and pop in on hydration. The cost is that slides must be
 *     direct children of `Track`; a wrapper component around several of them
 *     is one child, and one slide.
 * ---------------------------------------------------------------------- */

/** Which way the slides are laid out and travel. */
export type CarouselOrientation = "horizontal" | "vertical";

/** What caused the active slide to change. */
export type CarouselChangeReason = "drag" | "control" | "autoplay" | "clamp";

/**
 * Where the active slide sits in the view when more than one fits: at the
 * start edge, or in the middle with its neighbours peeking on both sides.
 */
export type CarouselAlign = "start" | "center";

/**
 * Space between slides: a step on the spacing scale (`--forte-space-1` to
 * `--forte-space-8`, with `0` for none) or any CSS length as a string.
 */
export type CarouselGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | (string & {});

/* A step becomes its token, so the gap follows a density preset the way
 * every other spacing does; a string is trusted as written. `0` is a real
 * length rather than a bare number, which `calc()` would reject. */
function gapValue(gap: CarouselGap): string {
  if (typeof gap === "string") return gap;
  return gap === 0 ? "0px" : `var(--forte-space-${gap})`;
}

const useIsoLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** The track's position, in slides. Read by the stylesheet's `calc()`. */
const POSITION = "--forte-carousel-position";
/** The measured height of the slides in view, under `autoHeight`. */
const HEIGHT = "--forte-carousel-height";

const AUTOPLAY_INTERVAL = 5000;

/* React 18 has no `inert` in its attribute table and drops a boolean for an
 * unknown attribute with a warning, so `inert=""` was the workaround. React 19
 * knows the attribute and treats `""` as false. One check, once, at module
 * load, rather than a version-specific bug in whichever half is not tested. */
const INERT: unknown = Number.parseInt(React.version, 10) >= 19 ? true : "";

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** The latest render's callback behind a stable identity. */
function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = React.useRef(fn);
  useIsoLayoutEffect(() => {
    ref.current = fn;
  });
  return React.useCallback((...args: A) => ref.current(...args), []);
}

/**
 * How many slides are copied onto each end of the track when looping: enough
 * to fill the view, plus one so a peek — or a drag past the last slide —
 * still has something to show. Never more than there are slides.
 */
function clonesFor(count: number, perView: number, loop: boolean) {
  return loop && count > 1 ? Math.min(count, Math.ceil(perView) + 1) : 0;
}

/** The last index the track can rest on without looping. Start-aligned, with
 * more than one slide in view, the last position is the one that still fills
 * the view, so a row of three never scrolls to show two and a blank. Centred,
 * every slide can take the middle — the last one with blank track after it,
 * the mirror of the first one's blank track before it. */
function maxIndexFor(count: number, perView: number, align: CarouselAlign) {
  if (align === "center") return Math.max(0, count - 1);
  return Math.max(0, count - Math.max(1, Math.floor(perView)));
}

/** How far, in slides, the view's start edge sits before the active slide.
 * Zero at the start; half the room beside the active slide when centred. */
function alignOffset(perView: number, align: CarouselAlign) {
  return align === "center" ? (perView - 1) / 2 : 0;
}

/**
 * Which slides the view covers, as offsets from the active one: `[lo, hi]`
 * are the ones fully in view, `[loAny, hiAny]` the ones with any part in
 * view. The view spans `perView` slides starting `offset` before the active
 * one; a slide is fully in view when both its edges are, and partly in view
 * when either is. Shared by the inert/aria-hidden decision, the lazy window
 * and the height measurement, so the three cannot disagree about what "in
 * view" means.
 */
function viewRange(perView: number, align: CarouselAlign) {
  const offset = alignOffset(perView, align);
  const lo = Math.ceil(-offset);
  const hi = Math.max(lo, Math.floor(perView - 1 - offset));
  return {
    lo,
    hi,
    loAny: Math.floor(-offset),
    hiAny: Math.max(lo, Math.ceil(perView - 1 - offset)),
  };
}

/** Signed distance from the active slide, measured the short way round the
 * ring when looping — the slide before the first is `-1` away, which is what
 * keeps a clone's content in step with the slide it copies. */
function distanceFrom(index: number, i: number, count: number, loop: boolean) {
  if (!loop) return i - index;
  const half = Math.floor(count / 2);
  return mod(i - index + half, count) - half;
}

/**
 * Sets the position with the transition suppressed, and flushes it, so the
 * value written next starts its transition from HERE rather than from
 * wherever the track was. The reflow is the point: without it both writes
 * land in the same style recalculation and the browser only sees the last.
 * During a drag the stylesheet has already switched the transition off, so
 * the inline override is skipped — it would otherwise be cleared a frame
 * before the release commit re-enabled the transition, and the release would
 * tween from the jump instead of from the finger.
 */
function jumpTo(track: HTMLElement, position: number, dragging: boolean) {
  if (!dragging) track.style.transition = "none";
  track.style.setProperty(POSITION, String(position));
  void track.offsetWidth;
  if (!dragging) track.style.transition = "";
}

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface CarouselContextValue {
  orientation: CarouselOrientation;
  /** Looping as resolved from the slide count — off with fewer than two. */
  loop: boolean;
  /** Looping as asked for, before the count is known. A slide resolves it
   * against the count it gets from `Track`, which is known on the first
   * render when the root's is not yet. */
  wantsLoop: boolean;
  perView: number;
  align: CarouselAlign;
  lazy: number | false;
  autoHeight: boolean;
  draggable: boolean;
  index: number;
  count: number;
  maxIndex: number;
  clones: number;
  /* Bumped by every navigation, including one that lands on the slide the
   * track already rests on, so the track re-asserts its position after a
   * drag that went nowhere — React sees no change in `index` and would leave
   * the dragged offset in the DOM. */
  settle: number;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  autoplay: boolean;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  canPrev: boolean;
  canNext: boolean;
  goTo: (target: number, reason: CarouselChangeReason, from?: number) => void;
  setCount: (count: number) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(part: string) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error(`Carousel.${part} must be rendered inside Carousel.Root.`);
  return context;
}

interface SlideSlot {
  index: number;
  count: number;
  clone: boolean;
}

const SlideSlotContext = React.createContext<SlideSlot | null>(null);
const ThumbSlotContext = React.createContext<number>(-1);

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface CarouselRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * The active slide, zero-based. Makes the carousel controlled: pair it with
   * `onIndexChange`.
   */
  index?: number;
  /**
   * The slide shown first when the carousel is uncontrolled.
   * @default 0
   */
  defaultIndex?: number;
  /**
   * Called with the new index whenever the active slide changes — by a drag,
   * a control, autoplay, or a clamp after slides were removed. `reason` says
   * which.
   */
  onIndexChange?: (index: number, reason: CarouselChangeReason) => void;
  /**
   * Which way the slides are laid out and travel. A vertical carousel needs a
   * definite height on `Carousel.Viewport` — its slides are sized from it —
   * and ignores `autoHeight`.
   * @default "horizontal"
   */
  orientation?: CarouselOrientation;
  /**
   * Whether the last slide wraps around to the first. Copies of the slides at
   * each end of the track make the wrap seamless, so an element `id` inside a
   * slide will occur more than once in the document.
   * @default false
   */
  loop?: boolean;
  /**
   * Advance on a timer: `true` for every 5 seconds, or the interval in
   * milliseconds. Pauses while the pointer is over the carousel, while focus
   * is inside it, during a drag and while the tab is hidden, and does not
   * start at all under reduced motion — `Carousel.PlayPause` lets the reader
   * start it anyway. A carousel that autoplays should render that button:
   * WCAG 2.2.2 asks for a way to pause anything that moves on its own.
   * @default false
   */
  autoplay?: boolean | number;
  /**
   * How many slides fit in the view. A fraction leaves the next slide peeking
   * in at the end: `1.2` shows one slide and a fifth of the next.
   * @default 1
   */
  slidesPerView?: number;
  /**
   * Where the active slide sits when more than one fits. `"start"` parks it
   * at the start edge and fills the view with the slides after it — a row of
   * cards. `"center"` puts it in the middle with its neighbours peeking on
   * both sides — a gallery. Centred, every slide can take the middle: with
   * `loop` the last slides show before the first one, without it the first
   * and last sit beside blank track.
   * @default "start"
   */
  align?: CarouselAlign;
  /**
   * Render only the slides near the view. `true` keeps the slides in view plus
   * one on either side mounted; a number keeps that many on either side. A
   * slide outside the window keeps its box and its size but renders no
   * content, so drag distances stay correct.
   * @default false
   */
  lazy?: boolean | number;
  /**
   * Size the viewport to the slides in view and animate between heights, so a
   * short slide next to a tall one does not leave a gap under it. Horizontal
   * carousels only.
   * @default false
   */
  autoHeight?: boolean;
  /**
   * Whether the slides can be dragged with a pointer or swiped on touch.
   * @default true
   */
  draggable?: boolean;
  /**
   * Space between slides: a step on the spacing scale (`2` is
   * `--forte-space-2`, `0` is none) or a CSS length (`"2px"`,
   * `"var(--my-gap)"`). Sets the `--forte-carousel-gap` knob, which the
   * slide size and the track's travel are both derived from, so the two
   * cannot disagree. Left unset, the knob's own default applies.
   * @default 4
   */
  gap?: CarouselGap;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups the viewport, its controls and its pagination, and owns which slide
 * is active. Give it an `aria-label` — it is a `region` with the
 * `carousel` role description, and that name is how a screen reader user
 * tells one carousel from the next.
 */
const CarouselRoot = React.forwardRef<HTMLDivElement, CarouselRootProps>(function CarouselRoot(
  {
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    orientation = "horizontal",
    loop = false,
    autoplay = false,
    slidesPerView = 1,
    align = "start",
    lazy = false,
    autoHeight = false,
    draggable = true,
    gap,
    className,
    style,
    children,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const perView = Math.max(slidesPerView, 0.1);
  const lazyWindow: number | false = lazy === false ? false : lazy === true ? 1 : Math.max(0, lazy);
  const autoplayOn = autoplay !== false;
  const interval = typeof autoplay === "number" ? autoplay : AUTOPLAY_INTERVAL;

  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const controlled = indexProp !== undefined;
  const [count, setCount] = React.useState(0);
  const maxIndex = maxIndexFor(count, perView, align);
  const looping = loop && count > 1;
  // A controlled index past the end, or a stale one after slides were
  // removed, is shown at the nearest slide that exists rather than as a
  // blank view — but the prop itself is left alone: correcting it is the
  // owner's job, and `onIndexChange` with reason "clamp" tells them.
  const raw = controlled ? indexProp : uncontrolled;
  const index = count === 0 ? Math.max(0, raw) : looping ? mod(raw, count) : clamp(raw, 0, maxIndex);
  const indexRef = React.useRef(index);
  indexRef.current = index;

  const [settle, setSettle] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplayOn);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const clones = clonesFor(count, perView, loop);

  const goTo = useEvent((target: number, reason: CarouselChangeReason, from?: number) => {
    if (count === 0) return;
    const real = looping ? mod(target, count) : clamp(target, 0, maxIndex);
    const track = trackRef.current;

    if (track && looping) {
      /* The canonical resting place for `real` is its real slide, but the
       * shortest path there may run through a clone — Next from the last
       * slide is one step forward into the copy of the first, not a sweep
       * back across every slide. Pick the representation nearest to where
       * the track is now, and if that is a clone, pre-jump: shift the CURRENT
       * position by a whole lap so the same picture is painted from the
       * other copy, and let the transition run the short way onto the real
       * slide. `from` is the dragged position when this is a release; at rest
       * it is the slide the track sits on. */
      const current = from ?? indexRef.current + clones;
      const canonical = real + clones;
      let nearest = canonical;
      for (const candidate of [canonical - count, canonical + count]) {
        if (Math.abs(candidate - current) < Math.abs(nearest - current)) nearest = candidate;
      }
      if (nearest !== canonical) jumpTo(track, current + (canonical - nearest), from !== undefined);
    }

    if (real !== indexRef.current) {
      if (!controlled) setUncontrolled(real);
      onIndexChange?.(real, reason);
    }
    setSettle((n) => n + 1);
  });

  // Slides removed from under a resting index: report it once, as a clamp.
  const onIndexChangeEvent = useEvent((next: number, reason: CarouselChangeReason) =>
    onIndexChange?.(next, reason),
  );
  React.useEffect(() => {
    if (count === 0 || raw === index) return;
    if (!controlled) setUncontrolled(index);
    onIndexChangeEvent(index, "clamp");
  }, [count, raw, index, controlled, onIndexChangeEvent]);

  /* Autoplay is the one thing here that moves without being asked, so it
   * defers to the motion preference: read off the root, not `matchMedia`, so
   * a subtree `data-forte-motion="reduce"` counts as well as the OS setting.
   * Checked once — a reader who then presses Play has asked. */
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!autoplayOn || !root) return;
    if (getComputedStyle(root).getPropertyValue("--forte-motion-ok").trim() === "0") {
      setPlaying(false);
    }
  }, [autoplayOn]);

  React.useEffect(() => {
    if (!autoplayOn || typeof document === "undefined") return;
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [autoplayOn]);

  const advancing =
    autoplayOn && playing && !hovered && !focused && !hidden && !dragging && count > 1;

  /* A timeout re-armed on every index change rather than an interval, so a
   * drag or a click resets the clock: the next automatic move is a full
   * interval after the reader's own, not whatever was left of the last one.
   * Without `loop` the end wraps to the start — stopping there would leave
   * a carousel that plays exactly once and then reads as broken. */
  React.useEffect(() => {
    if (!advancing) return;
    const timer = setTimeout(() => {
      const current = indexRef.current;
      goTo(!looping && current >= maxIndex ? 0 : current + 1, "autoplay");
    }, interval);
    return () => clearTimeout(timer);
  }, [advancing, interval, index, settle, looping, maxIndex, goTo]);

  // Until `Track` has reported how many slides there are, nothing is known
  // to be the end — and the server render, which never learns, must not
  // ship a disabled Next for the client to un-disable after hydration.
  const canPrev = count === 0 || looping || index > 0;
  const canNext = count === 0 || looping || index < maxIndex;

  const context = React.useMemo<CarouselContextValue>(
    () => ({
      orientation,
      loop: looping,
      wantsLoop: loop,
      perView,
      align,
      lazy: lazyWindow,
      autoHeight: autoHeight && orientation === "horizontal",
      draggable,
      index,
      count,
      maxIndex,
      clones,
      settle,
      dragging,
      setDragging,
      autoplay: autoplayOn,
      playing,
      setPlaying,
      canPrev,
      canNext,
      goTo,
      setCount,
      trackRef,
    }),
    [
      orientation,
      looping,
      loop,
      perView,
      align,
      lazyWindow,
      autoHeight,
      draggable,
      index,
      count,
      maxIndex,
      clones,
      settle,
      dragging,
      autoplayOn,
      playing,
      canPrev,
      canNext,
      goTo,
    ],
  );

  return (
    <CarouselContext.Provider value={context}>
      <div
        ref={setRootRef}
        role="region"
        aria-roledescription="carousel"
        className={clsx(styles.root, className)}
        data-forte="carousel"
        data-orientation={orientation}
        data-align={align}
        data-loop={looping ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        data-auto-height={autoHeight && orientation === "horizontal" ? "" : undefined}
        data-autoplay={autoplayOn ? (advancing ? "playing" : "paused") : undefined}
        data-at-start={count > 0 && !looping && index === 0 ? "" : undefined}
        data-at-end={count > 0 && !looping && index >= maxIndex ? "" : undefined}
        style={
          {
            ...style,
            "--forte-carousel-per-view": perView,
            "--forte-carousel-align-offset": alignOffset(perView, align),
            ...(gap !== undefined ? { "--forte-carousel-gap": gapValue(gap) } : null),
          } as React.CSSProperties
        }
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          // Touch has no hover: a finger that tapped Next and lifted would
          // otherwise pause autoplay until the next tap somewhere else.
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.pointerType === "mouse") setHovered(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setFocused(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface CarouselViewportProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startedAt: number;
  /** Position at the start, in slides. */
  base: number;
  /** Pixels per slide, measured once at pointerdown. */
  step: number;
  /** `-1` in RTL, where the track moves the other way for the same finger. */
  sign: number;
  /** Past the threshold and owning the pointer. */
  active: boolean;
  /** Gave the gesture up to the page — it was a scroll on the other axis. */
  released: boolean;
  /** The last position written, and a recent one for velocity. */
  position: number;
  samples: { at: number; position: number }[];
}

/* Movement, in pixels, before a press becomes a drag. Below it a press is a
 * click on whatever is under the pointer, and the click goes through. */
const DRAG_THRESHOLD = 6;
/* A swipe shorter than this is a flick: any movement past the threshold moves
 * one slide in that direction. A longer drag lands on the nearest slide to
 * where it was let go. */
const FLICK_MS = 300;
/* How far past the end a drag can pull without `loop`, as a fraction of the
 * finger's travel: enough to say "there is no more", not enough to look like
 * there is. */
const RESISTANCE = 0.3;

/**
 * The box the slides move inside. Clips to its own bounds, takes the drag, and
 * — under `autoHeight` — grows and shrinks to fit the slides in view. Render
 * the `Track` inside it; `Prev` and `Next` can go inside it too, where they
 * overlay the slides.
 */
const CarouselViewport = React.forwardRef<HTMLDivElement, CarouselViewportProps>(
  function CarouselViewport(
    { className, children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture, onDragStart, ...props },
    ref,
  ) {
    const context = useCarousel("Viewport");
    const {
      orientation,
      loop,
      perView,
      align,
      autoHeight,
      draggable,
      index,
      count,
      maxIndex,
      clones,
      trackRef,
    } = context;
    const offset = alignOffset(perView, align);

    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const drag = React.useRef<DragState | null>(null);
    const frame = React.useRef(0);
    const pending = React.useRef(0);
    // Set by a drag, read by the click that follows it: a drag is not a click
    // on whatever the finger happened to land on.
    const suppressClick = React.useRef(false);

    /* ---- Height ---------------------------------------------------------
     * The viewport's block size follows the tallest slide in view, measured
     * off the slides themselves and written as a custom property that the
     * stylesheet transitions. Measured, not `height: auto`, because auto
     * cannot be transitioned — and re-measured whenever a slide resizes, which
     * is how a lazy slide that has just mounted its content, or an image
     * that has just loaded, grows the viewport with it. */
    useIsoLayoutEffect(() => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;
      if (!autoHeight) {
        viewport.style.removeProperty(HEIGHT);
        return;
      }

      const slides = Array.from(
        track.querySelectorAll<HTMLElement>(':scope > [data-forte="carousel-slide"]'),
      );
      const range = viewRange(perView, align);
      const first = Math.max(0, index + clones + range.lo);
      const last = Math.min(slides.length - 1, index + clones + range.hi);

      const measure = () => {
        let height = 0;
        for (let i = first; i <= last; i += 1) {
          const slide = slides[i];
          if (slide) height = Math.max(height, slide.offsetHeight);
        }
        if (height > 0) viewport.style.setProperty(HEIGHT, `${height}px`);
      };

      measure();
      const observer = new ResizeObserver(measure);
      for (let i = first; i <= last; i += 1) {
        const slide = slides[i];
        if (slide) observer.observe(slide);
      }
      return () => observer.disconnect();
    }, [autoHeight, index, count, clones, perView, align, trackRef]);

    /* ---- Drag ------------------------------------------------------------ */

    const horizontal = orientation === "horizontal";

    const measureStep = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return 0;
      const size = horizontal ? viewport.clientWidth : viewport.clientHeight;
      const style = getComputedStyle(track);
      const gap = parseFloat(horizontal ? style.columnGap : style.rowGap) || 0;
      return (size + gap) / perView;
    };

    /* Where the track IS, read off its computed `translate`, rather than
     * where it was told to go. Grabbing a track that is still travelling
     * should pick it up mid-flight, not snap it to its destination first. */
    const currentPosition = (step: number, sign: number) => {
      const track = trackRef.current;
      if (!track || step === 0) return index + clones;
      const translate = getComputedStyle(track).translate;
      if (!translate || translate === "none") return index + clones;
      const parts = translate.split(" ").map(parseFloat);
      const px = (horizontal ? parts[0] : parts[1]) ?? 0;
      if (Number.isNaN(px)) return index + clones;
      // The translate carries the alignment offset; the position does not.
      return (-px * sign) / step + offset;
    };

    const write = (position: number) => {
      const track = trackRef.current;
      const state = drag.current;
      if (!track || !state) return;
      state.position = position;
      track.style.setProperty(POSITION, String(position));
    };

    const applyPending = () => {
      const state = drag.current;
      if (!state || !state.active) return;
      const travel = pending.current;
      let position = state.base - (travel * state.sign) / state.step;

      if (loop) {
        // Never past the clones: beyond them is an empty track. The view
        // starts `offset` before the position, so both bounds shift by it.
        position = clamp(position, offset, count + 2 * clones - perView + offset);
      } else if (position < 0) {
        position *= RESISTANCE;
      } else if (position > maxIndex) {
        position = maxIndex + (position - maxIndex) * RESISTANCE;
      }

      write(position);
      const now = performance.now();
      state.samples.push({ at: now, position });
      // Keep enough history to read a velocity off, not a whole gesture.
      while (state.samples.length > 2 && now - (state.samples[0]?.at ?? now) > 100) {
        state.samples.shift();
      }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || !draggable || count < 2 || event.button !== 0) return;
      if (drag.current) return;

      const step = measureStep();
      if (step <= 0) return;
      const rtl =
        horizontal && getComputedStyle(event.currentTarget).direction === "rtl";
      const sign = rtl ? -1 : 1;

      /* Nothing is prevented and nothing is captured yet. A press is a click
       * until it moves: preventing the default here would stop a button in
       * the slide from focusing, and capturing the pointer would redirect the
       * `click` to this element instead of that button. The gesture is
       * claimed at the threshold, in the move handler. */
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        base: currentPosition(step, sign),
        step,
        sign,
        active: false,
        released: false,
        position: index + clones,
        samples: [],
      };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const state = drag.current;
      if (!state || state.released || state.pointerId !== event.pointerId) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const along = horizontal ? dx : dy;
      const across = horizontal ? dy : dx;

      if (!state.active) {
        if (Math.abs(along) < DRAG_THRESHOLD && Math.abs(across) < DRAG_THRESHOLD) return;
        /* The other axis won: this is the page scrolling, and the browser
         * will send a `pointercancel` shortly — but a mouse never does, so
         * the gesture is let go here in both cases rather than turning a
         * wobbly vertical drag into a slide change. */
        if (Math.abs(across) > Math.abs(along)) {
          state.released = true;
          return;
        }
        state.active = true;
        suppressClick.current = true;
        context.setDragging(true);
        /* Defensively: `setPointerCapture` throws for a pointer that is no
         * longer active — released between the event being queued and this
         * handler running, and every synthetic event a test dispatches. */
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Without capture, a pointer leaving the viewport ends the drag
          // early. Better than no drag at all.
        }
      }

      // Not accumulated frame to frame: the position is always the origin
      // plus this event's travel, so a clamp never banks into the next move.
      pending.current = along;
      if (frame.current !== 0) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        applyPending();
      });
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const state = drag.current;
      if (!state || state.pointerId !== event.pointerId) return;
      drag.current = null;

      if (!state.active) return;

      if (frame.current !== 0) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        applyPending();
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const moved = state.position - state.base;
      let steps = 0;
      if (!cancelled) {
        const now = performance.now();
        const oldest = state.samples[0];
        const velocity =
          oldest && now > oldest.at ? (state.position - oldest.position) / (now - oldest.at) : 0;
        if (now - state.startedAt < FLICK_MS) {
          if (Math.abs(moved) * state.step > DRAG_THRESHOLD) steps = Math.sign(moved);
        } else {
          // Where a slowing finger would have come to rest a moment later.
          steps = Math.round(moved + velocity * 100);
          if (steps === 0 && Math.abs(moved) > 0.5) steps = Math.sign(moved);
        }
      }

      /* Both state updates land in one commit: the root drops `data-dragging`,
       * which puts the transition back, and the track gets its target, so the
       * browser tweens from the dragged position to the slide. `from` is that
       * dragged position — it is what a loop's pre-jump has to shift. */
      context.setDragging(false);
      context.goTo(index + steps, "drag", state.position);
    };

    React.useEffect(
      () => () => {
        if (frame.current !== 0) cancelAnimationFrame(frame.current);
      },
      [],
    );

    return (
      <div
        ref={setRefs}
        className={clsx(styles.viewport, className)}
        data-forte="carousel-viewport"
        data-orientation={orientation}
        data-draggable={draggable && count > 1 ? "" : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag(event, false);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          endDrag(event, true);
        }}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragStart={(event) => {
          onDragStart?.(event);
          // An image or a link under the pointer would otherwise start a
          // native drag on the first movement and swallow the gesture.
          if (draggable) event.preventDefault();
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------
 * Track
 * ---------------------------------------------------------------------- */

export interface CarouselTrackProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The row (or column) of slides that moves. Every direct child is one slide
 * and is expected to be a `Carousel.Slide`; render them straight from an
 * array rather than through a wrapper, since the wrapper would count as one
 * slide. With `loop` the track also renders copies of the slides at each end.
 */
const CarouselTrack = React.forwardRef<HTMLDivElement, CarouselTrackProps>(function CarouselTrack(
  { className, children, style, ...props },
  ref,
) {
  const context = useCarousel("Track");
  const { index, wantsLoop, perView, settle, setCount, trackRef } = context;

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, trackRef],
  );

  const slides = React.Children.toArray(children).filter(React.isValidElement);
  const count = slides.length;
  // Computed here from the children rather than taken from context, so the
  // FIRST render — the server's — already carries the clones and the right
  // position, and hydration has nothing to correct. `wantsLoop` for the same
  // reason: the root's resolved `loop` waits on a count it does not have yet.
  const clones = clonesFor(count, perView, wantsLoop);
  const position = index + clones;

  useIsoLayoutEffect(() => {
    setCount(count);
  }, [count, setCount]);

  /* Re-asserted after every navigation, not only when React sees the value
   * change. A drag writes this property straight to the DOM; a release that
   * lands back on the same slide leaves `index` untouched, so React would not
   * write it again and the track would stay where the finger left it. */
  useIsoLayoutEffect(() => {
    trackRef.current?.style.setProperty(POSITION, String(position));
  }, [position, settle, trackRef]);

  const slot = (i: number, clone: boolean): SlideSlot => ({ index: i, count, clone });

  return (
    <div
      ref={setRefs}
      className={clsx(styles.track, className)}
      data-forte="carousel-track"
      // Announces the new slide when the reader moves, and stays quiet while
      // the carousel moves itself: a live region that speaks every five
      // seconds is not assistive.
      aria-live={context.autoplay && context.playing ? "off" : "polite"}
      style={{ ...style, [POSITION]: position } as React.CSSProperties}
      {...props}
    >
      {clones > 0 &&
        slides.slice(count - clones).map((slide, offset) => {
          const i = count - clones + offset;
          return (
            <SlideSlotContext.Provider key={`clone-start-${i}`} value={slot(i, true)}>
              {slide}
            </SlideSlotContext.Provider>
          );
        })}
      {slides.map((slide, i) => (
        <SlideSlotContext.Provider key={slide.key ?? i} value={slot(i, false)}>
          {slide}
        </SlideSlotContext.Provider>
      ))}
      {clones > 0 &&
        slides.slice(0, clones).map((slide, i) => (
          <SlideSlotContext.Provider key={`clone-end-${i}`} value={slot(i, true)}>
            {slide}
          </SlideSlotContext.Provider>
        ))}
    </div>
  );
});

/* -------------------------------------------------------------------------
 * Slide
 * ---------------------------------------------------------------------- */

export interface CarouselSlideProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One slide. Named "n of total" for assistive technology unless given an
 * `aria-label`, hidden from it and made inert while out of view — so a link
 * in the next slide is neither announced nor reachable with Tab until the
 * slide is — and, under `lazy`, empty until it is near the view.
 */
const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide(
  { className, children, ...props },
  ref,
) {
  const context = useCarousel("Slide");
  const slot = React.useContext(SlideSlotContext);
  if (!slot) throw new Error("Carousel.Slide must be a direct child of Carousel.Track.");

  const { index, perView, align, lazy } = context;
  const { index: i, count, clone } = slot;
  // The count is the track's own, computed from its children in the same
  // render, not the root's state, which is still 0 on the first render — the
  // one the server sends. With the root's, every slide would ship hidden and
  // a lazy carousel would ship empty.
  const loop = context.wantsLoop && count > 1;

  const d = distanceFrom(index, i, count, loop);
  const range = viewRange(perView, align);
  const inView = d >= range.lo && d <= range.hi;
  const mounted = lazy === false || (d >= range.loAny - lazy && d <= range.hiAny + lazy);

  const hidden = clone || !inView;

  return (
    <div
      ref={ref}
      role={clone ? undefined : "group"}
      aria-roledescription={clone ? undefined : "slide"}
      aria-label={clone ? undefined : `${i + 1} of ${count}`}
      aria-hidden={hidden ? true : undefined}
      className={clsx(styles.slide, className)}
      data-forte="carousel-slide"
      data-index={i}
      data-active={!clone && i === index ? "" : undefined}
      data-in-view={!clone && inView ? "" : undefined}
      data-clone={clone ? "" : undefined}
      {...(hidden ? { inert: INERT as boolean } : null)}
      {...props}
    >
      {mounted ? children : null}
    </div>
  );
});

/* -------------------------------------------------------------------------
 * Prev / Next
 * ---------------------------------------------------------------------- */

export interface CarouselControlProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Replace the rendered element — compose the control with `Button`, say:
   * `render={<Button iconOnly variant="ghost" />}`.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

function Chevron(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

function useControl(
  part: "Prev" | "Next",
  {
    render,
    className,
    children,
    onClick,
    "aria-label": ariaLabel,
    ...props
  }: CarouselControlProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const context = useCarousel(part);
  const enabled = part === "Prev" ? context.canPrev : context.canNext;
  const delta = part === "Prev" ? -1 : 1;

  return useRender({
    render,
    ref,
    defaultTagName: "button",
    props: {
      type: "button",
      className: clsx(styles.control, "forte-focus-ring", className),
      "data-forte": part === "Prev" ? "carousel-prev" : "carousel-next",
      // Inside the viewport, which clips, so the ring is flipped inward.
      "data-focus-inset": "",
      "data-orientation": context.orientation,
      "data-direction": part === "Prev" ? "prev" : "next",
      "data-disabled": enabled ? undefined : "",
      "aria-label": ariaLabel ?? (part === "Prev" ? "Previous slide" : "Next slide"),
      /* `aria-disabled` rather than `disabled`: a native disabled button is
       * blurred by the browser, so reaching the last slide with Next would
       * drop the reader's focus to `<body>` the moment it landed. */
      "aria-disabled": enabled ? undefined : true,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !enabled) return;
        context.goTo(context.index + delta, "control");
      },
      ...props,
      children: children ?? <Chevron className={styles.controlIcon} />,
    },
  });
}

/** Moves to the previous slide. Disabled — but still focusable — on the
 * first slide unless the carousel loops. Renders a chevron unless given
 * children. */
const CarouselPrev = React.forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselPrev(props, ref) {
    return useControl("Prev", props, ref);
  },
);

/** Moves to the next slide. Disabled — but still focusable — on the last
 * slide unless the carousel loops. Renders a chevron unless given children. */
const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselNext(props, ref) {
    return useControl("Next", props, ref);
  },
);

/* -------------------------------------------------------------------------
 * Dots
 * ---------------------------------------------------------------------- */

export interface CarouselDotsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "children"> {
  /**
   * Which way the dots run, and which arrow keys move between them. Follows
   * the carousel's own orientation unless set — a vertical carousel with a
   * row of dots under it is fine.
   */
  orientation?: CarouselOrientation;
  /**
   * Names a dot for assistive technology, given its zero-based index.
   * @default (i) => `Slide ${i + 1}`
   */
  getLabel?: (index: number) => string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One button per position the track can rest on. A single tab stop: the
 * active dot is the one in the tab order, and the arrow keys move between the
 * others — and move the carousel with them.
 */
const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots(
  {
    orientation: orientationProp,
    getLabel = (i) => `Slide ${i + 1}`,
    className,
    onKeyDown,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const context = useCarousel("Dots");
  const { index, count, loop, maxIndex, goTo } = context;
  const orientation = orientationProp ?? context.orientation;
  const total = count === 0 ? 0 : loop ? count : maxIndex + 1;
  const active = Math.min(index, Math.max(0, total - 1));

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // The dot that was just arrowed to is the one that has to hold focus, or
  // the roving tab index would leave focus on a dot that is no longer in it.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list || !list.contains(document.activeElement)) return;
    list.querySelector<HTMLElement>('[data-active]')?.focus({ preventScroll: true });
  }, [active]);

  const horizontal = orientation === "horizontal";
  const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
  const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

  return (
    <div
      ref={setRefs}
      role="group"
      aria-label={ariaLabel ?? "Choose a slide"}
      className={clsx(styles.dots, className)}
      data-forte="carousel-dots"
      data-orientation={orientation}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        let target: number | null = null;
        if (event.key === prevKey) target = active - 1;
        else if (event.key === nextKey) target = active + 1;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = total - 1;
        if (target === null) return;
        event.preventDefault();
        goTo(target, "control");
      }}
      {...props}
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          className={clsx(styles.dot, "forte-focus-ring", "forte-target")}
          data-forte="carousel-dot"
          data-active={i === active ? "" : undefined}
          aria-label={getLabel(i)}
          aria-current={i === active ? "true" : undefined}
          tabIndex={i === active ? 0 : -1}
          onClick={() => goTo(i, "control")}
        />
      ))}
    </div>
  );
});

/* -------------------------------------------------------------------------
 * Thumbs / Thumb
 * ---------------------------------------------------------------------- */

export interface CarouselThumbsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Which way the strip runs. Follows the carousel's own orientation unless
   * set — a vertical carousel with a row of thumbnails under it is fine.
   */
  orientation?: CarouselOrientation;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A strip of `Carousel.Thumb`s, one per slide in order, that scrolls to keep
 * the active one in view. Like the track, it reads each thumb's index from
 * its position among the children.
 */
const CarouselThumbs = React.forwardRef<HTMLDivElement, CarouselThumbsProps>(
  function CarouselThumbs({ orientation, className, children, "aria-label": ariaLabel, ...props }, ref) {
    const context = useCarousel("Thumbs");
    const axis = orientation ?? context.orientation;
    const stripRef = React.useRef<HTMLDivElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        stripRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    /* The strip scrolls itself, by arithmetic on the boxes rather than
     * `scrollIntoView`, which walks every scrollable ancestor and would pull
     * the PAGE to the thumbnails on every slide change. Smooth unless motion
     * is off — read from the token, so the in-page toggle counts. */
    React.useEffect(() => {
      const strip = stripRef.current;
      const thumb = strip?.querySelector<HTMLElement>('[data-forte="carousel-thumb"][data-active]');
      if (!strip || !thumb) return;
      const view = strip.getBoundingClientRect();
      const box = thumb.getBoundingClientRect();
      const start = axis === "horizontal" ? box.left - view.left : box.top - view.top;
      const end = axis === "horizontal" ? box.right - view.right : box.bottom - view.bottom;
      const delta = start < 0 ? start : Math.max(end, 0);
      if (delta === 0) return;
      const behavior: ScrollBehavior =
        getComputedStyle(strip).getPropertyValue("--forte-motion-ok").trim() === "0"
          ? "auto"
          : "smooth";
      strip.scrollBy(axis === "horizontal" ? { left: delta, behavior } : { top: delta, behavior });
    }, [context.index, axis]);

    return (
      <div
        ref={setRefs}
        role="group"
        aria-label={ariaLabel ?? "Choose a slide"}
        className={clsx(styles.thumbs, className)}
        data-forte="carousel-thumbs"
        data-orientation={axis}
        {...props}
      >
        {React.Children.toArray(children)
          .filter(React.isValidElement)
          .map((thumb, i) => (
            <ThumbSlotContext.Provider key={thumb.key ?? i} value={i}>
              {thumb}
            </ThumbSlotContext.Provider>
          ))}
      </div>
    );
  },
);

export interface CarouselThumbProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One thumbnail: a button that moves the carousel to the slide at the same
 * position. Give it an `aria-label` (or an image with `alt`) so the button
 * has a name.
 */
const CarouselThumb = React.forwardRef<HTMLButtonElement, CarouselThumbProps>(
  function CarouselThumb({ className, children, onClick, ...props }, ref) {
    const context = useCarousel("Thumb");
    const i = React.useContext(ThumbSlotContext);
    if (i < 0) throw new Error("Carousel.Thumb must be a direct child of Carousel.Thumbs.");
    const active = i === context.index;

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(styles.thumb, "forte-focus-ring", className)}
        data-forte="carousel-thumb"
        data-active={active ? "" : undefined}
        aria-current={active ? "true" : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.goTo(i, "control");
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* -------------------------------------------------------------------------
 * PlayPause
 * ---------------------------------------------------------------------- */

export interface CarouselPlayPauseProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children"> {
  /**
   * Accessible name while autoplay is running — the button's action.
   * @default "Pause"
   */
  pauseLabel?: string;
  /**
   * Accessible name while autoplay is stopped.
   * @default "Play"
   */
  playLabel?: string;
  /**
   * Replace the rendered element, to compose the control with `Button`.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Stops and restarts autoplay. Renders nothing when the root has no
 * `autoplay`, so it can be left in place. Its label names the action —
 * "Pause" while playing, "Play" while stopped — which is the whole of its
 * state, so it carries no `aria-pressed`.
 */
const CarouselPlayPause = React.forwardRef<HTMLButtonElement, CarouselPlayPauseProps>(
  function CarouselPlayPause(
    { pauseLabel = "Pause", playLabel = "Play", render, className, onClick, ...props },
    ref,
  ) {
    const context = useCarousel("PlayPause");
    const { autoplay, playing, setPlaying } = context;

    const element = useRender({
      render,
      ref,
      defaultTagName: "button",
      props: {
        type: "button",
        className: clsx(styles.control, styles.playPause, "forte-focus-ring", className),
        "data-forte": "carousel-play-pause",
        "data-playing": playing ? "" : undefined,
        "aria-label": playing ? pauseLabel : playLabel,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setPlaying(!playing);
        },
        ...props,
        children: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className={styles.controlIcon}
          >
            {playing ? (
              <path d="M4 3h3v10H4zM9 3h3v10H9z" />
            ) : (
              <path d="M5 3.2v9.6a.5.5 0 0 0 .76.43l7.7-4.8a.5.5 0 0 0 0-.86l-7.7-4.8A.5.5 0 0 0 5 3.2z" />
            )}
          </svg>
        ),
      },
    });

    return autoplay ? element : null;
  },
);

/* -------------------------------------------------------------------------
 * Namespace
 * ---------------------------------------------------------------------- */

/**
 * The carousel namespace — the viewport, its controls and its pagination.
 *
 * The catalogue tags sit HERE rather than on `CarouselRoot`, which is what
 * every other compound does (see `ButtonGroup`). docgen names the entry after
 * whatever carries them, so tagging the Root published a catalogue entry
 * called "CarouselRoot" — a name no consumer writes, and one that does not
 * kebab to this component's docs route.
 *
 * @summary A strip of slides shown one (or a few) at a time, moved by drag,
 *   by buttons or on a timer; for panels chosen by name rather than by
 *   position use Tabs, and for a list that merely scrolls use ScrollArea.
 * @category Content & layout
 */
export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Track: CarouselTrack,
  Slide: CarouselSlide,
  Prev: CarouselPrev,
  Next: CarouselNext,
  Dots: CarouselDots,
  Thumbs: CarouselThumbs,
  Thumb: CarouselThumb,
  PlayPause: CarouselPlayPause,
};
