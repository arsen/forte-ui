import { ViewTransition } from "react";

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
    <ViewTransition update="page" default="none">
      {children}
    </ViewTransition>
  );
}
