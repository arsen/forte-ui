"use client";

import { ViewTransition, type ViewTransitionInstance } from "react";

/**
 * The cross-fade between pages — the one view transition the site has.
 *
 * Every client-side navigation in the App Router is a React transition, and
 * a `<ViewTransition>` whose contents change inside one is UPDATED: React
 * gives its DOM child a `view-transition-name` for the length of the commit,
 * the browser snapshots that child before and after, and the two snapshots
 * cross-fade on the compositor — old out, new in, blended so the middle never
 * dips. This boundary sits in the root layout around `{children}`, which is
 * to say around whatever the route renders under the app bar: the docs shell
 * on a docs page, the home page's own `<main>` on the front door. A move
 * between two docs pages swaps the page inside the shell; a move between the
 * front door and the docs swaps the child element itself, and React keeps
 * the same name across the swap so that is a cross-fade too. Nothing here
 * depends on the link that started it.
 *
 * The browser's own Back and Forward are the one exception, and it is
 * React's rule, not this file's: an update started inside a `popstate`
 * event is committed eagerly and synchronously (`shouldAttemptEagerTransition`
 * in React DOM), so the browser's scroll restoration lands on the restored
 * page rather than on a snapshot of it. Next dispatches the traversal in a
 * `startTransition` all the same, and it still cuts. Do not try to buy the
 * fade back with a `popstate` listener of the site's own — the scroll
 * position is the thing it would cost.
 *
 * `update="page"` is the class the stylesheet's `::view-transition-*(.page)`
 * rules put on the library's clock; `default="none"` keeps every other
 * trigger off. Enter and exit could not fire in any case — a layout
 * persists, so the boundary never mounts or unmounts — but `share` would if
 * something inside took a name, and nothing should.
 *
 * ---------------------------------------------------------------------------
 * Why the old snapshot has to be put back where it was
 * ---------------------------------------------------------------------------
 * The element the boundary names is the whole page below the bar, and the
 * page scrolls with the document. Snapshotted mid-read, its box starts a
 * scroll's worth above the viewport; the new page is committed scrolled to
 * the top, so its box starts just under the bar. The browser's default for
 * a named element whose box moved is to ANIMATE the group between the two
 * — a translate the length of the scroll, over the length of the fade —
 * and that is a lurch of everything painted inside the snapshot, the
 * sticky sidebar and section rail included. Sticky means pinned to the
 * viewport in the page, not in a picture of the page: in the old snapshot
 * they are painted where they were pinned, a scroll's worth down the
 * element, and the group drags them the same distance as everything else.
 * Moving the columns out of the boundary would only save the columns; the
 * page column would still slide.
 *
 * `holdStill` runs when the transition is ready, before its first frame. It
 * reads the old box's transform off the group's own keyframes — the one
 * place the browser writes down where the old element was — cancels that
 * animation so the group sits at the NEW box from the first frame, and
 * offsets the old image by the difference. The new image is live and
 * needs nothing. Both views then fade exactly where they were seen, and
 * a scrolled page cross-fades like an unscrolled one.
 *
 * The delta is read off the keyframes rather than worked out from
 * `scrollY`: they are the browser's own measurement of both boxes, so they
 * are right whichever element the boundary is naming and whatever moved
 * it, and there is no scroll listener to fall out of step. The group's
 * duration in `globals.css` stays too — it is the fallback for a browser
 * that hands this callback no animation to read.
 *
 * ---------------------------------------------------------------------------
 * What must NOT trigger it
 * ---------------------------------------------------------------------------
 * Any React transition inside the boundary counts as an update: not only a
 * navigation but a `startTransition` in a demo — the async Combobox demos
 * defer their results through one. Left alone, every keystroke there would
 * cross-fade the whole page, and hold the input's own caret behind a
 * snapshot for the length of it. React resolves a mutation to the INNERMOST
 * boundary around it, so `DemoFrame` wraps each demo in a boundary of its
 * own that resolves to nothing, and this one never hears about what happens
 * inside a demo. Nothing else on a page updates in a transition today; a
 * component of the site that starts to needs the same inert wrapper.
 *
 * The app bar and the footer are outside it, in the ROOT snapshot — which
 * the stylesheet leaves live for a navigation, so the bar's scrolled state
 * simply changes and its frosted surface never has two translucent snapshots
 * to blend. The palette cross-fade on the home page is the other way round:
 * a `document.startViewTransition` of its own, typed `palette`, in which the
 * root is what fades and this boundary is not involved at all.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition update="page" default="none" onUpdate={holdStill}>
      {children}
    </ViewTransition>
  );
}

/* The instance an `on*` callback receives carries the boundary's four
 * pseudo-elements — `group`, `imagePair`, `old`, `new` — each a Web
 * Animations `Animatable` scoped to that pseudo. The runtime has shipped
 * them since the callbacks existed; the typings still list only `name`. The
 * DOM's own `Element` signatures are the honest shape, so they are borrowed
 * rather than restated. */
type Pseudo = Pick<Element, "animate" | "getAnimations">;
type Pseudos = { group: Pseudo; old: Pseudo; new: Pseudo };

function holdStill(instance: ViewTransitionInstance) {
  const { name, group, old } = instance as ViewTransitionInstance & Pseudos;
  let shift: Animation;
  try {
    /* The UA animation on the group — the move from the old box to the new,
     * plus the size change. Its first keyframe is the old transform: the
     * element's position in the viewport when it was snapshotted. */
    const [move] = group.getAnimations();
    if (!(move?.effect instanceof KeyframeEffect)) return;
    const from = matrix(move.effect.getKeyframes()[0]?.transform);
    /* Cancelled rather than finished, so the group holds the browser's own
     * end state — the new box — with nothing left running on it. Only then
     * does the computed transform say where that box is. React cancels the
     * same animation again when the transition finishes; that is a no-op. */
    move.cancel();
    const to = matrix(
      getComputedStyle(document.documentElement, `::view-transition-group(${name})`).transform,
    );
    const dx = from.e - to.e;
    const dy = from.f - to.f;
    if (dx === 0 && dy === 0) return;
    /* Held for as long as the old image fades — a transition ends when its
     * longest animation does, and `fill: both` keeps the offset applied
     * from the first frame to the last. The fade's own timing is read back
     * rather than the token: it is already on the library's clock, reduced
     * motion included.
     *
     * Two keyframes, the same one twice. A lone keyframe is an END state,
     * and the animation tweens to it from the property's base value — so
     * the old image would set out from the new box and travel the scroll's
     * length over the fade, which is the slide this exists to remove, on a
     * different element. */
    const fade = old.getAnimations()[0]?.effect?.getComputedTiming().endTime;
    const held = { translate: `${dx}px ${dy}px` };
    shift = old.animate([held, held], {
      duration: typeof fade === "number" && Number.isFinite(fade) ? fade : 0,
      fill: "both",
    });
  } catch {
    /* A browser that will not let the script at the pseudo-elements gets
     * the browser's own animation, which is what shipped before this. */
    return;
  }
  /* React runs this when the transition finishes and the pseudo-elements
   * are gone; the animation is unhooked so it does not linger in
   * `document.getAnimations()` after the target it played on. */
  return () => shift.cancel();
}

/* `none` is what a computed transform says at the origin, and a keyframe
 * React has rewritten carries no transform at all where it was `none`:
 * both are the identity. */
const matrix = (transform: unknown) =>
  typeof transform === "string" && transform !== "none" ? new DOMMatrix(transform) : new DOMMatrix();
