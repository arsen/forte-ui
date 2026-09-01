"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { clsx } from "clsx";
import styles from "./Progress.module.css";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/**
 * `size` and `tone` are chosen on `Progress.Root`, and the parts below paint
 * themselves from `--forte-progress-*` properties the root declares — so
 * inheritance alone is enough to make them *look* right. This context exists
 * for the other half of the contract: every part republishes them as
 * `data-size` / `data-tone` so a consumer can write `data-[tone=danger]:…` on
 * the indicator without wrapping the component. Passing them through context
 * rather than as per-part props is what makes a mismatched pair (an `lg` root
 * with an `sm` track) unexpressible.
 */
const ProgressContext = React.createContext<{ size: ProgressSize; tone: ProgressTone }>({
  size: "md",
  tone: "primary",
});

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Root>;

export interface ProgressRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Thickness of the bar and the size of the label row — `4px`, `6px` or
   * `10px` of track. The bar's *length* is not a size: it fills its container
   * by default, and `--forte-progress-length` is the knob for anything else.
   * @default "md"
   */
  size?: ProgressSize;
  /**
   * Which semantic colour set the fill draws from. The rail stays neutral in
   * every tone — it is the part that has *not* happened yet, and colouring it
   * would compete with the fill it exists to contrast against.
   * @default "primary"
   */
  tone?: ProgressTone;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups every part of the bar and owns its value. Renders a
 * `<div role="progressbar">` laid out as a two-column grid: `Label` and
 * `Value` share the first row, and `Track` spans both underneath.
 *
 * `value` is required and `null` is a meaningful setting — it is how you say
 * "this is running and I cannot say how far along it is", which switches every
 * part below into the indeterminate animation.
 *
 * ```tsx
 * <Progress.Root value={62}>
 *   <Progress.Label>Uploading</Progress.Label>
 *   <Progress.Value />
 *   <Progress.Track>
 *     <Progress.Indicator />
 *   </Progress.Track>
 * </Progress.Root>
 * ```
 */
export const ProgressRoot = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot({ size = "md", tone = "primary", className, ...props }, ref) {
    const context = React.useMemo(() => ({ size, tone }), [size, tone]);

    return (
      <ProgressContext.Provider value={context}>
        <BaseProgress.Root
          ref={ref}
          className={clsx(styles.root, className)}
          data-forte="progress"
          data-size={size}
          data-tone={tone}
          {...props}
        />
      </ProgressContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Label>;

export interface ProgressLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Names what is being waited on. Renders a `<span>` wired to the root with
 * `aria-labelledby`, so it is the bar's accessible name — a progress bar
 * without one announces a bare percentage and leaves the listener to guess
 * what it is a percentage of.
 *
 * Wrap it in `.forte-visually-hidden` when the surrounding page already says it
 * in words; that keeps the name in the accessibility tree without repeating it
 * on screen.
 */
export const ProgressLabel = React.forwardRef<HTMLSpanElement, ProgressLabelProps>(
  function ProgressLabel({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressContext);

    return (
      <BaseProgress.Label
        ref={ref}
        className={clsx(styles.label, className)}
        data-forte="progress-label"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Value
 * ---------------------------------------------------------------------- */

type BaseValueProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Value>;

export interface ProgressValueProps extends Omit<BaseValueProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The readout, formatted as a percentage by default. Renders an
 * `aria-hidden` `<span>` — the root already publishes the same number through
 * `aria-valuenow`, and announcing it twice is worse than once.
 *
 * It renders **nothing** while the bar is indeterminate, which is the point:
 * there is no number to show, and a "0%" that never moves is a lie. Pass a
 * function child to say something there instead:
 *
 * ```tsx
 * <Progress.Value>
 *   {(formatted, value) => (value == null ? "Working…" : formatted)}
 * </Progress.Value>
 * ```
 *
 * Set `format` on `Progress.Root` for units other than percent — `{ style:
 * "unit", unit: "megabyte" }` turns the readout into "38 MB" while the bar
 * keeps filling from `min` to `max`.
 */
export const ProgressValue = React.forwardRef<HTMLSpanElement, ProgressValueProps>(
  function ProgressValue({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressContext);

    return (
      <BaseProgress.Value
        ref={ref}
        className={clsx(styles.value, className)}
        data-forte="progress-value"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Track
 * ---------------------------------------------------------------------- */

type BaseTrackProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Track>;

export interface ProgressTrackProps extends Omit<BaseTrackProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The rail the fill runs along, and the only part with an explicit thickness —
 * `Indicator` sizes its cross axis with `height: inherit`, so a track left to
 * size itself leaves the fill with nothing to inherit and it collapses to
 * zero.
 *
 * It also clips: the fill carries the same radius, so at 3% the rounded cap is
 * cut to a sliver of the rail's own end rather than shrinking into a dot.
 */
export const ProgressTrack = React.forwardRef<HTMLDivElement, ProgressTrackProps>(
  function ProgressTrack({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressContext);

    return (
      <BaseProgress.Track
        ref={ref}
        className={clsx(styles.track, className)}
        data-forte="progress-track"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Indicator
 * ---------------------------------------------------------------------- */

type BaseIndicatorProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Indicator>;

export interface ProgressIndicatorProps extends Omit<BaseIndicatorProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The fill. Base UI gives it an inline `width: <percent>%` while the bar is
 * determinate and *no* inline geometry at all while it is indeterminate, which
 * is what lets one element be both the fill and the sweeping segment — see the
 * note at the top of `Progress.module.css`.
 */
export const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  function ProgressIndicator({ className, ...props }, ref) {
    const { size, tone } = React.useContext(ProgressContext);

    return (
      <BaseProgress.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        data-forte="progress-indicator"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/**
 * A linear progress bar built on Base UI's unstyled `Progress` primitive.
 *
 * ```tsx
 * <Progress.Root value={62} tone="success">
 *   <Progress.Label>Restoring backup</Progress.Label>
 *   <Progress.Value />
 *   <Progress.Track>
 *     <Progress.Indicator />
 *   </Progress.Track>
 * </Progress.Root>
 * ```
 *
 * Pass `value={null}` and the same markup becomes an indeterminate bar: the
 * readout disappears, and the fill turns into a segment sweeping the rail.
 * Nothing else about the tree changes, so a component that starts out not
 * knowing its total can start reporting one without remounting.
 *
 * Reach for `ProgressCircle` where the bar's full width is not available — a
 * button, a card corner, a tile — and for `Spinner` when the wait is short and
 * a percentage would be noise.
 *
 * @summary A linear progress bar — determinate when passed a number,
 *   indeterminate when passed null; the circular form is ProgressCircle.
 * @category Feedback
 */
export const Progress = {
  Root: ProgressRoot,
  Label: ProgressLabel,
  Value: ProgressValue,
  Track: ProgressTrack,
  Indicator: ProgressIndicator,
};
