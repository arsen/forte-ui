"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { clsx } from "clsx";
import type { ProgressSize, ProgressTone } from "./Progress";
import styles from "./ProgressCircle.module.css";

/**
 * Same two axes as the bar, and deliberately the same union types: a design
 * system that calls it `tone="success"` in one shape and `tone="positive"` in
 * the other has two vocabularies, not one.
 */
export type ProgressCircleSize = ProgressSize;
export type ProgressCircleTone = ProgressTone;

const ProgressCircleContext = React.createContext<{
  size: ProgressCircleSize;
  tone: ProgressCircleTone;
}>({ size: "md", tone: "primary" });

/**
 * The percentage Base UI computed, computed again.
 *
 * Base UI derives exactly this inside `Progress.Root` and hands it to
 * `Progress.Indicator` as an inline `width` — which is meaningless on a
 * `<circle>` — and exposes it through no public API. The arc needs the number
 * as a number, so the arithmetic is repeated here, deliberately step for step
 * with `valueToPercent` + `clamp` upstream: a non-finite value is
 * indeterminate, `max === min` divides by zero and clamps (to 100 above the
 * floor, to 0 at it), and everything else is clamped into 0–100 so a value
 * outside the range fills the ring rather than overshooting it.
 */
function toPercent(value: number | null, min: number, max: number): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const raw = ((value - min) * 100) / (max - min);
  return Math.min(100, Math.max(0, Number.isNaN(raw) ? 0 : raw));
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Root>;

export interface ProgressCircleRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Diameter of the ring — `2.5rem`, `3.5rem` or `5rem`. The stroke is
   * measured in the ring's own coordinate space rather than in pixels, so it
   * scales with the diameter and a `sm` circle is a smaller ring rather than a
   * thinner one.
   * @default "md"
   */
  size?: ProgressCircleSize;
  /**
   * Which semantic colour set the arc draws from. The rail behind it stays
   * neutral in every tone.
   * @default "primary"
   */
  tone?: ProgressCircleTone;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups every part of the ring and owns its value. Renders a
 * `<div role="progressbar">` laid out as a grid where `Track` and `Value`
 * share one cell — which is what centres the readout inside the ring — and
 * `Label` sits in a second row that only exists if you render one.
 *
 * `value` is required and `null` means indeterminate: the readout disappears
 * and the arc starts rotating.
 *
 * ```tsx
 * <ProgressCircle.Root value={62}>
 *   <ProgressCircle.Track>
 *     <ProgressCircle.Indicator />
 *   </ProgressCircle.Track>
 *   <ProgressCircle.Value />
 *   <ProgressCircle.Label>Uploading</ProgressCircle.Label>
 * </ProgressCircle.Root>
 * ```
 */
export const ProgressCircleRoot = React.forwardRef<HTMLDivElement, ProgressCircleRootProps>(
  function ProgressCircleRoot(
    { size = "md", tone = "primary", value, min = 0, max = 100, className, style, ...props },
    ref,
  ) {
    const context = React.useMemo(() => ({ size, tone }), [size, tone]);
    const percent = toPercent(value, min, max);

    return (
      <ProgressCircleContext.Provider value={context}>
        <BaseProgress.Root
          ref={ref}
          className={clsx(styles.root, className)}
          data-forte="progress-circle"
          data-size={size}
          data-tone={tone}
          value={value}
          min={min}
          max={max}
          // The arc's length, published to CSS. It goes on the ROOT rather
          // than on the indicator so that a consumer's own `style` on the
          // indicator cannot collide with it, and so the value is readable
          // from anywhere inside the component — a custom readout in the
          // middle of the ring can use it too.
          //
          // `0` while indeterminate: the arc's length is then set by the
          // animation instead, and leaving a stale percentage behind would
          // show through for one frame on the switch back.
          //
          // Written as a function because Base UI's `style` may itself be one
          // — a caller styling off `state.status` would otherwise be silently
          // dropped by the spread. The caller's half goes last, so it can
          // override the percentage if it really means to.
          style={(state) =>
            ({
              "--forte-progress-circle-percent": percent ?? 0,
              ...(typeof style === "function" ? style(state) : style),
            }) as React.CSSProperties
          }
          {...props}
        />
      </ProgressCircleContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Track
 * ---------------------------------------------------------------------- */

type BaseTrackProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Track>;

export interface ProgressCircleTrackProps extends Omit<BaseTrackProps, "className" | "render"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * A ref to the `<svg>`.
   */
  ref?: React.Ref<SVGSVGElement>;
}

/**
 * The ring's canvas and the rail behind the arc. Renders an `<svg>` on a
 * `0 0 100 100` viewBox — Base UI's `Track` is a `<div>` by default and is
 * re-rendered through its `render` prop, which is also what keeps the
 * `data-complete` / `data-progressing` / `data-indeterminate` attributes on
 * it.
 *
 * The viewBox is what makes the stroke width scale: everything inside is
 * measured against a ring 100 units across, and the size of a unit is whatever
 * `--forte-progress-circle-size` says.
 *
 * `render` is intentionally not forwarded. Replacing the `<svg>` would take
 * the coordinate space every rule in the stylesheet is written against with
 * it, and the failure is silent — a ring that simply does not draw.
 */
export const ProgressCircleTrack = React.forwardRef<SVGSVGElement, ProgressCircleTrackProps>(
  function ProgressCircleTrack({ className, children, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressCircleContext);

    return (
      <BaseProgress.Track
        // Base UI types every part's ref against the element it renders by
        // DEFAULT, and `render` is what actually decides that. The cast is the
        // whole of the mismatch: at runtime this ref lands on the <svg> above.
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        render={<svg viewBox="0 0 100 100" aria-hidden="true" />}
        className={clsx(styles.track, className)}
        data-forte="progress-circle-track"
        data-size={size}
        data-tone={tone}
        {...props}
      >
        {/* Rule 9 exempts SVG descendants from `data-forte` because they are
          * normally an icon's anonymous paths. These two are not: the rail and
          * the arc are the ring's two halves, they have style keys of their
          * own, and a consumer restyling one must be able to say which. */}
        <circle className={styles.rail} data-forte="progress-circle-rail" cx="50" cy="50" r="46" />
        {children}
      </BaseProgress.Track>
    );
  },
);

/* -------------------------------------------------------------------------
 * Indicator
 * ---------------------------------------------------------------------- */

type BaseIndicatorProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Indicator>;

export interface ProgressCircleIndicatorProps
  extends Omit<BaseIndicatorProps, "className" | "render"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * A ref to the `<circle>`.
   */
  ref?: React.Ref<SVGCircleElement>;
}

/**
 * The arc. A `<circle>` with `pathLength="100"`, which renormalises its
 * circumference to 100 units so `stroke-dashoffset` can be driven straight
 * from the percentage without anyone computing 2πr — including when
 * `--forte-progress-circle-thickness` changes the radius out from under it.
 *
 * Base UI still writes its inline `width` / `height` / `inset-inline-start`
 * here while the bar is determinate. None of the three applies to a `<circle>`
 * in CSS, so they are inert; the value reaches the arc through
 * `--forte-progress-circle-percent` on the root instead.
 */
export const ProgressCircleIndicator = React.forwardRef<
  SVGCircleElement,
  ProgressCircleIndicatorProps
>(function ProgressCircleIndicator({ className, ...props }, ref) {
  const { size, tone } = React.useContext(ProgressCircleContext);

  return (
    <BaseProgress.Indicator
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      // `r` is restated in CSS from the stroke width so a thicker ring stays
      // inside the viewBox. The attribute is the value for the default
      // thickness, which is what draws if the CSS `r` property is unsupported.
      render={<circle cx="50" cy="50" r="46" pathLength="100" />}
      className={clsx(styles.indicator, className)}
      data-forte="progress-circle-indicator"
      data-size={size}
      data-tone={tone}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Value
 * ---------------------------------------------------------------------- */

type BaseValueProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Value>;

export interface ProgressCircleValueProps extends Omit<BaseValueProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The readout, centred inside the ring. Renders an `aria-hidden` `<span>` —
 * the root already publishes the number through `aria-valuenow`.
 *
 * It renders nothing while the ring is indeterminate. Pass a function child to
 * put something else there, and keep it short: at `sm` the ring's inner
 * diameter is under 30px, and anything longer than three characters will need
 * `size="lg"` or a label underneath instead.
 */
export const ProgressCircleValue = React.forwardRef<HTMLSpanElement, ProgressCircleValueProps>(
  function ProgressCircleValue({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressCircleContext);

    return (
      <BaseProgress.Value
        ref={ref}
        className={clsx(styles.value, className)}
        data-forte="progress-circle-value"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Label>;

export interface ProgressCircleLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Names what is being waited on, underneath the ring. Renders a `<span>` wired
 * to the root with `aria-labelledby`, so it is the ring's accessible name.
 *
 * Its row in the grid only exists when it is rendered, so a ring without a
 * label has no dangling gap under it.
 */
export const ProgressCircleLabel = React.forwardRef<HTMLSpanElement, ProgressCircleLabelProps>(
  function ProgressCircleLabel({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressCircleContext);

    return (
      <BaseProgress.Label
        ref={ref}
        className={clsx(styles.label, className)}
        data-forte="progress-circle-label"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/**
 * A circular progress indicator built on Base UI's unstyled `Progress`
 * primitive — the same state machine and the same accessibility contract as
 * `Progress`, drawn as a ring instead of a bar.
 *
 * ```tsx
 * <ProgressCircle.Root value={62} size="lg" tone="success">
 *   <ProgressCircle.Track>
 *     <ProgressCircle.Indicator />
 *   </ProgressCircle.Track>
 *   <ProgressCircle.Value />
 *   <ProgressCircle.Label>Restoring backup</ProgressCircle.Label>
 * </ProgressCircle.Root>
 * ```
 *
 * Pass `value={null}` and the arc becomes a rotating segment. Reach for the
 * ring where a bar's full width is not available — a card corner, a tile, a
 * table cell — and for `Progress` where it is, because a bar's length is
 * comparable at a glance across a list and a ring's angle is not.
 *
 * @summary The circular Progress — a ring for tight spaces; same
 *   determinate/indeterminate contract as the bar.
 * @category Feedback
 * @partOf Progress
 */
export const ProgressCircle = {
  Root: ProgressCircleRoot,
  Track: ProgressCircleTrack,
  Indicator: ProgressCircleIndicator,
  Value: ProgressCircleValue,
  Label: ProgressCircleLabel,
};
