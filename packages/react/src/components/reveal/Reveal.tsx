"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Reveal.module.css";

export type RevealEffect =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-start"
  | "fade-end"
  | "scale"
  | "fade-scale";

/**
 * Where the content is in its entrance.
 *
 *   "idle"   nothing has been hidden and no attribute is rendered — the
 *            markup is exactly what it would be without this component. It
 *            is what the server emits, and what a page whose JavaScript
 *            never arrives keeps. See the note on arming below.
 *   "hidden" the before-state, applied with no transition on it, so arming
 *            is a cut rather than a visible fade-out.
 *   "shown"  at rest, and the only state that carries a transition — which
 *            is what makes the entrance the one thing that animates.
 */
type RevealState = "idle" | "hidden" | "shown";

/**
 * `useLayoutEffect`, except on the server, where React warns that it does
 * nothing. Arming has to happen before the browser paints the hydrated tree,
 * or the content is painted at rest for a frame and then yanked back to the
 * before-state — a blink, rather than an entrance. The warning fires on the
 * hook being *called*, so the swap has to happen whether or not the effect
 * would do anything.
 */
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Whether an observation counts as "on screen" for the requested `amount`.
 *
 * `intersectionRatio` is a fraction of the ELEMENT, not of the viewport, so
 * an element taller than the viewport can never report 1 — and a section two
 * screens tall can never report 0.5 either. A bare ratio test would leave
 * that section hidden forever, which is the one failure this component must
 * not have, and the failure is invisible on a desktop and certain on a
 * phone. So anything too big to fit in the root counts as soon as it
 * intersects at all: the reader is looking at it, which is what `amount` was
 * asking about.
 *
 * `rootBounds` is null in a cross-origin iframe; there the ratio is all
 * there is, and `amount: 0` (the default) still behaves.
 */
function isOnScreen(entry: IntersectionObserverEntry, amount: number) {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= amount) return true;
  const root = entry.rootBounds;
  if (!root) return false;
  const box = entry.boundingClientRect;
  return box.height > root.height || box.width > root.width;
}

export interface RevealProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Which entrance plays.
   *
   * - `fade` — opacity alone. The only one that moves nothing, so the only
   *   one that cannot widen a page (see the note on the inline effects).
   * - `fade-up` / `fade-down` — fades while rising from below, or settling
   *   from above.
   * - `fade-start` / `fade-end` — the same along the inline axis, so
   *   `fade-start` arrives from the left in LTR and from the right in RTL.
   *   Named for the reading direction rather than for a side because that is
   *   what makes them survive `dir="rtl"` unchanged.
   * - `scale` — grows into place with no fade, for something that should
   *   stay legible the whole way in.
   * - `fade-scale` — both: the "pop" used for a card or a modal-like panel.
   *
   * The distance and the starting size are knobs, not values baked into the
   * effect — `--forte-reveal-travel` and `--forte-reveal-scale`.
   * @default "fade-up"
   */
  effect?: RevealEffect;
  /**
   * Milliseconds to wait after the content is on screen before it starts.
   * Sets `--forte-reveal-delay`, and exists as a prop because the reason to
   * reach for it is nearly always a stagger: `delay={i * 60}` over a mapped
   * list. Keep the total under a few hundred milliseconds — a list whose
   * last row arrives a second late reads as a page still loading.
   * @default 0
   */
  delay?: number;
  /**
   * Play the entrance again every time the content comes back on screen,
   * instead of once and never again.
   *
   * Off by default, because the honest reading of a second entrance is "this
   * content is new", and content the reader has already scrolled past is
   * not. Turn it on for a demo of the effect itself, or for a panel whose
   * contents genuinely change while it is away.
   *
   * The reset is a cut, not a reverse: it happens once the content is
   * entirely off screen, where there is nothing to see. It is also skipped
   * while focus is inside, so a keyboard user cannot be left on an element
   * that has faded out underneath them.
   * @default false
   */
  repeat?: boolean;
  /**
   * How much of the content has to be on screen before it counts, from 0 —
   * any sliver of it — to 1, all of it. The default starts the entrance as
   * the top edge crosses into view, which is what makes it read as the
   * content arriving with the scroll rather than as something that happened
   * before the reader got there.
   *
   * Anything too big to fit on screen is exempt and starts as soon as it
   * appears, since it could never satisfy the fraction.
   * @default 0
   */
  amount?: number;
  /**
   * Replaces the rendered `<div>` with another element or component —
   * `render={<li />}` inside a list, `render={<section />}` for a landmark,
   * `render={<Card.Root />}` to animate the card itself rather than a
   * wrapper around it. The entrance is applied to whatever element comes
   * back, so nothing about the layout changes.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * An entrance for whatever it wraps, played when that content reaches the
 * screen.
 *
 * It is the scroll reveal, and it is deliberately the whole of it: wrap a
 * section, a card, a row of a list, and it fades — and rises, or grows —
 * into place the first time the reader gets to it. Content already on screen
 * when the page loads plays the same entrance immediately, so the component
 * reads the same whether it is the hero or the fourth section down.
 *
 * ```tsx
 * <Reveal>
 *   <h2>Built on Base UI</h2>
 * </Reveal>
 *
 * {features.map((feature, i) => (
 *   <Reveal key={feature.id} effect="fade-scale" delay={i * 60}>
 *     <Card.Root>…</Card.Root>
 *   </Reveal>
 * ))}
 * ```
 *
 * **Content is never gated behind the entrance.** Nothing is hidden until
 * the component has mounted in a browser and an observer is watching, so a
 * page whose JavaScript fails, or has not arrived yet, shows the content
 * rather than an empty column — and a screen reader, which does not depend
 * on any of this, reads it either way. The cost of that order is one
 * blink on a server-rendered page: content already on screen was painted at
 * rest before React hydrated, so it is hidden and re-entered at hydration.
 * It is the right trade — the alternative fails by showing nothing — but it
 * is why wrapping the first screenful is a decision rather than a default.
 *
 * Under reduced motion nothing travels and nothing scales: the tokens behind
 * the knobs collapse their own geometry, so what is left is a short fade,
 * which is the part of an entrance that helps rather than hinders. Styling
 * is driven by `data-*` attributes and `--forte-reveal-*` custom properties,
 * so it can be re-skinned from plain CSS or Tailwind arbitrary variants
 * (`data-[state=shown]:...`) without wrapping.
 *
 * @summary Plays a one-shot entrance — fade, rise, scale — on whatever it
 *   wraps, the first time that content reaches the screen; a popup or panel
 *   animates its own enter and needs none of this.
 * @category Content & layout
 */
export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  {
    effect = "fade-up",
    delay = 0,
    repeat = false,
    amount = 0,
    render,
    className,
    style,
    onFocus,
    ...props
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<RevealState>("idle");

  // Arm. Separate from the observer below, and dependency-free, so that a
  // prop change re-observes without re-hiding content the reader is already
  // looking at.
  useIsoLayoutEffect(() => setState("hidden"), []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer — an engine old enough to lack one, or a test renderer.
    // Show the content and leave it shown: an entrance is the part that is
    // optional here.
    if (typeof IntersectionObserver === "undefined") {
      setState("shown");
      return;
    }

    // Rooted at the viewport, which also handles a nested scroller for free:
    // the intersection is clipped by every ancestor's overflow on the way
    // up, so content scrolled out of view inside a panel is out of view.
    //
    // Both edges of `amount` are needed. The observer only reports at a
    // threshold it was given, and the 0 crossing is what tells the oversized
    // element in `isOnScreen` that it has appeared at all — without it a
    // section taller than the phone would sit there waiting for a ratio it
    // can never reach.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (isOnScreen(entry, amount)) {
          setState("shown");
          // Once shown is once observed. A page of fifty of these should
          // not keep fifty live observations for entrances that can never
          // play again.
          if (!repeat) observer.disconnect();
        } else if (repeat && !el.contains(document.activeElement)) {
          setState("hidden");
        }
      },
      { threshold: amount > 0 ? [0, amount] : 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount, repeat]);

  /**
   * Focus is the other way in. A keyboard user tabbing into content that is
   * still hidden — which `amount` above 0 makes possible, since the browser
   * scrolls the target only far enough to be visible — would otherwise be
   * standing on something they cannot see. Revealing on the way in costs
   * nothing when the observer was about to do it anyway.
   */
  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      setState((previous) => (previous === "hidden" ? "shown" : previous));
      onFocus?.(event);
    },
    [onFocus],
  );

  return useRender({
    render,
    ref: [forwardedRef, ref],
    defaultTagName: "div",
    props: {
      className: clsx(styles.root, className),
      "data-forte": "reveal",
      "data-effect": effect,
      // Absent while idle, so the server's markup carries no state that the
      // page has not actually entered.
      ...(state !== "idle" && { "data-state": state }),
      style: delay
        ? ({ "--forte-reveal-delay": `${delay}ms`, ...style } as React.CSSProperties)
        : style,
      onFocus: handleFocus,
      ...props,
    },
  });
});
