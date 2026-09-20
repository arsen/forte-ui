"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./AnimatedBorder.module.css";

export type AnimatedBorderVariant = "beam" | "shine" | "rotate";
export type AnimatedBorderTone = "primary" | "secondary" | "danger" | "neutral" | "current";

export interface AnimatedBorderProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children"> {
  /**
   * Which light travels the ring.
   *
   * - `beam` — one glow riding the outline at constant speed, rounding the
   *   corners with it. The only one of the three whose pace does not depend
   *   on the shape of the box, and so the right pick for anything far from
   *   square.
   * - `shine` — a soft glow drifting diagonally across the ring. No leading
   *   edge; reads as sheen rather than as a moving object.
   * - `rotate` — a conic sweep pivoting about the center. Constant *angular*
   *   speed, so on a box far from square the highlight visibly accelerates
   *   into the corners — a look in its own right on a card, and the wrong
   *   one on a wide banner.
   * @default "beam"
   */
  variant?: AnimatedBorderVariant;
  /**
   * Which colors the light is made of. `primary` and `secondary` span the
   * library's two seeds, which is what makes them read as a gradient rather
   * than as a sheen; the rest are one hue with a lighter end derived from it.
   * `current` is the composable one — it picks up whatever text color it
   * lands in.
   * @default "primary"
   */
  tone?: AnimatedBorderTone;
  /**
   * Travel the ring the other way round.
   *
   * Unlike `Shimmer`, this does *not* follow the reading direction, and the
   * omission is deliberate: `--forte-direction` exists so that motion with a
   * logical start and end stays correct in RTL, and a light going round and
   * round has neither. Flipping it in RTL would spin the decoration on half
   * the world's pages for no reason a reader could name.
   * @default false
   */
  reverse?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A light traveling the border of whatever contains it.
 *
 * It is pure decoration — an accent for the one card on a pricing page that
 * should catch the eye, a panel that is currently generating something, the
 * upgrade tile. It renders an `aria-hidden` overlay and nothing else: no
 * text, no role, no focus target. If the border is meant to say "busy", the
 * component saying so is `Spinner` or `Shimmer`, and this goes beside it.
 *
 * ```tsx
 * <Card.Root>
 *   <AnimatedBorder />
 *   <Card.Title>Pro</Card.Title>
 * </Card.Root>
 * ```
 *
 * It positions itself against the nearest positioned ancestor, so **the host
 * must be one** — `Card` and `Button` already are; anything else needs
 * `position: relative` (Tailwind's `relative`). Without it the ring
 * silently anchors to whatever *is* positioned further up, which can be the
 * page. It takes its corner radius from the host through `border-radius:
 * inherit`, so a `data-forte-radius` preset carries without being told, and
 * it sits just inside the host's own border — set
 * `--forte-animated-border-inset` to a negative length to pull it out onto
 * that border instead, or paint the host's border `transparent` and let this
 * be the edge.
 *
 * Under reduced motion nothing travels: the ring becomes a still gradient in
 * the same colors, which is the honest degradation for decoration that
 * carries no information. Styling is driven by `data-*` attributes and
 * `--forte-animated-border-*` custom properties, so it can be re-skinned from
 * plain CSS or Tailwind arbitrary variants (`data-[variant=beam]:...`)
 * without wrapping.
 *
 * @summary A decorative light traveling a container's border; for motion
 *   that reports progress or a wait, use Spinner or Shimmer instead.
 * @category Content & layout
 */
export const AnimatedBorder = React.forwardRef<HTMLSpanElement, AnimatedBorderProps>(
  function AnimatedBorder(
    { variant = "beam", tone = "primary", reverse = false, className, ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        className={clsx(styles.root, className)}
        data-forte="animated-border"
        data-variant={variant}
        data-tone={tone}
        data-reverse={reverse || undefined}
        // Decoration, start to finish. There is no state here that a screen
        // reader could act on, and the element covers the host's whole box —
        // left exposed it would be one more thing to swipe past on every
        // card that has one.
        aria-hidden="true"
        {...props}
      >
        {/* The moving paint, and the only part that fades out under reduced
         * motion. Split from the root so one `opacity` retires all three
         * variants at once, instead of every gradient stop carrying its own
         * `--forte-motion-off` mix. */}
        <span className={styles.layer} data-forte="animated-border-layer">
          {/* Only `beam` has a discrete object to move; the other two animate
           * the layer's own background and need nothing here. */}
          {variant === "beam" ? (
            <span className={styles.beam} data-forte="animated-border-beam" />
          ) : null}
        </span>
      </span>
    );
  },
);
