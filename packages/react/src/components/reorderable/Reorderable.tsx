"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { claimGesture, gestureOwner } from "../../internal/claims";
import styles from "./Reorderable.module.css";

/* -------------------------------------------------------------------------
 * Reorderable
 *
 * Base UI has no drag-and-drop primitive, so this component owns its own
 * engine — a small one, because it solves one problem: the items of ONE list,
 * along one axis. Five decisions shape everything below.
 *
 * 1 — The order is the app's. `value` is the order on screen, and the
 *     component never changes it: during a drag it only DRAWS the move, by
 *     translating items, and on drop it reports the new order. The DOM order
 *     changes when, and only when, the app re-renders with a new `value` —
 *     the move it was offered, a different one, or none.
 *
 * 2 — Every hand-off between "where an item is drawn" and "where the layout
 *     puts it" is a FLIP. On drop, on cancel, and when the list changes under
 *     a drag (another user, an AI, an undo), the component reads every item's
 *     box before the commit (`CommitSnapshot`), lets React move the DOM,
 *     reads the new layout, and translates each item from the old box to the
 *     new one. So nothing jumps whatever the app does with the change —
 *     accept it, refuse it, or apply its own version of it.
 *
 * 3 — Geometry is a snapshot of UNTRANSLATED layout boxes in list space:
 *     offsets from the root's content origin, which scrolling does not move.
 *     A neighbor steps aside when the dragged item's leading edge crosses the
 *     neighbor's center — measured against the snapshot, never against the
 *     boxes in motion, so a swap cannot flip back and forth under a still
 *     pointer, and a short row passes a tall group after half of it rather
 *     than after half of itself.
 *
 * 4 — Gestures are claimed, never stopped. The innermost list owns a press
 *     (nesting), a handle owns its touches (ContextMenu cooperation), and the
 *     marks live on the events themselves (see `internal/claims.ts`). Nothing
 *     here calls `stopPropagation()`.
 *
 * 5 — Keys are handled on the handle, in a native listener, so every key the
 *     component acts on is `preventDefault`ed before any bubbling listener on
 *     the page sees it. That is the shortcut contract: an app's global
 *     handler skips `event.defaultPrevented` and never nudges or deletes
 *     during a keyboard drag.
 *
 * Positions are written straight to the DOM — `translate` and `transition`
 * inline, per frame — and React renders only when a drag starts or ends. The
 * transitions are inline for a reason of their own: a row that carries a
 * `transition-colors` utility would otherwise override a stylesheet's
 * `translate` transition, and every sibling would jump instead of sliding.
 * ---------------------------------------------------------------------- */

/** What identifies an item — the same thing you give it as a React `key`. */
export type ReorderableValue = string | number;

/** The axis the items run along. */
export type ReorderableOrientation = "vertical" | "horizontal";

/**
 * What moved an item. `"keyboard"` includes a screen reader's own keys,
 * which arrive as key presses.
 */
export type ReorderablePointerType = "mouse" | "pen" | "touch" | "keyboard";

/**
 * Why a drag ended without a drop.
 *
 * - `"escape"` — <kbd>Escape</kbd>, during a keyboard or a pointer drag.
 * - `"interrupted"` — the pointer was taken away (`pointercancel`), the
 *   window lost focus or the page was hidden, or focus left the handle of a
 *   keyboard drag.
 * - `"removed"` — the dragged item left `value`.
 * - `"disabled"` — the list or the dragged item became `disabled`.
 */
export type ReorderableCancelReason = "escape" | "interrupted" | "removed" | "disabled";

/** Passed to `onDragStart`. */
export interface ReorderableDragStartDetails<Value extends ReorderableValue = ReorderableValue> {
  /** The item being dragged — its `value`. */
  id: Value;
  /** Its index in `value`. */
  from: number;
  /** What is moving it. */
  pointerType: ReorderablePointerType;
  /** The event that started the drag. A touch that picked an item up by
   * holding still has none of its own, so this is its `pointerdown`. */
  event: Event;
}

/** Passed to `onValueChange` with the new order. */
export interface ReorderableChangeDetails<Value extends ReorderableValue = ReorderableValue> {
  /** The item that moved — its `value`. */
  id: Value;
  /**
   * The item whose place it took: the one that sat at `to` before the move.
   * Apply the move against THIS rather than against the indexes when your own
   * copy of the order may be out of date — in a collaborative document the
   * list can change between the drag starting and the drop.
   */
  overId: Value;
  /** Which side of `overId` the item now sits on. */
  placement: "before" | "after";
  /** Its index before the move. */
  from: number;
  /** Its index after the move. */
  to: number;
  /** What moved it. */
  pointerType: ReorderablePointerType;
  /** The event that dropped it — a `pointerup`, or a `keydown`. */
  event: Event;
}

/** Passed to `onDragEnd`. */
export interface ReorderableDragEndDetails<Value extends ReorderableValue = ReorderableValue> {
  /** The item that was dragged — its `value`. */
  id: Value;
  /** Its index when the drag started. */
  from: number;
  /** The index it was dropped at — `from` when it was put back where it
   * started, in which case `onValueChange` was not called. */
  to: number;
  /** What moved it. */
  pointerType: ReorderablePointerType;
  /** The event that dropped it. */
  event: Event;
}

/** Passed to `onDragCancel`. */
export interface ReorderableDragCancelDetails<Value extends ReorderableValue = ReorderableValue> {
  /** The item that was being dragged — its `value`. */
  id: Value;
  /** Its index when the drag started. */
  from: number;
  /** What was moving it. */
  pointerType: ReorderablePointerType;
  /** Why the drag ended without a drop. */
  reason: ReorderableCancelReason;
  /** The event behind the cancel, when there was one. */
  event: Event | undefined;
}

/** What the announcement messages are given. Positions count from 1. */
export interface ReorderableAnnouncement {
  /** The item's `label`, or its text when it has none. Can be empty. */
  label: string;
  /** Where the item is now. */
  position: number;
  /** Where the item was when the drag started. */
  from: number;
  /** How many items the list holds. */
  total: number;
}

/**
 * Every string the component speaks. Pass any subset to `messages` on the
 * root to translate or reword them; the rest keep their English defaults.
 */
export interface ReorderableMessages {
  /** The handle's accessible name, given the item's `label` (which can be
   * empty). A handle's own `aria-label` wins over this. */
  handle: (label: string) => string;
  /** How to operate a handle, read after its name. */
  instructions: string;
  /** Announced when an item is picked up. */
  pickedUp: (announcement: ReorderableAnnouncement) => string;
  /** Announced each time the dragged item changes position. */
  moved: (announcement: ReorderableAnnouncement) => string;
  /** Announced on drop, with the position the app actually committed. */
  dropped: (announcement: ReorderableAnnouncement) => string;
  /** Announced when a drag is canceled. */
  canceled: (announcement: ReorderableAnnouncement) => string;
  /** Announced when the dragged item is removed from the list mid-drag. */
  removed: (announcement: ReorderableAnnouncement) => string;
}

const name = (label: string) => label || "item";
const Name = (label: string) => label || "Item";

const DEFAULT_MESSAGES: ReorderableMessages = {
  handle: (label) => (label ? `Reorder ${label}` : "Reorder"),
  instructions:
    "Press Space or Enter to pick up. While holding the item, use the arrow keys to move it, Space or Enter to drop it, and Escape to cancel.",
  pickedUp: (a) => `Picked up ${name(a.label)}. Position ${a.position} of ${a.total}.`,
  moved: (a) => `${Name(a.label)}, position ${a.position} of ${a.total}.`,
  dropped: (a) =>
    a.position === a.from
      ? `${Name(a.label)} dropped where it started, at position ${a.position} of ${a.total}.`
      : `${Name(a.label)} dropped at position ${a.position} of ${a.total}.`,
  canceled: (a) => `Reorder canceled. ${Name(a.label)} is back at position ${a.from} of ${a.total}.`,
  removed: (a) => `${Name(a.label)} was removed from the list. Reorder canceled.`,
};

/* How far a mouse must travel before a press becomes a drag, in px. Far
 * enough that a click with a slightly unsteady hand is still a click. */
const DRAG_THRESHOLD = 4;

/* How long a finger must rest on an item WITHOUT a handle before it picks the
 * item up, in ms. The list scrolls under a finger that moves sooner. Shorter
 * than a platform long press (~500ms), so it wins the race against one. */
const HOLD_DELAY = 250;

/* How far a resting finger may wobble during the hold, in px, before the
 * gesture is read as the start of a scroll and let go. */
const HOLD_SLOP = 8;

/* The auto-scroll band at each edge of a scroll container, in px, and the
 * speed at its outer edge in px per millisecond — about 20px a frame. The
 * speed ramps in with the square of the depth, so the band's inner half is a
 * crawl for precise placement and its outer edge is for crossing a long list. */
const SCROLL_EDGE = 48;
const SCROLL_SPEED = 1.2;

/* A press that lands on one of these inside an item is the control's, not
 * the drag's: rows nearly always hold buttons, and a drag must never swallow
 * a `Menu` trigger, a checkbox or a text field. Roles as well as tags,
 * because Base UI renders several controls on spans. The item itself is never
 * tested, so a row rendered as a link or a button can still be dragged. */
const CONTROLS = [
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "summary",
  "a[href]",
  "area[href]",
  "audio[controls]",
  "video[controls]",
  "iframe",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="scrollbar"]',
  "[data-no-drag]",
].join(",");

/* Inline, not in the stylesheet — see the file header. The lift list rides
 * on every dragged item so its shadow, scale and fill ease in and out, and
 * `opacity` covers the placeholder fading back when a preview is dropped. */
const LIFT = ["box-shadow", "scale", "background-color", "border-radius", "opacity"]
  .map((property) => `${property} var(--forte-duration-fast) var(--forte-ease-standard)`)
  .join(", ");
const SLIDE = "translate var(--forte-reorderable-duration) var(--forte-reorderable-ease)";

/* The root's knobs a preview needs. It is portalled outside the root, so it
 * cannot inherit them, and an override written on the root has to reach it. */
const PREVIEW_KNOBS = [
  "--forte-reorderable-lift-shadow",
  "--forte-reorderable-lift-bg",
  "--forte-reorderable-lift-radius",
  "--forte-reorderable-lift-scale",
  "--forte-reorderable-cursor-active",
  "--forte-reorderable-z-index",
];

const useIsoLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* -------------------------------------------------------------------------
 * Helpers — pure, and outside the components so the geometry can be read
 * without React in the picture.
 * ---------------------------------------------------------------------- */

type Axis = "x" | "y";

/** A span along the drag axis. */
interface Span {
  start: number;
  end: number;
}

interface Geometry {
  axis: Axis;
  /** +1 when positions grow with the index; -1 in a right-to-left row or a
   * reversed flex direction. Read off the layout, never assumed. */
  dir: 1 | -1;
  /** Physical spans in list space, one per index. */
  phys: Span[];
  /** The same spans in index space — `dir` applied, so they always grow
   * with the index and one algorithm serves every direction. */
  slots: Span[];
  /** Each item's offset from the root on the other axis, for the preview. */
  cross: number[];
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
const mid = (span: Span) => (span.start + span.end) / 2;

function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

function sameOrder(a: readonly unknown[], b: readonly unknown[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (!Object.is(a[i], b[i])) return false;
  return true;
}

/** Whether a press on `target` landed on a control inside `item`. */
function startsOnControl(target: Element, item: Element) {
  for (let node: Element | null = target; node && node !== item; node = node.parentElement) {
    if (node.matches(CONTROLS)) return true;
  }
  return false;
}

/* Only px are ever written here, so only px are read back. Anything else —
 * a consumer's own percentage translate — reads as no offset rather than as
 * a number of the wrong unit. */
function readPx(value: string) {
  return value.endsWith("px") ? Number.parseFloat(value) || 0 : 0;
}

function readTranslate(style: CSSStyleDeclaration): [number, number] {
  if (!style.translate || style.translate === "none") return [0, 0];
  const [x = "0px", y = "0px"] = style.translate.split(" ");
  return [readPx(x), readPx(y)];
}

function readScale(style: CSSStyleDeclaration): [number, number] {
  if (!style.scale || style.scale === "none") return [1, 1];
  const [x = "1", y = x] = style.scale.split(" ");
  return [Number.parseFloat(x) || 1, Number.parseFloat(y) || 1];
}

/**
 * An element's box as the LAYOUT has it: `getBoundingClientRect()` with its
 * running `translate` and `scale` taken back out. Read this way rather than
 * by switching the translate off and measuring, because switching it off
 * mid-transition and back would restart every slide in the list from zero.
 */
function layoutBox(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const [tx, ty] = readTranslate(style);
  const [sx, sy] = readScale(style);
  const width = rect.width / sx;
  const height = rect.height / sy;
  const cx = (rect.left + rect.right) / 2 - tx;
  const cy = (rect.top + rect.bottom) / 2 - ty;
  return { left: cx - width / 2, top: cy - height / 2, width, height };
}

/** Where list space starts, in client coordinates, along `axis`. */
function listOrigin(root: HTMLElement, axis: Axis) {
  const rect = root.getBoundingClientRect();
  return axis === "y"
    ? rect.top + root.clientTop - root.scrollTop
    : rect.left + root.clientLeft - root.scrollLeft;
}

/**
 * The containers a drag may scroll, nearest first, ending with the page.
 * `overflow: hidden` is a scroll container too, but one the author has
 * deliberately made not user-scrollable, so it is left alone.
 */
function scrollParents(root: HTMLElement, axis: Axis) {
  const found: Element[] = [];
  for (let node: Element | null = root; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const overflow = axis === "y" ? style.overflowY : style.overflowX;
    if (overflow === "auto" || overflow === "scroll" || overflow === "overlay") found.push(node);
  }
  const page = document.scrollingElement;
  if (page && !found.includes(page)) found.push(page);
  return found;
}

function visibleSpan(element: Element, axis: Axis): Span {
  if (element === document.scrollingElement) {
    return { start: 0, end: axis === "y" ? window.innerHeight : window.innerWidth };
  }
  const rect = element.getBoundingClientRect();
  const start = axis === "y" ? rect.top + element.clientTop : rect.left + element.clientLeft;
  return { start, end: start + (axis === "y" ? element.clientHeight : element.clientWidth) };
}

function scrollBy(element: Element, axis: Axis, delta: number) {
  const before = axis === "y" ? element.scrollTop : element.scrollLeft;
  /* `instant` by name: the page may well say `scroll-behavior: smooth`, and a
   * smooth scroll per frame is an auto-scroll that never catches up. */
  element.scrollBy({ [axis === "y" ? "top" : "left"]: delta, behavior: "instant" });
  return (axis === "y" ? element.scrollTop : element.scrollLeft) - before;
}

/** Text of an item for announcements: its own words, not those of a list
 * nested inside it, a handle's, or anything hidden from assistive tech. */
function textLabel(element: HTMLElement | null) {
  if (!element) return "";
  let text = "";
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
      const el = node as Element;
      return el.matches(
        '[data-forte="reorderable"], [data-forte="reorderable-handle"], [aria-hidden="true"], [hidden]',
      )
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_SKIP;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) text += ` ${node.nodeValue}`;
  return text.replace(/\s+/g, " ").trim().slice(0, 80);
}

/** A `translate` along one axis. */
function along(axis: Axis, px: number) {
  return axis === "y" ? `0px ${px}px` : `${px}px 0px`;
}

function durationMs(value: string) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return value.trim().endsWith("ms") ? n : n * 1000;
}

/* -------------------------------------------------------------------------
 * The engine — one per root, created once. It holds everything that changes
 * per frame in plain variables rather than React state, and reaches React
 * only through the two setters it is handed.
 * ---------------------------------------------------------------------- */

interface ItemRecord {
  value: ReorderableValue;
  element: HTMLElement | null;
  handle: HTMLElement | null;
  disabled: boolean;
  handleOnly: boolean;
  label: string | undefined;
}

/** What the render needs to know about a drag in progress. */
interface DragState {
  id: ReorderableValue;
  pointerType: ReorderablePointerType;
  /** Whether a `Reorderable.Preview` stands in for the item. */
  preview: boolean;
  width: number;
  height: number;
  dir: "ltr" | "rtl";
  knobs: Record<string, string>;
}

interface Latest {
  value: readonly ReorderableValue[];
  orientation: ReorderableOrientation;
  disabled: boolean;
  dragThreshold: number;
  holdDelay: number;
  messages: ReorderableMessages;
  onValueChange?: (value: ReorderableValue[], details: ReorderableChangeDetails) => void;
  onDragStart?: (details: ReorderableDragStartDetails) => void;
  onDragEnd?: (details: ReorderableDragEndDetails) => void;
  onDragCancel?: (details: ReorderableDragCancelDetails) => void;
}

interface Pending {
  record: ItemRecord;
  pointerId: number;
  pointerType: "mouse" | "pen" | "touch";
  /** `distance`: a mouse, which picks up on movement. `hold`: a finger on an
   * item without a handle, which picks up by resting. `either`: a finger on
   * a handle, which does both — `touch-action: none` means there is no
   * scroll to tell apart. */
  mode: "distance" | "hold" | "either";
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  /** Where the item was DRAWN when pressed, as its running translate — not
   * zero when it is still sliding into place from the last drop. */
  drawnX: number;
  drawnY: number;
  timer: number;
  event: PointerEvent;
}

interface Session {
  id: ReorderableValue;
  label: string;
  from: number;
  target: number;
  pointerType: ReorderablePointerType;
  pointerId: number;
  order: ReorderableValue[];
  geo: Geometry;
  /** Where the pointer held the item, from its start edge, in index space. */
  grab: number;
  clientX: number;
  clientY: number;
  /** The dragged item's distance from its own slot, in index space. */
  offset: number;
  preview: boolean;
  /** Where (0, 0) actually lands for the preview — not the viewport's
   * corner when an ancestor of its container is transformed. */
  previewOrigin: { x: number; y: number };
  /** Keyboard only: the item the dragged one currently sits after, so an
   * outside change keeps it beside the same neighbor rather than at the
   * same number. */
  afterId: ReorderableValue | null;
  scrollers: Element[];
  lastFrame: number;
  event: Event;
}

interface Ending {
  kind: "drop" | "cancel";
  reason: ReorderableCancelReason | undefined;
  id: ReorderableValue;
  label: string;
  from: number;
  pointerType: ReorderablePointerType;
}

interface EngineDeps {
  rootRef: React.MutableRefObject<HTMLElement | null>;
  latest: React.MutableRefObject<Latest>;
  setDrag: (drag: DragState | null) => void;
  setDropping: (value: ReorderableValue | null) => void;
}

function createEngine({ rootRef, latest, setDrag, setDropping }: EngineDeps) {
  const owner = {};
  const registry = new Map<ReorderableValue, ItemRecord>();
  let session: Session | null = null;
  let pending: Pending | null = null;
  let frame = 0;
  let detachWindow: (() => void) | null = null;
  let live: HTMLElement | null = null;
  let previews = 0;
  let preview: HTMLElement | null = null;

  /* A commit that needs its "before" boxes: set by a drop or a cancel, and
   * implied by any commit while a drag is live. */
  let captureRequested = false;
  let firstBoxes: Map<ReorderableValue, DOMRect> | null = null;
  let firstPreview: DOMRect | null = null;
  let ending: Ending | null = null;
  let settleGeneration = 0;
  let settleTimer = 0;

  const announce = (text: string) => {
    if (live) live.textContent = text;
  };

  const announcement = (label: string, position: number, from: number): ReorderableAnnouncement => ({
    label,
    position: position + 1,
    from: from + 1,
    total: latest.current.value.length,
  });

  /* ---- Geometry ------------------------------------------------------- */

  function measure(order: readonly ReorderableValue[]): Geometry | null {
    const root = rootRef.current;
    if (!root) return null;
    const axis: Axis = latest.current.orientation === "horizontal" ? "x" : "y";
    const rootRect = root.getBoundingClientRect();
    const origin = listOrigin(root, axis);
    const phys: Span[] = [];
    const cross: number[] = [];
    let last = 0;
    for (const value of order) {
      const element = registry.get(value)?.element;
      if (!element?.isConnected) {
        // A value with no rendered item takes no room. It still gets a slot,
        // so indexes stay indexes into `value`.
        phys.push({ start: last, end: last });
        cross.push(0);
        continue;
      }
      const box = layoutBox(element);
      const start = (axis === "y" ? box.top : box.left) - origin;
      const size = axis === "y" ? box.height : box.width;
      phys.push({ start, end: start + size });
      cross.push(axis === "y" ? box.left - rootRect.left : box.top - rootRect.top);
      last = start + size;
    }
    const real = phys.filter((span) => span.end > span.start);
    const dir: 1 | -1 = real.length >= 2 && mid(real[1] as Span) < mid(real[0] as Span) ? -1 : 1;
    const slots = phys.map((span) => (dir === 1 ? span : { start: -span.end, end: -span.start }));
    return { axis, dir, phys, slots, cross };
  }

  /** Where the dragged item would land with its leading edge `offset` from
   * its own slot. A neighbor is passed once that edge crosses its center. */
  function targetFor(slots: Span[], from: number, offset: number) {
    const self = slots[from] as Span;
    const lead = self.end + offset;
    const trail = self.start + offset;
    let target = from;
    for (let i = from + 1; i < slots.length; i += 1) {
      if (lead > mid(slots[i] as Span)) target = i;
      else break;
    }
    if (target !== from) return target;
    for (let i = from - 1; i >= 0; i -= 1) {
      if (trail < mid(slots[i] as Span)) target = i;
      else break;
    }
    return target;
  }

  /** How far the dragged item travels, in index space, to sit in `target`. */
  function slotOffset(s: Session, target: number) {
    const { slots } = s.geo;
    const self = slots[s.from] as Span;
    if (target > s.from) return (slots[target] as Span).end - (self.end - self.start) - self.start;
    if (target < s.from) return (slots[target] as Span).start - self.start;
    return 0;
  }

  /* Each displaced neighbor moves by the same amount: the dragged item's
   * size plus the gap that followed (or preceded) it. Exact for an evenly
   * spaced list; for an uneven one it is off by the difference in gaps,
   * which the drop's FLIP absorbs. */
  function shiftFor(s: Session, index: number) {
    const { slots } = s.geo;
    const self = slots[s.from] as Span;
    if (s.target > s.from && index > s.from && index <= s.target) {
      return self.start - (slots[s.from + 1] as Span).start;
    }
    if (s.target < s.from && index >= s.target && index < s.from) {
      return self.end - (slots[s.from - 1] as Span).end;
    }
    return 0;
  }

  /* ---- Writing positions ---------------------------------------------- */

  function write(element: HTMLElement, translate: string, transition: string) {
    element.style.transition = transition;
    element.style.translate = translate;
  }

  function writeSiblings(s: Session) {
    for (let i = 0; i < s.order.length; i += 1) {
      if (i === s.from) continue;
      const element = registry.get(s.order[i] as ReorderableValue)?.element;
      if (element) write(element, along(s.geo.axis, s.geo.dir * shiftFor(s, i)), SLIDE);
    }
  }

  /* The dragged item itself. Following a pointer it moves with no easing at
   * all — an item that eases is an item that lags the finger. Held by the
   * keyboard, or standing in for a preview, it slides between slots like its
   * neighbors do. */
  function writeDragged(s: Session) {
    const element = registry.get(s.id)?.element;
    const pointerHeld = s.pointerType !== "keyboard" && !s.preview;
    const offset = pointerHeld ? s.offset : slotOffset(s, s.target);
    if (element) {
      write(element, along(s.geo.axis, s.geo.dir * offset), pointerHeld ? LIFT : `${SLIDE}, ${LIFT}`);
    }
    if (s.preview && preview) placePreview(s, preview);
  }

  function placePreview(s: Session, element: HTMLElement) {
    const root = rootRef.current;
    if (!root) return;
    const { axis, dir, slots, cross } = s.geo;
    const self = slots[s.from] as Span;
    const start = self.start + s.offset;
    const size = self.end - self.start;
    // Back from index space to a physical start edge.
    const physical = dir === 1 ? start : -(start + size);
    const rootRect = root.getBoundingClientRect();
    const main = listOrigin(root, axis) + physical;
    const other = (axis === "y" ? rootRect.left : rootRect.top) + (cross[s.from] ?? 0);
    const x = axis === "y" ? other : main;
    const y = axis === "y" ? main : other;
    element.style.translate = `${x - s.previewOrigin.x}px ${y - s.previewOrigin.y}px`;
  }

  /* ---- Pointer drags -------------------------------------------------- */

  function applyPointer(s: Session) {
    const root = rootRef.current;
    if (!root) return;
    const { axis, dir, slots } = s.geo;
    const pointer = dir * ((axis === "y" ? s.clientY : s.clientX) - listOrigin(root, axis));
    const self = slots[s.from] as Span;
    const first = slots[0] as Span;
    const last = slots[slots.length - 1] as Span;
    /* Clamped to the list's own extent. Unclamped, an item dragged past the
     * end of a list inside a scroll container is scrollable overflow — the
     * container grows, auto-scroll follows it, and the drag runs away. */
    const start = clamp(pointer - s.grab, first.start, last.end - (self.end - self.start));
    s.offset = start - self.start;
    const target = targetFor(slots, s.from, s.offset);
    if (target !== s.target) {
      s.target = target;
      writeSiblings(s);
      const latestMessages = latest.current.messages;
      announce(latestMessages.moved(announcement(s.label, target, s.from)));
    }
    writeDragged(s);
  }

  /** One step of auto-scroll. Returns whether the pointer is in a band that
   * can still scroll, which is what keeps the frame loop alive. */
  function autoScroll(s: Session, elapsed: number) {
    const root = rootRef.current;
    if (!root) return false;
    const { axis } = s.geo;
    const pointer = axis === "y" ? s.clientY : s.clientX;
    const rootRect = root.getBoundingClientRect();
    const listStart = axis === "y" ? rootRect.top : rootRect.left;
    const listEnd = axis === "y" ? rootRect.bottom : rootRect.right;
    for (const scroller of s.scrollers) {
      const view = visibleSpan(scroller, axis);
      const band = Math.min(SCROLL_EDGE, (view.end - view.start) / 4);
      let depth = 0;
      // Only toward more LIST: a container scrolled past the list's end has
      // nothing to offer a reorder, and the page would otherwise scroll away
      // under a list that is entirely on screen.
      if (pointer < view.start + band && listStart < view.start - 0.5) {
        depth = -Math.min(1, (view.start + band - pointer) / band);
      } else if (pointer > view.end - band && listEnd > view.end + 0.5) {
        depth = Math.min(1, (pointer - (view.end - band)) / band);
      }
      if (depth === 0) continue;
      const moved = scrollBy(scroller, axis, Math.sign(depth) * depth * depth * SCROLL_SPEED * elapsed);
      if (moved !== 0) return true;
    }
    return false;
  }

  function tick(now: number) {
    frame = 0;
    const s = session;
    if (!s || s.pointerType === "keyboard") return;
    const elapsed = s.lastFrame ? Math.min(now - s.lastFrame, 48) : 16;
    s.lastFrame = now;
    const scrolling = autoScroll(s, elapsed);
    applyPointer(s);
    if (scrolling) frame = requestAnimationFrame(tick);
    else s.lastFrame = 0;
  }

  function schedule() {
    if (frame === 0) frame = requestAnimationFrame(tick);
  }

  function clearPending() {
    if (!pending) return;
    window.clearTimeout(pending.timer);
    pending = null;
    if (!session) detach();
  }

  function attach() {
    if (detachWindow) return;
    const onMove = (event: PointerEvent) => {
      const p = pending;
      if (p && event.pointerId === p.pointerId) {
        if (p.pointerType === "mouse" && event.buttons === 0) {
          // The release happened somewhere we never heard about.
          clearPending();
          return;
        }
        p.lastX = event.clientX;
        p.lastY = event.clientY;
        const distance = Math.hypot(event.clientX - p.x, event.clientY - p.y);
        if (p.mode === "hold") {
          if (distance > HOLD_SLOP) clearPending();
          return;
        }
        if (distance >= latest.current.dragThreshold) activate(p, event);
        return;
      }
      const s = session;
      if (!s || event.pointerId !== s.pointerId) return;
      if (s.pointerType === "mouse" && event.buttons === 0) {
        drop(event);
        return;
      }
      s.clientX = event.clientX;
      s.clientY = event.clientY;
      s.event = event;
      schedule();
    };
    const onUp = (event: PointerEvent) => {
      if (pending && event.pointerId === pending.pointerId) clearPending();
      else if (session && event.pointerId === session.pointerId) drop(event);
    };
    const onCancel = (event: PointerEvent) => {
      if (pending && event.pointerId === pending.pointerId) clearPending();
      else if (session && event.pointerId === session.pointerId) cancel("interrupted", event);
    };
    /* Capture phase on the window — the first listener anywhere — so the
     * page's own Escape handling sees the event already prevented. */
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !session || session.pointerType === "keyboard") return;
      event.preventDefault();
      cancel("escape", event);
    };
    const onInterrupt = () => {
      clearPending();
      if (session && session.pointerType !== "keyboard") cancel("interrupted", undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onInterrupt();
    };
    // Scrolling the list by wheel mid-drag moves the list under a still
    // pointer, which is a move like any other.
    const onScroll = () => {
      if (session && session.pointerType !== "keyboard") schedule();
    };
    /* A finger that picked an item up by holding still started on a surface
     * that allows panning, so the browser would claim the first real move
     * for a scroll — and `pointercancel` the drag. Cancelling the touchmove
     * is the one way left to say no once the gesture has begun. */
    const onTouchMove = (event: TouchEvent) => {
      if (session && session.pointerType !== "mouse" && session.pointerType !== "keyboard" && event.cancelable) {
        event.preventDefault();
      }
    };
    /* A finger still holding an item past the platform's long-press time is
     * dragging, not asking for a menu: Android would otherwise open its own,
     * or a ContextMenu around the row would. Window, capture phase, so the
     * claim is on the event before any trigger sees it. */
    const onContextMenu = (event: MouseEvent) => {
      if (!session || session.pointerType === "mouse" || session.pointerType === "keyboard") return;
      claimGesture(event, owner);
      event.preventDefault();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", onInterrupt);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("visibilitychange", onVisibility);
    detachWindow = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onInterrupt);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }

  function detach() {
    detachWindow?.();
    detachWindow = null;
  }

  /** A press on an item. Nothing is prevented and nothing is captured yet:
   * a press is a click until it moves, and the click belongs to whatever it
   * landed on. */
  function pressItem(record: ItemRecord, event: React.PointerEvent<HTMLElement>) {
    const native = event.nativeEvent;
    // The innermost list owns the press; an outer list's item, reached a
    // moment later as the event bubbles, stays put.
    if (gestureOwner(native) !== undefined) return;
    claimGesture(native, owner);
    if (event.defaultPrevented || !event.isPrimary || session || pending) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (latest.current.disabled || record.disabled || !record.element) return;

    const target = native.target instanceof Element ? native.target : null;
    if (!target) return;
    const onHandle = record.handle != null && record.handle.contains(target);
    if (!onHandle && startsOnControl(target, record.element)) return;

    const pointerType = event.pointerType === "mouse" ? "mouse" : event.pointerType === "pen" ? "pen" : "touch";
    let mode: Pending["mode"];
    if (pointerType === "mouse") {
      if (record.handleOnly && !onHandle) return;
      mode = "distance";
    } else if (record.handle) {
      /* With a handle, a finger anywhere else scrolls the list — that is what
       * the handle is FOR on a touch screen. */
      if (!onHandle) return;
      mode = "either";
    } else {
      if (record.handleOnly) return;
      mode = "hold";
    }

    const [drawnX, drawnY] = readTranslate(getComputedStyle(record.element));
    const p: Pending = {
      record,
      pointerId: event.pointerId,
      pointerType,
      mode,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      drawnX,
      drawnY,
      timer: 0,
      event: native,
    };
    if (mode !== "distance") {
      p.timer = window.setTimeout(() => {
        if (pending === p) activate(p, p.event, p.lastX, p.lastY);
      }, latest.current.holdDelay);
    }
    pending = p;
    attach();
  }

  function begin(
    record: ItemRecord,
    pointerType: ReorderablePointerType,
    event: Event,
  ): Session | null {
    const root = rootRef.current;
    const order = latest.current.value;
    const from = order.indexOf(record.value);
    if (!root || from < 0 || !record.element) return null;
    const geo = measure(order);
    if (!geo) return null;

    // A drag that starts while the last one is still settling takes over
    // from where every item IS; its cleanup must not clear the new drag's
    // positions when its timer fires.
    settleGeneration += 1;
    window.clearTimeout(settleTimer);

    const box = layoutBox(record.element);
    const usePreview = pointerType !== "keyboard" && previews > 0;
    const knobs: Record<string, string> = {};
    if (usePreview) {
      const computed = getComputedStyle(root);
      for (const knob of PREVIEW_KNOBS) knobs[knob] = computed.getPropertyValue(knob).trim();
    }
    const s: Session = {
      id: record.value,
      label: record.label ?? textLabel(record.element),
      from,
      target: from,
      pointerType,
      pointerId: -1,
      order: order.slice(),
      geo,
      grab: 0,
      clientX: 0,
      clientY: 0,
      offset: 0,
      preview: usePreview,
      previewOrigin: { x: 0, y: 0 },
      afterId: from > 0 ? (order[from - 1] as ReorderableValue) : null,
      scrollers: scrollParents(root, geo.axis),
      lastFrame: 0,
      event,
    };
    session = s;
    /* Committed now rather than with the next render: the attributes switch
     * the lift on and, for a preview, mount the element the first frame has
     * to position. */
    flushSync(() => {
      setDropping(null);
      setDrag({
        id: record.value,
        pointerType,
        preview: usePreview,
        width: box.width,
        height: box.height,
        dir: getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr",
        knobs,
      });
    });
    if (usePreview && preview) {
      // Measured with no translate: whatever the box's center is off from
      // the viewport's corner is the containing block's offset.
      preview.style.translate = "0px 0px";
      const rect = preview.getBoundingClientRect();
      s.previewOrigin = {
        x: (rect.left + rect.right) / 2 - preview.offsetWidth / 2,
        y: (rect.top + rect.bottom) / 2 - preview.offsetHeight / 2,
      };
    }
    return s;
  }

  function activate(p: Pending, event: Event, clientX = p.lastX, clientY = p.lastY) {
    window.clearTimeout(p.timer);
    pending = null;
    const s = begin(p.record, p.pointerType, event);
    const root = rootRef.current;
    if (!s || !root) {
      detach();
      return;
    }
    const { axis, dir } = s.geo;
    /* The grab point is where the press LANDED on the item as it was DRAWN:
     * the item jumps the few pixels of threshold to sit under the pointer
     * again rather than trailing it by that much for the rest of the drag,
     * and an item caught while still settling from the last drop is held
     * where it was caught rather than snapping to its slot first. */
    const pressed = dir * ((axis === "y" ? p.y : p.x) - listOrigin(root, axis));
    const drawn = dir * (axis === "y" ? p.drawnY : p.drawnX);
    s.grab = pressed - ((s.geo.slots[s.from] as Span).start + drawn);
    s.pointerId = p.pointerId;
    s.clientX = clientX;
    s.clientY = clientY;

    /* Captured on the ROOT, not the item: the click a mouse sends after the
     * release then lands on the list rather than on the row under the
     * pointer, so a drag is never also a click on whatever it ended over —
     * without stopping the event. Capture also keeps the stream flowing over
     * an iframe. Defensively, because it throws for a pointer that is no
     * longer active. */
    try {
      root.setPointerCapture(p.pointerId);
    } catch {
      // Without capture the drag still works; the release may click the row.
    }
    if (p.pointerType === "mouse") window.getSelection()?.removeAllRanges();

    applyPointer(s);
    attach();
    schedule();
    latest.current.onDragStart?.({ id: s.id, from: s.from, pointerType: s.pointerType, event });
    announce(latest.current.messages.pickedUp(announcement(s.label, s.from, s.from)));
  }

  /* ---- Keyboard drags ------------------------------------------------- */

  function pickUp(record: ItemRecord, event: KeyboardEvent) {
    const s = begin(record, "keyboard", event);
    if (!s) return;
    writeDragged(s);
    latest.current.onDragStart?.({ id: s.id, from: s.from, pointerType: "keyboard", event });
    announce(latest.current.messages.pickedUp(announcement(s.label, s.from, s.from)));
  }

  function moveTo(s: Session, target: number, event: KeyboardEvent) {
    const next = clamp(target, 0, s.order.length - 1);
    s.event = event;
    if (next === s.target) return;
    s.target = next;
    s.offset = slotOffset(s, next);
    const projected = arrayMove(s.order, s.from, next);
    s.afterId = next > 0 ? (projected[next - 1] as ReorderableValue) : null;
    writeSiblings(s);
    writeDragged(s);
    reveal(s);
    announce(latest.current.messages.moved(announcement(s.label, next, s.from)));
  }

  /** Keeps a keyboard-dragged item on screen: scrolls each container the
   * least that shows the slot it is heading for. */
  function reveal(s: Session) {
    const root = rootRef.current;
    if (!root) return;
    const { axis, dir, slots } = s.geo;
    const self = slots[s.from] as Span;
    const size = self.end - self.start;
    const start = self.start + slotOffset(s, s.target);
    const physical = dir === 1 ? start : -(start + size);
    const pad = 8;
    for (const scroller of s.scrollers) {
      const lo = listOrigin(root, axis) + physical;
      const hi = lo + size;
      const view = visibleSpan(scroller, axis);
      let delta = 0;
      if (hi - lo > view.end - view.start || lo < view.start) delta = lo - view.start - pad;
      else if (hi > view.end) delta = hi - view.end + pad;
      if (delta !== 0) scrollBy(scroller, axis, delta);
    }
  }

  function arrowStep(s: Session, key: string) {
    if (s.geo.axis === "y") {
      if (key === "ArrowDown") return s.geo.dir;
      if (key === "ArrowUp") return -s.geo.dir;
    } else {
      // Physical, like the drag the key stands in for: the item moves the
      // way the arrow points, right-to-left rows included.
      if (key === "ArrowRight") return s.geo.dir;
      if (key === "ArrowLeft") return -s.geo.dir;
    }
    return 0;
  }

  /** Returns whether the key was the component's. */
  function handleKey(record: ItemRecord, event: KeyboardEvent): boolean {
    const s = session;
    if (s && s.pointerType === "keyboard") {
      if (s.id !== record.value) return false;
      // Tab leaves, and leaving cancels; browser and system shortcuts are
      // never the list's to swallow.
      if (event.key === "Tab" || event.ctrlKey || event.metaKey) return false;
      /* Everything else is the drag's while it lasts — including keys it
       * does nothing with. That is the contract: an app's Delete or nudge
       * shortcut sees `defaultPrevented` and keeps its hands off. */
      event.preventDefault();
      if (event.repeat && (event.key === " " || event.key === "Enter")) return true;
      switch (event.key) {
        case " ":
        case "Enter":
          drop(event);
          break;
        case "Escape":
          cancel("escape", event);
          break;
        case "Home":
          moveTo(s, 0, event);
          break;
        case "End":
          moveTo(s, s.order.length - 1, event);
          break;
        default: {
          const step = arrowStep(s, event.key);
          if (step !== 0) moveTo(s, s.target + step, event);
        }
      }
      return true;
    }
    if (s || pending || event.defaultPrevented || event.repeat) return false;
    if (event.key !== " " && event.key !== "Enter") return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    if (latest.current.disabled || record.disabled) return false;
    event.preventDefault();
    pickUp(record, event);
    return true;
  }

  /* Focus leaving the handle cancels a keyboard drag — but not when the
   * "leaving" is React moving the row's DOM node because the list changed
   * underneath (a moved node drops focus). The check waits a microtask: the
   * commit's layout effect has put focus back by then, if that is all it
   * was. */
  function handleBlur(record: ItemRecord) {
    const s = session;
    if (!s || s.pointerType !== "keyboard" || s.id !== record.value) return;
    queueMicrotask(() => {
      const current = session;
      if (!current || current !== s) return;
      const handle = registry.get(current.id)?.handle;
      if (handle && document.activeElement === handle) return;
      cancel("interrupted", undefined);
    });
  }

  /* ---- Ending a drag -------------------------------------------------- */

  function stop() {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    const s = session;
    const root = rootRef.current;
    if (s && s.pointerId >= 0 && root?.hasPointerCapture(s.pointerId)) {
      root.releasePointerCapture(s.pointerId);
    }
    session = null;
    detach();
  }

  function drop(event: Event) {
    const s = session;
    if (!s) return;
    // Land on the newest coordinate, not on wherever the last frame stopped.
    if (s.pointerType !== "keyboard") applyPointer(s);
    stop();
    const { id, from, target: to, order } = s;
    ending = { kind: "drop", reason: undefined, id, label: s.label, from, pointerType: s.pointerType };
    captureRequested = true;
    /* The app's callbacks run inside `try`: one that throws still leaves the
     * list out of its drag, rather than stuck with `data-reordering` on and
     * nothing left to end it. The error itself still reaches the app. */
    try {
      if (to !== from) {
        latest.current.onValueChange?.(arrayMove(order, from, to), {
          id,
          overId: order[to] as ReorderableValue,
          placement: to > from ? "after" : "before",
          from,
          to,
          pointerType: s.pointerType,
          event,
        });
      }
      latest.current.onDragEnd?.({ id, from, to, pointerType: s.pointerType, event });
    } finally {
      setDrag(null);
      setDropping(id);
    }
  }

  function cancel(reason: ReorderableCancelReason, event: Event | undefined) {
    const s = session;
    if (!s) return;
    stop();
    ending = { kind: "cancel", reason, id: s.id, label: s.label, from: s.from, pointerType: s.pointerType };
    captureRequested = true;
    try {
      latest.current.onDragCancel?.({ id: s.id, from: s.from, pointerType: s.pointerType, reason, event });
    } finally {
      setDrag(null);
      setDropping(reason === "removed" ? null : s.id);
    }
  }

  /* ---- Commits -------------------------------------------------------- */

  /** Read by the root's render: does the coming commit need "before" boxes? */
  function shouldCapture() {
    return captureRequested || session !== null;
  }

  /** Runs in `getSnapshotBeforeUpdate` — after render, before React touches
   * the DOM — so the boxes are exactly what was last painted. */
  function capture() {
    const boxes = new Map<ReorderableValue, DOMRect>();
    for (const [value, record] of registry) {
      if (record.element?.isConnected) boxes.set(value, record.element.getBoundingClientRect());
    }
    firstBoxes = boxes;
    firstPreview = preview?.isConnected ? preview.getBoundingClientRect() : null;
  }

  /** The root's layout effect, after every commit. */
  function commit(value: readonly ReorderableValue[], disabled: boolean) {
    const boxes = firstBoxes;
    const previewBox = firstPreview;
    firstBoxes = null;
    firstPreview = null;
    const s = session;
    if (s) {
      const record = registry.get(s.id);
      if (!record?.element?.isConnected) abort(s, "removed", boxes);
      else if (disabled || record.disabled) abort(s, "disabled", boxes);
      else if (boxes && !sameOrder(value, s.order)) reflow(s, value, boxes);
      return;
    }
    if (captureRequested && ending && boxes) settle(boxes, previewBox, ending, value);
    captureRequested = false;
    ending = null;
  }

  /* An ending the component noticed itself, in the commit that caused it —
   * the dragged item gone from the list, or the list disabled. The DOM has
   * already changed, and the boxes from before it are in hand, so the FLIP
   * runs now rather than a commit later, when "before" would already be the
   * wrong picture. */
  function abort(s: Session, reason: ReorderableCancelReason, boxes: Map<ReorderableValue, DOMRect> | null) {
    stop();
    const value = latest.current.value;
    const end: Ending = { kind: "cancel", reason, id: s.id, label: s.label, from: s.from, pointerType: s.pointerType };
    try {
      if (boxes) settle(boxes, null, end, value);
      latest.current.onDragCancel?.({ id: s.id, from: s.from, pointerType: s.pointerType, reason, event: undefined });
    } finally {
      setDrag(null);
      setDropping(reason === "removed" ? null : s.id);
    }
  }

  /* The list changed while a drag is live. Re-measure, keep the dragged item
   * where the pointer (or, for a keyboard drag, its neighbor) says it is, and
   * FLIP every other item from where it was drawn to where it now belongs. */
  function reflow(s: Session, value: readonly ReorderableValue[], boxes: Map<ReorderableValue, DOMRect>) {
    const root = rootRef.current;
    if (!root) return;
    const records = [...registry.values()].filter((r) => r.element?.isConnected);
    for (const r of records) write(r.element as HTMLElement, "", "none");
    const geo = measure(value);
    if (!geo) return;
    const from = value.indexOf(s.id);
    s.order = value.slice();
    s.from = from;
    s.geo = geo;
    s.scrollers = scrollParents(root, geo.axis);
    if (s.pointerType === "keyboard") {
      const others = s.order.filter((v) => v !== s.id);
      const after = s.afterId === null ? -1 : others.indexOf(s.afterId);
      s.target = after < 0 && s.afterId !== null ? clamp(s.target, 0, others.length) : after + 1;
      s.offset = slotOffset(s, s.target);
    } else {
      const pointer = geo.dir * ((geo.axis === "y" ? s.clientY : s.clientX) - listOrigin(root, geo.axis));
      const self = geo.slots[from] as Span;
      const first = geo.slots[0] as Span;
      const last = geo.slots[geo.slots.length - 1] as Span;
      const start = clamp(pointer - s.grab, first.start, last.end - (self.end - self.start));
      s.offset = start - self.start;
      s.target = targetFor(geo.slots, from, s.offset);
    }
    // Invert: every item drawn where it was a moment ago — except one a
    // pointer is holding, which is wherever the pointer says.
    const pointerHeld = s.pointerType !== "keyboard" && !s.preview;
    const now = new Map<ReorderableValue, DOMRect>();
    for (const r of records) now.set(r.value, (r.element as HTMLElement).getBoundingClientRect());
    for (const r of records) {
      if (r.value === s.id && pointerHeld) continue;
      const before = boxes.get(r.value);
      const after = now.get(r.value);
      if (!before || !after) continue;
      write(r.element as HTMLElement, `${before.left - after.left}px ${before.top - after.top}px`, "none");
    }
    void root.offsetWidth;
    // Play: on to the new places, while the dragged item stays put.
    writeSiblings(s);
    writeDragged(s);
    const handle = registry.get(s.id)?.handle;
    if (s.pointerType === "keyboard" && handle && document.activeElement !== handle) {
      handle.focus({ preventScroll: true });
    }
  }

  /* The drop or the cancel has committed: FLIP every item from the box it
   * was drawn in to the one the layout now gives it, announce the outcome
   * the app actually committed, and put focus back if the move took it. */
  function settle(
    boxes: Map<ReorderableValue, DOMRect>,
    previewBox: DOMRect | null,
    end: Ending,
    value: readonly ReorderableValue[],
  ) {
    const root = rootRef.current;
    if (!root) return;
    const records = [...registry.values()].filter((r) => r.element?.isConnected);
    /* Translates off to measure. The dropped item keeps its lift list, so the
     * shadow and the scale it is losing still fade rather than snap. */
    for (const r of records) write(r.element as HTMLElement, "", r.value === end.id ? LIFT : "none");
    const now = new Map<ReorderableValue, DOMRect>();
    for (const r of records) now.set(r.value, (r.element as HTMLElement).getBoundingClientRect());
    const moving: HTMLElement[] = [];
    for (const r of records) {
      const before = r.value === end.id && previewBox ? previewBox : boxes.get(r.value);
      const after = now.get(r.value);
      if (!before || !after) continue;
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      (r.element as HTMLElement).style.translate = `${dx}px ${dy}px`;
      moving.push(r.element as HTMLElement);
    }
    if (moving.length > 0) void root.offsetWidth;
    for (const element of moving) {
      const dropped = registry.get(end.id)?.element === element;
      write(element, "0px 0px", dropped ? `${SLIDE}, ${LIFT}` : SLIDE);
    }

    const generation = ++settleGeneration;
    window.clearTimeout(settleTimer);
    const computed = getComputedStyle(root);
    const wait = Math.max(
      durationMs(computed.getPropertyValue("--forte-reorderable-duration")),
      durationMs(computed.getPropertyValue("--forte-duration-fast")),
    );
    settleTimer = window.setTimeout(() => {
      if (generation !== settleGeneration || session) return;
      for (const r of registry.values()) {
        if (r.element) write(r.element, "", "");
      }
      setDropping(null);
    }, wait + 50);

    const messages = latest.current.messages;
    const index = value.indexOf(end.id);
    const total = value.length;
    const info = { label: end.label, from: end.from + 1, total };
    if (end.kind === "drop") {
      announce(messages.dropped({ ...info, position: index < 0 ? end.from + 1 : index + 1 }));
    } else if (end.reason === "removed") {
      announce(messages.removed({ ...info, position: end.from + 1 }));
    } else {
      announce(messages.canceled({ ...info, position: end.from + 1 }));
    }

    if (end.pointerType === "keyboard") {
      const active = document.activeElement;
      const lost = active === null || active === document.body || !active.isConnected;
      const next =
        index >= 0
          ? registry.get(end.id)?.handle
          : registry.get(value[Math.min(end.from, value.length - 1)] as ReorderableValue)?.handle;
      if (lost && next?.isConnected) next.focus({ preventScroll: true });
    }
  }

  /* ---- Registration --------------------------------------------------- */

  function register(record: ItemRecord) {
    registry.set(record.value, record);
    return () => {
      if (registry.get(record.value) === record) registry.delete(record.value);
    };
  }

  function registerPreview() {
    previews += 1;
    return () => {
      previews -= 1;
    };
  }

  function setPreviewElement(element: HTMLElement | null) {
    preview = element;
  }

  function setLive(element: HTMLElement | null) {
    live = element;
  }

  function dispose() {
    clearPending();
    stop();
    window.clearTimeout(settleTimer);
  }

  return {
    owner,
    rootElement: () => rootRef.current,
    register,
    registerPreview,
    setPreviewElement,
    setLive,
    pressItem,
    handleKey,
    handleBlur,
    shouldCapture,
    capture,
    commit,
    dispose,
  };
}

type Engine = ReturnType<typeof createEngine>;

/* -------------------------------------------------------------------------
 * Commit snapshot
 *
 * `getSnapshotBeforeUpdate` is the one place React offers to read the DOM
 * after a render and before its commit changes anything — exactly the
 * "first" of a FLIP. A class, because there is no hook for it. It renders
 * nothing; it is the root's last child so it updates whenever the root does.
 * ---------------------------------------------------------------------- */

class CommitSnapshot extends React.Component<{ engine: Engine; active: boolean }> {
  getSnapshotBeforeUpdate() {
    if (this.props.active) this.props.engine.capture();
    return null;
  }

  componentDidUpdate() {
    // Required alongside getSnapshotBeforeUpdate; the root's layout effect
    // does the work, after every item's own effects have run.
  }

  render() {
    return null;
  }
}

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface RootContextValue {
  orientation: ReorderableOrientation;
  disabled: boolean;
  handleOnly: boolean;
  drag: DragState | null;
  dropping: ReorderableValue | null;
  instructionsId: string;
  messages: ReorderableMessages;
  engine: Engine;
}

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext(part: string) {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(`forte-ui: <Reorderable.${part}> must be rendered inside <Reorderable.Root>.`);
  }
  return context;
}

interface ItemContextValue {
  record: ItemRecord;
  disabled: boolean;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ReorderableRootProps<Value extends ReorderableValue = ReorderableValue>
  extends Omit<
    React.ComponentPropsWithoutRef<"ul">,
    "className" | "defaultValue" | "onDragStart" | "onDragEnd"
  > {
  /**
   * The order on screen, as the items' `value`s. Required, and the only
   * order there is: render the items in this order, and update it from
   * `onValueChange`.
   */
  value: readonly Value[];
  /**
   * Called on drop with the new order — when the order changed; a drop where
   * the drag started calls only `onDragEnd`. Apply it, apply your own version
   * of it, or ignore it: the items animate to whatever `value` you render
   * next. Update in the same event, as an optimistic change, and reconcile
   * with a server afterwards; an order that arrives later than the next
   * frame is drawn as a second move.
   */
  onValueChange?: (value: Value[], details: ReorderableChangeDetails<Value>) => void;
  /**
   * The axis the items run along. `"horizontal"` also lays the root out as a
   * row; the arrow keys follow the axis, physically, right-to-left included.
   * @default "vertical"
   */
  orientation?: ReorderableOrientation;
  /**
   * Turns reordering off for the whole list. A drag in progress is canceled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether a mouse needs the handle too. A finger always does when an item
   * has one; with this set, a mouse press anywhere else on the item is
   * ignored as well. Overridable per item.
   * @default false
   */
  handleOnly?: boolean;
  /**
   * How far a mouse must move, in px, before a press becomes a drag. Below
   * it, the press is a click.
   * @default 4
   */
  dragThreshold?: number;
  /**
   * How long a finger must rest on an item without a handle, in ms, before
   * it picks the item up. A finger that moves sooner scrolls the list.
   * @default 250
   */
  holdDelay?: number;
  /**
   * The strings the component speaks — the handle's name, its instructions
   * and the live announcements. Pass any subset to translate or reword them.
   */
  messages?: Partial<ReorderableMessages>;
  /** Called when an item is picked up. */
  onDragStart?: (details: ReorderableDragStartDetails<Value>) => void;
  /** Called when an item is dropped, moved or not — after `onValueChange`. */
  onDragEnd?: (details: ReorderableDragEndDetails<Value>) => void;
  /**
   * Called when a drag ends without a drop. Every `onDragStart` is followed
   * by exactly one `onDragEnd` or `onDragCancel` — unless the list unmounts
   * mid-drag, which ends it silently.
   */
  onDragCancel?: (details: ReorderableDragCancelDetails<Value>) => void;
  /**
   * Replaces the rendered `<ul>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

type ReorderableRootComponent = <Value extends ReorderableValue = ReorderableValue>(
  props: ReorderableRootProps<Value> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;

/**
 * The list. Owns the drag: which item is moving, where every other item has
 * stepped aside to, and the announcements. It renders a `<ul>` — swap it with
 * `render` — and is laid out by you: a vertical list stacks as block content,
 * a horizontal one becomes a flex row.
 *
 * ```tsx
 * <Reorderable.Root value={ids} onValueChange={setIds}>
 *   {ids.map((id) => (
 *     <Reorderable.Item key={id} value={id}>
 *       <Reorderable.Handle />
 *       {names[id]}
 *     </Reorderable.Item>
 *   ))}
 * </Reorderable.Root>
 * ```
 */
export const ReorderableRoot = React.forwardRef(function ReorderableRoot(
  {
    value,
    onValueChange,
    orientation = "vertical",
    disabled = false,
    handleOnly = false,
    dragThreshold = DRAG_THRESHOLD,
    holdDelay = HOLD_DELAY,
    messages: messagesProp,
    onDragStart,
    onDragEnd,
    onDragCancel,
    render,
    className,
    children,
    onPointerDown,
    ...props
  }: ReorderableRootProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [dropping, setDropping] = React.useState<ReorderableValue | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const instructionsId = React.useId();

  const messages = React.useMemo(
    () => ({ ...DEFAULT_MESSAGES, ...messagesProp }),
    [messagesProp],
  );

  const latest = React.useRef<Latest>(null as unknown as Latest);
  latest.current = {
    value,
    orientation,
    disabled,
    dragThreshold,
    holdDelay,
    messages,
    onValueChange,
    onDragStart,
    onDragEnd,
    onDragCancel,
  };

  const [engine] = React.useState(() => createEngine({ rootRef, latest, setDrag, setDropping }));

  // After every commit: the FLIP half of a drop, a cancel or an outside
  // change. Deliberately without dependencies.
  useIsoLayoutEffect(() => {
    engine.commit(value, disabled);
  });

  React.useEffect(() => {
    setMounted(true);
    return () => engine.dispose();
  }, [engine]);

  const setRef = React.useCallback(
    (element: HTMLElement | null) => {
      rootRef.current = element;
      if (typeof forwardedRef === "function") forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef],
  );

  const context = React.useMemo<RootContextValue>(
    () => ({ orientation, disabled, handleOnly, drag, dropping, instructionsId, messages, engine }),
    [orientation, disabled, handleOnly, drag, dropping, instructionsId, messages, engine],
  );

  const element = useRender({
    render,
    ref: setRef,
    defaultTagName: "ul",
    props: {
      className: clsx(styles.root, className),
      "data-forte": "reorderable",
      "data-orientation": orientation,
      "data-reordering": drag?.pointerType,
      "data-disabled": disabled ? "" : undefined,
      ...props,
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        onPointerDown?.(event as React.PointerEvent<HTMLUListElement>);
        /* A press anywhere inside this list — between its items as well as
         * on one — is this list's business, so an outer list's item never
         * picks it up. */
        if (gestureOwner(event.nativeEvent) === undefined) claimGesture(event.nativeEvent, engine.owner);
      },
      children: (
        <>
          {children}
          <CommitSnapshot engine={engine} active={engine.shouldCapture()} />
        </>
      ),
    },
  });

  return (
    <RootContext.Provider value={context}>
      {element}
      {/* Portalled to the body: a `<ul>` may only hold list items, and a
        * live region has to exist before its first announcement to be
        * heard — so it mounts with the list, not with the drag. */}
      {mounted
        ? createPortal(
            <>
              <div id={instructionsId} hidden data-forte="reorderable-instructions">
                {messages.instructions}
              </div>
              <div
                ref={engine.setLive}
                aria-live="assertive"
                aria-atomic="true"
                className="forte-visually-hidden"
                data-forte="reorderable-announcer"
              />
            </>,
            document.body,
          )
        : null}
    </RootContext.Provider>
  );
}) as ReorderableRootComponent;

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface ReorderableItemProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className" | "value"> {
  /**
   * The item's identity: one of the root's `value`s. Use the same thing as
   * its React `key`.
   */
  value: ReorderableValue;
  /**
   * Stops this item being picked up. Other items still move past it — it is
   * not a fixed point; to pin an item in place, refuse the move in
   * `onValueChange`.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether a mouse needs the handle too, for this item. Defaults to the
   * root's `handleOnly`.
   */
  handleOnly?: boolean;
  /**
   * The item's name in announcements, and in its handle's accessible name.
   * Without it, announcements use the item's text — skipping any list nested
   * inside it — and the handle is called "Reorder".
   */
  label?: string;
  /**
   * Replaces the rendered `<li>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One item. With a mouse it drags from anywhere on its surface except the
 * controls inside it — buttons, fields, links, anything with `data-no-drag`.
 * With a finger it drags from its `Handle` when it has one, and otherwise
 * after a short press-and-hold, so a swipe across the list still scrolls it.
 */
export const ReorderableItem = React.forwardRef<HTMLElement, ReorderableItemProps>(
  function ReorderableItem(
    {
      value,
      disabled: disabledProp = false,
      handleOnly: handleOnlyProp,
      label,
      render,
      className,
      onPointerDown,
      onDragStart,
      ...props
    },
    forwardedRef,
  ) {
    const root = useRootContext("Item");
    const disabled = root.disabled || disabledProp;
    const handleOnly = handleOnlyProp ?? root.handleOnly;

    const [record] = React.useState<ItemRecord>(() => ({
      value,
      element: null,
      handle: null,
      disabled,
      handleOnly,
      label,
    }));
    record.value = value;
    record.disabled = disabled;
    record.handleOnly = handleOnly;
    record.label = label;

    const { engine } = root;
    useIsoLayoutEffect(() => engine.register(record), [engine, record, value]);

    const setRef = React.useCallback(
      (element: HTMLElement | null) => {
        record.element = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [record, forwardedRef],
    );

    const dragging = root.drag?.id === value ? root.drag.pointerType : undefined;
    const itemContext = React.useMemo(() => ({ record, disabled }), [record, disabled]);

    const element = useRender({
      render,
      ref: setRef,
      defaultTagName: "li",
      props: {
        className: clsx(styles.item, className),
        "data-forte": "reorderable-item",
        "data-orientation": root.orientation,
        "data-dragging": dragging,
        "data-placeholder": dragging && root.drag?.preview ? "" : undefined,
        "data-dropping": root.dropping === value ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "data-handle-only": handleOnly ? "" : undefined,
        ...props,
        onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
          onPointerDown?.(event as React.PointerEvent<HTMLLIElement>);
          engine.pressItem(record, event);
        },
        onDragStart: (event: React.DragEvent<HTMLElement>) => {
          onDragStart?.(event as React.DragEvent<HTMLLIElement>);
          // An image or a link in the row would otherwise start a native
          // drag on the first movement and take the gesture with it.
          if (!disabled) event.preventDefault();
        },
      },
    });

    return <ItemContext.Provider value={itemContext}>{element}</ItemContext.Provider>;
  },
);

/* -------------------------------------------------------------------------
 * Handle
 * ---------------------------------------------------------------------- */

export interface ReorderableHandleProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Replaces the rendered `<button>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The grip. Optional, and focusable: it is how a keyboard picks the item up
 * — <kbd>Space</kbd> or <kbd>Enter</kbd> — and, on a touch screen, the only
 * part of an item a finger can drag, so the rest of the item scrolls the
 * list. A long press on it is a drag, never a context menu.
 *
 * Renders a `<button>` drawing a six-dot grip; pass children to draw your
 * own. Its accessible name is "Reorder", or "Reorder" and the item's `label`
 * — override it with `aria-label`, or for every handle at once through the
 * root's `messages`.
 */
export const ReorderableHandle = React.forwardRef<HTMLElement, ReorderableHandleProps>(
  function ReorderableHandle(
    {
      render,
      className,
      children,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    forwardedRef,
  ) {
    const root = useRootContext("Handle");
    const item = React.useContext(ItemContext);
    if (!item) {
      throw new Error("forte-ui: <Reorderable.Handle> must be rendered inside <Reorderable.Item>.");
    }
    const { record, disabled } = item;
    const { engine } = root;
    const elementRef = React.useRef<HTMLElement | null>(null);

    const setRef = React.useCallback(
      (element: HTMLElement | null) => {
        elementRef.current = element;
        record.handle = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [record, forwardedRef],
    );

    /* Native listeners, on the element itself, for three reasons.
     *
     * Keys: React dispatches from the root container, AFTER any native
     * listener between here and there has run, so a handler there would see
     * a key the drag is about to claim as unclaimed. On the element the
     * `preventDefault` lands before anything bubbling sees the event.
     *
     * touchstart: React registers it passive, and a passive listener cannot
     * `preventDefault` — which is what stops a finger on the grip from also
     * being a tap, a text selection, an iOS callout and, on Android, a long
     * press that opens the platform's context menu.
     *
     * The claims: forte-ui's `ContextMenu.Trigger` skips its own long press
     * for a touch a handle has claimed, and the claim has to be on the event
     * before React dispatches it to the trigger. */
    React.useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      let touching = false;
      let swallowSpaceUp = false;
      const onKeyDown = (event: KeyboardEvent) => {
        if (engine.handleKey(record, event) && event.key === " ") swallowSpaceUp = true;
      };
      // A button activates on Space's keyup; the drag already used the key.
      const onKeyUp = (event: KeyboardEvent) => {
        if (event.key !== " " || !swallowSpaceUp) return;
        swallowSpaceUp = false;
        event.preventDefault();
      };
      const onTouchStart = (event: TouchEvent) => {
        if (record.disabled) return;
        touching = true;
        claimGesture(event, engine.owner);
        if (event.cancelable) event.preventDefault();
      };
      const onTouchEnd = () => {
        touching = false;
      };
      const onContextMenu = (event: MouseEvent) => {
        if (!touching) return;
        claimGesture(event, engine.owner);
        event.preventDefault();
      };
      const onFocusOut = () => engine.handleBlur(record);
      element.addEventListener("keydown", onKeyDown);
      element.addEventListener("keyup", onKeyUp);
      element.addEventListener("touchstart", onTouchStart, { passive: false });
      element.addEventListener("touchend", onTouchEnd);
      element.addEventListener("touchcancel", onTouchEnd);
      element.addEventListener("contextmenu", onContextMenu);
      element.addEventListener("focusout", onFocusOut);
      return () => {
        element.removeEventListener("keydown", onKeyDown);
        element.removeEventListener("keyup", onKeyUp);
        element.removeEventListener("touchstart", onTouchStart);
        element.removeEventListener("touchend", onTouchEnd);
        element.removeEventListener("touchcancel", onTouchEnd);
        element.removeEventListener("contextmenu", onContextMenu);
        element.removeEventListener("focusout", onFocusOut);
      };
    }, [engine, record]);

    const dragging = root.drag?.id === record.value ? root.drag.pointerType : undefined;
    const describedBy = ariaDescribedBy ? `${root.instructionsId} ${ariaDescribedBy}` : root.instructionsId;

    return useRender({
      render,
      ref: setRef,
      defaultTagName: "button",
      props: {
        ...(render ? null : { type: "button" as const }),
        className: clsx(styles.handle, "forte-focus-ring", "forte-target", className),
        "data-forte": "reorderable-handle",
        "data-orientation": root.orientation,
        "data-dragging": dragging,
        "data-disabled": disabled ? "" : undefined,
        "aria-label": ariaLabel ?? root.messages.handle(record.label ?? ""),
        "aria-describedby": describedBy,
        // Pressed while it holds the item: the state a screen reader reads
        // back after Space, and the one it hears go away on the drop.
        "aria-pressed": dragging ? true : undefined,
        "aria-disabled": disabled || undefined,
        tabIndex: disabled ? -1 : undefined,
        ...props,
        children: children ?? <Grip />,
      },
    });
  },
);

function Grip() {
  return (
    <svg className={styles.grip} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Preview
 * ---------------------------------------------------------------------- */

export interface ReorderablePreviewProps {
  /**
   * Renders the copy that follows the pointer, given the dragged item's
   * `value`. Usually the same row component the list renders.
   */
  children: (value: ReorderableValue) => React.ReactNode;
  /**
   * Where the copy is portalled. Defaults to the nearest `.forte-theme` or
   * `[data-forte-theme]` scope around the list — so a scoped theme, `dir`
   * and reduced-motion setting still apply to it — and to the body when
   * there is none.
   */
  container?: HTMLElement | null;
  /**
   * Additional class name(s) for the element that holds the copy. Applied
   * after the internal styles.
   */
  className?: string;
}

/**
 * A copy of the dragged item that follows the pointer in a portal, so a
 * `ScrollArea`, an `overflow: hidden` panel or a card cannot clip it while the
 * real item holds its place in the list. Optional: without it, the item
 * itself moves. A keyboard drag never uses it — the focused handle has to
 * stay in the item that moves.
 *
 * Place it anywhere inside the root; it renders nothing until a pointer drag
 * begins.
 */
export function ReorderablePreview({ children, container, className }: ReorderablePreviewProps) {
  const root = useRootContext("Preview");
  const { engine, drag } = root;
  React.useEffect(() => engine.registerPreview(), [engine]);

  if (!drag?.preview || typeof document === "undefined") return null;

  const target =
    container ??
    engine.rootElement()?.closest<HTMLElement>(".forte-theme, [data-forte-theme]") ??
    document.body;

  return createPortal(
    /* No `.forte-hc-surface`: its transparent border would push the copy's
     * content a pixel off the row it is copying. The stylesheet gives the
     * preview its forced-colors boundary as an outline instead, which takes
     * no room. */
    <div
      ref={engine.setPreviewElement}
      className={clsx(styles.preview, className)}
      data-forte="reorderable-preview"
      data-orientation={root.orientation}
      data-dragging={drag.pointerType}
      dir={drag.dir}
      aria-hidden="true"
      style={
        {
          ...drag.knobs,
          "--forte-reorderable-preview-width": `${drag.width}px`,
          "--forte-reorderable-preview-height": `${drag.height}px`,
        } as React.CSSProperties
      }
    >
      {children(drag.id)}
    </div>,
    target,
  );
}

/**
 * The items of one list, reordered by dragging — with a mouse, a finger, a
 * pen or the keyboard, and announced to screen readers as they move.
 *
 * ```tsx
 * <Reorderable.Root value={ids} onValueChange={(next) => setIds(next)}>
 *   {ids.map((id) => (
 *     <Reorderable.Item key={id} value={id} label={names[id]}>
 *       <Reorderable.Handle />
 *       {names[id]}
 *     </Reorderable.Item>
 *   ))}
 * </Reorderable.Root>
 * ```
 *
 * The order is always the app's: the component shows the move while it
 * happens and reports it on drop, and the app applies it. Lists nest, and a
 * drag inside an inner list never moves the outer one.
 *
 * @summary Reorder one list's items by dragging or with the keyboard —
 *   vertical or horizontal, nestable, announced; the order stays in your
 *   state. To sort a table by a column, use Table's sortable header instead.
 * @category Content & layout
 */
export const Reorderable = {
  Root: ReorderableRoot,
  Item: ReorderableItem,
  Handle: ReorderableHandle,
  Preview: ReorderablePreview,
};
