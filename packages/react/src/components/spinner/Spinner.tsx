"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./Spinner.module.css";

export type SpinnerVariant = "ring" | "dots" | "bars" | "pulse";
export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone = "primary" | "secondary" | "danger" | "neutral" | "current";
export type SpinnerLabelPlacement = "hidden" | "end" | "bottom";

/**
 * How many animated children each variant needs, and therefore the value of
 * `--forte-spinner-count`.
 *
 * The count lives HERE rather than in the stylesheet because the DOM is what
 * actually decides it. Every piece of per-child geometry — a bar's angle, a
 * dot's stagger — is derived in CSS from `--forte-spinner-i` and this count, so
 * the two can never disagree: change the number and the ring re-divides
 * itself. `ring` needs no children at all; it is drawn entirely by the
 * indicator's own background.
 */
const PART_COUNT: Record<SpinnerVariant, number> = {
  ring: 0,
  dots: 3,
  bars: 8,
  pulse: 2,
};

export interface SpinnerProps extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Which indicator to draw. All four are the same size and cost the same —
   * this is a question of voice, not of capability.
   *
   * `ring` is a rotating comet, the neutral default. `dots` is three bouncing
   * dots, which reads as friendlier and suits inline text. `bars` is eight
   * fading spokes — the only variant whose animation is identical with and
   * without reduced motion, so it is the safest choice for something that must
   * look the same for everyone. `pulse` is a breathing halo, best for ambient
   * "still working" states rather than for blocking ones.
   * @default "ring"
   */
  variant?: SpinnerVariant;
  /**
   * Diameter of the indicator — `1rem`, `1.5rem` or `2rem`. Every variant is
   * laid out as a fraction of it, so all four occupy exactly the same box and
   * can be swapped without moving anything around them.
   * @default "md"
   */
  size?: SpinnerSize;
  /**
   * Which semantic colour set the indicator draws from. `current` takes
   * `currentColor` instead, which is what makes a spinner dropped inside a
   * button or a link match the text beside it.
   * @default "primary"
   */
  tone?: SpinnerTone;
  /**
   * What the spinner is waiting on. This is the only thing that reaches a
   * screen reader — the indicator itself is `aria-hidden`, because a picture
   * of motion is not information.
   *
   * Say what is happening rather than that something is: "Loading invoices"
   * tells someone whether the wait concerns them; "Loading" does not.
   * @default "Loading"
   */
  label?: string;
  /**
   * Where the label goes. `hidden` keeps it in the accessibility tree but out
   * of the paint; `end` and `bottom` also show it, which is what you want for
   * a wait long enough that the user deserves to know what it is for.
   * @default "hidden"
   */
  labelPlacement?: SpinnerLabelPlacement;
  /**
   * Stops the spinner announcing itself: no `role="status"`, and no hidden
   * label.
   *
   * Use it whenever something else already announces the wait — a `Button`
   * with `loading`, a panel that sets `aria-busy`, a live region that swaps in
   * the loaded content. Two announcements for one wait is worse than one, and
   * a page that mounts six spinners with six live regions is unusable.
   *
   * A label you asked to SHOW stays visible and stays in the accessibility
   * tree, as ordinary text. Text that is on screen but hidden from assistive
   * technology is a bug in its own right, so `decorative` will not do that —
   * it only ever removes the live region and the invisible label.
   * @default false
   */
  decorative?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A busy indicator, in four flavours.
 *
 * Base UI has no spinner primitive — there is no interaction to model and no
 * state machine to get right — so this is the one component in the library
 * that is not built on one. What it does have is the part everybody gets
 * wrong: an indicator that is announced once and correctly, and an animation
 * that stays informative when the user has asked for less motion.
 *
 * ```tsx
 * <Spinner />
 * <Spinner variant="bars" size="lg" label="Loading invoices" labelPlacement="end" />
 * <Spinner decorative variant="dots" tone="current" />
 * ```
 *
 * Styling is driven by `data-*` attributes and `--forte-spinner-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[variant=dots]:...`) without wrapping.
 *
 * @summary An indeterminate busy indicator for waits with no measurable
 *   progress; when progress is known, use Progress.
 * @category Feedback
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    {
      variant = "ring",
      size = "md",
      tone = "primary",
      label = "Loading",
      labelPlacement = "hidden",
      decorative = false,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const count = PART_COUNT[variant];

    return (
      <span
        ref={ref}
        className={clsx(styles.root, className)}
        data-forte="spinner"
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        data-label-placement={labelPlacement}
        // A live region has to exist before its contents change to be
        // announced reliably, and a spinner that mounts IS its own change —
        // see the accessibility note on the docs page. `role="status"` is
        // still the right default because it is correct for the common case
        // (a spinner that outlives a single paint), and `decorative` is the
        // way out when a parent already owns the announcement.
        //
        // There is deliberately no `aria-hidden` on the decorative path. The
        // indicator already carries one, and with the hidden label dropped
        // below there is nothing left for a screen reader to find — while a
        // root-level `aria-hidden` would also swallow a label the caller
        // asked to display, taking visible text out of the tree.
        role={decorative ? undefined : "status"}
        style={{ "--forte-spinner-count": count, ...style } as React.CSSProperties}
        {...props}
      >
        <span className={styles.indicator} data-forte="spinner-indicator" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={styles.part}
              data-forte="spinner-part"
              // The child's index, handed to CSS. Everything per-child is
              // derived from it — the bar's angle, the dot's stagger, the
              // ripple's phase — so the stylesheet needs no `nth-child` chain
              // and adding a bar is a one-character change above.
              style={{ "--forte-spinner-i": i } as React.CSSProperties}
            />
          ))}
        </span>
        {decorative && labelPlacement === "hidden" ? null : (
          <span
            className={clsx(
              labelPlacement === "hidden" ? "forte-visually-hidden" : styles.label,
            )}
            data-forte="spinner-label"
          >
            {label}
          </span>
        )}
      </span>
    );
  },
);
