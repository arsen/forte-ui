/* -------------------------------------------------------------------------
 * Gesture claims
 *
 * How one forte-ui component tells another "this press is mine" without
 * stopping the event. `stopPropagation()` would do it, and it would also hide
 * the event from the app: a global shortcut handler, an analytics listener, a
 * consumer's own `onPointerDown` higher up. So the event keeps travelling,
 * and the component that took it leaves a mark on it that the others read.
 *
 * Two readers today:
 *
 * - `Reorderable`, for nesting. The innermost list marks a press it owns, and
 *   an outer list's item, reached by the same event a moment later as it
 *   bubbles, sees the mark and stays put — so dragging inside an inner list
 *   never moves the outer one.
 * - `ContextMenu.Trigger`, for touch. A long press on a reorder handle is a
 *   drag, so the handle marks the `touchstart` and the `contextmenu` that go
 *   with it, and the trigger skips Base UI's long-press handling for them.
 *
 * The mark is a property keyed by a registered symbol rather than a module
 * WeakSet, so two copies of the library on one page — a monorepo with two
 * versions installed — still read each other's claims.
 * ---------------------------------------------------------------------- */

const CLAIM = Symbol.for("forte-ui.gesture-claim");

type Claimable = Event & { [CLAIM]?: object };

/** Marks `event` as handled by `owner`. The first claim stands. */
export function claimGesture(event: Event, owner: object): void {
  const claimable = event as Claimable;
  if (claimable[CLAIM] === undefined) claimable[CLAIM] = owner;
}

/** Who claimed `event`, if anyone did. */
export function gestureOwner(event: Event): object | undefined {
  return (event as Claimable)[CLAIM];
}
