/* -------------------------------------------------------------------------
 * The document clock
 *
 * A CSS animation starts at its first keyframe when its element is first
 * styled. For a loading loop that is the wrong origin: the loop says "still
 * waiting", and a placeholder replaced by an identical one — a route's
 * `loading.tsx` handing over to the page's own `<Suspense fallback>`, a key
 * change, a swap between boundaries — is a different element to the browser
 * and the same wait to the reader. Its loop restarts mid-way, and a sweep
 * that jumps back to the edge reads as a glitch.
 *
 * So the loops are pinned to the one clock every element on the page shares:
 * the document timeline, whose zero is the navigation. With `startTime = 0`
 * an animation's phase is a function of the time alone, not of when its
 * element mounted, so every pinned loop of the same duration is in step with
 * every other — and a replacement carries on from exactly where the element
 * it replaced was.
 *
 * Shared by `Skeleton` and `Shimmer`. Implementation, not API: it is never
 * exported from the package.
 * ---------------------------------------------------------------------- */

/**
 * Pins the looping CSS animations of `node` — its own and its pseudo-elements'
 * — to the origin of its document's timeline. Call it before the element's
 * first paint, so no frame shows the loop at its restart.
 *
 * Narrow on purpose, one condition per way of breaking something else:
 *
 * - CSS animations only, told apart by `animationName`. A transition is not a
 *   loop, and an animation a script started with `animate()` belongs to that
 *   script. Duck-typed rather than `instanceof CSSAnimation`: a node portalled
 *   into an iframe has the iframe's constructors, and jsdom has none at all.
 * - Targeting `node` itself. `subtree` is what reaches the `::after` sweep,
 *   and it also reaches descendants — real content laid out inside a skeleton
 *   to size it, which is the consumer's and may carry loops of its own.
 * - Infinite iterations only. A one-shot pinned to the document's time zero
 *   would be read as long since finished, and skipped entirely.
 * - On the document timeline. A scroll-driven animation has no time zero to
 *   pin to, and Chrome THROWS on an absolute start time for one — from a
 *   layout effect, which takes the consumer's whole tree down with it.
 * - Running. Setting the start time of a paused animation un-pauses it, so a
 *   consumer who froze the skeletons with `animation-play-state` for a
 *   screenshot test would get them back moving.
 *
 * Without the Web Animations API (jsdom, an old engine) it does nothing, and
 * the animation simply runs from its own start, as it did before this existed.
 */
export function pinToDocumentClock(node: Element): void {
  if (typeof node.getAnimations !== "function") return;
  const timeline = node.ownerDocument.timeline;

  for (const animation of node.getAnimations({ subtree: true })) {
    const effect = animation.effect as KeyframeEffect | null;
    if (
      "animationName" in animation &&
      effect?.target === node &&
      effect.getTiming().iterations === Infinity &&
      animation.timeline === timeline &&
      animation.playState === "running"
    ) {
      animation.startTime = 0;
    }
  }
}
