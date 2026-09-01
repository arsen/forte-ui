"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { clsx } from "clsx";
import styles from "./Slider.module.css";

export type SliderSize = "sm" | "md" | "lg";
export type SliderTone = "primary" | "secondary" | "danger" | "neutral";

/**
 * `size` and `tone` are chosen on `Slider.Root`, and the parts below paint
 * themselves from `--forte-slider-*` properties that the root declares — so
 * inheritance alone is enough to make them *look* right, and this context
 * exists for the other half of the contract: every part republishes them as
 * `data-size` / `data-tone` so a consumer can write `data-[size=lg]:…` on the
 * thumb without wrapping the component. Passing them through context rather
 * than as per-part props is what makes a mismatched pair (a `lg` root with an
 * `sm` thumb) unexpressible.
 */
const SliderContext = React.createContext<{ size: SliderSize; tone: SliderTone }>({
  size: "md",
  tone: "primary",
});

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps<Value extends number | readonly number[]> =
  BaseSlider.Root.Props<Value>;

export interface SliderRootProps<
  Value extends number | readonly number[] = number | readonly number[],
> extends Omit<BaseRootProps<Value>, "className"> {
  /**
   * Size of the slider. Scales the track thickness, the thumb and the gap
   * between the rows together.
   * @default "md"
   */
  size?: SliderSize;
  /**
   * Which semantic colour set the indicator and thumb draw from.
   * @default "primary"
   */
  tone?: SliderTone;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * A ref to the root `<div>`.
   */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Groups every part of the slider and owns its value. Renders a `<div>` laid
 * out as a two-column grid: `Label` and `Value` share the first row, and
 * `Control` spans both columns underneath.
 *
 * The generic is forwarded rather than widened, so a `number` value keeps
 * `onValueChange(value: number)` and an array keeps `readonly number[]` — the
 * distinction between a single-thumb and a range slider is carried entirely by
 * the shape of `value` / `defaultValue`.
 *
 * ```tsx
 * <Slider.Root defaultValue={40}>
 *   <Slider.Label>Volume</Slider.Label>
 *   <Slider.Value />
 *   <Slider.Control>
 *     <Slider.Track>
 *       <Slider.Indicator />
 *       <Slider.Thumb />
 *     </Slider.Track>
 *   </Slider.Control>
 * </Slider.Root>
 * ```
 */
export function SliderRoot<
  Value extends number | readonly number[] = number | readonly number[],
>({ size = "md", tone = "primary", className, ...props }: SliderRootProps<Value>) {
  const context = React.useMemo(() => ({ size, tone }), [size, tone]);

  return (
    <SliderContext.Provider value={context}>
      <BaseSlider.Root
        className={clsx(styles.root, className)}
        data-forte="slider"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    </SliderContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Label>;

export interface SliderLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The slider's visible label. Renders a `<div>`, not a `<label>`, and is wired
 * to every thumb's hidden `<input>` with `aria-labelledby` — a native label
 * cannot point at more than one control, so a range slider would leave the
 * second thumb unnamed.
 *
 * On a range slider this names the group; give each `Thumb` its own
 * `aria-label` ("Minimum price", "Maximum price") so the two are still
 * distinguishable.
 */
export const SliderLabel = React.forwardRef<HTMLDivElement, SliderLabelProps>(
  function SliderLabel({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Label
        ref={ref}
        className={clsx(styles.label, className)}
        data-forte="slider-label"
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

type BaseValueProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Value>;

export interface SliderValueProps extends Omit<BaseValueProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The current value as text. Renders an `<output>`.
 *
 * By default it prints the values formatted with `Slider.Root`'s `format` and
 * `locale`, joined with an en dash for a range. Pass a function as `children`
 * to compose your own — it receives the formatted strings and the raw numbers:
 *
 * ```tsx
 * <Slider.Value>{(formatted) => `${formatted[0]} to ${formatted[1]}`}</Slider.Value>
 * ```
 *
 * This is a visible duplicate of what `aria-valuetext` already announces, so
 * it is never the only way to read the value — but it is what makes a slider
 * usable for anyone who cannot judge a thumb's position by eye, which is why
 * every demo that has room for it renders one.
 */
export const SliderValue = React.forwardRef<HTMLOutputElement, SliderValueProps>(
  function SliderValue({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Value
        ref={ref}
        className={clsx(styles.value, className)}
        data-forte="slider-value"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Control
 * ---------------------------------------------------------------------- */

type BaseControlProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Control>;

export interface SliderControlProps extends Omit<BaseControlProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The interactive strip. Renders a `<div>` that is padded well beyond the
 * painted track, because *this* is the element that takes the pointer: a press
 * anywhere inside it moves the nearest thumb. The padding is what gives the
 * control its 24×24 minimum target (SC 2.5.8) without thickening the rail, and
 * `thumbAlignment="edge"` measures it, so changing the padding changes where
 * an edge-aligned thumb comes to rest.
 *
 * Contains exactly one `Track`.
 */
export const SliderControl = React.forwardRef<HTMLDivElement, SliderControlProps>(
  function SliderControl({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Control
        ref={ref}
        className={clsx(styles.control, className)}
        data-forte="slider-control"
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

type BaseTrackProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Track>;

export interface SliderTrackProps extends Omit<BaseTrackProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The rail: the whole range from `min` to `max`. Renders a `<div>` that Base
 * UI gives `position: relative` inline, which is what the `Indicator` and the
 * `Thumb` are positioned against.
 *
 * Its thickness must stay an explicit length rather than `auto` — Base UI sizes
 * the indicator's cross axis with `height: inherit` (`width: inherit` when
 * vertical), so an auto-sized track leaves the indicator with nothing to
 * inherit and it collapses.
 */
export const SliderTrack = React.forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Track
        ref={ref}
        className={clsx(styles.track, className)}
        data-forte="slider-track"
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

type BaseIndicatorProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Indicator>;

export interface SliderIndicatorProps extends Omit<BaseIndicatorProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The filled part of the rail. Renders a `<div>` inside `Track`.
 *
 * Base UI owns its position and size through inline styles — `width` /
 * `height` for a single thumb, plus an offset from the start edge for a range
 * — so the stylesheet only paints it. Setting a width here would be
 * overwritten on the next render.
 */
export const SliderIndicator = React.forwardRef<HTMLDivElement, SliderIndicatorProps>(
  function SliderIndicator({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        data-forte="slider-indicator"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Thumb
 * ---------------------------------------------------------------------- */

type BaseThumbProps = React.ComponentPropsWithoutRef<typeof BaseSlider.Thumb>;

export interface SliderThumbProps extends Omit<BaseThumbProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One draggable handle. Renders a `<div>` wrapping a visually hidden
 * `<input type="range">` — the input is the real control, so it is what takes
 * focus and what a screen reader reads.
 *
 * That split is why the focus ring is `.forte-focus-ring-within` rather than
 * `.forte-focus-ring`: the thumb `<div>` never matches `:focus-visible` itself.
 *
 * A range slider needs one `Thumb` per value, each with an `index` — without
 * it the thumbs only find their order once the composite list has registered
 * on the client, so a server-rendered range slider paints both handles at the
 * first value and jumps on hydration. Give each one an `aria-label` too; the
 * `Label` names the group, not the individual handles.
 */
export const SliderThumb = React.forwardRef<HTMLDivElement, SliderThumbProps>(
  function SliderThumb({ className, ...props }, ref) {
    const { size, tone } = React.useContext(SliderContext);

    return (
      <BaseSlider.Thumb
        ref={ref}
        // `forte-target` grows the hit area to the SC 2.5.8 minimum without
        // repainting the handle, which is only 14px across at `sm`. It sets
        // `position: relative`, which Base UI's inline `position: absolute`
        // overrides — harmlessly, since absolute is a containing block too.
        className={clsx(styles.thumb, "forte-focus-ring-within", "forte-target", className)}
        data-forte="slider-thumb"
        data-size={size}
        data-tone={tone}
        {...props}
      />
    );
  },
);

/**
 * A slider built on Base UI's unstyled `Slider` primitive.
 *
 * ```tsx
 * <Slider.Root defaultValue={[25, 75]} tone="secondary">
 *   <Slider.Label>Price range</Slider.Label>
 *   <Slider.Value />
 *   <Slider.Control>
 *     <Slider.Track>
 *       <Slider.Indicator />
 *       <Slider.Thumb index={0} aria-label="Minimum price" />
 *       <Slider.Thumb index={1} aria-label="Maximum price" />
 *     </Slider.Track>
 *   </Slider.Control>
 * </Slider.Root>
 * ```
 *
 * Motion — the handle and the fill are never animated into position. Base UI
 * rewrites their geometry on every pointermove, so a positional transition
 * restarts on every frame of a drag and the handle ends up permanently
 * interpolating toward a target that has already moved: it trails the pointer,
 * and it puts a layout-triggering property under animation for the whole
 * gesture. Colour and the hover halo still transition, because those have a
 * start and an end. See the note at the top of `Slider.module.css`.
 *
 * @summary Picks a numeric value or range by feel along a track; when the
 *   exact number matters more than the feel, use NumberField.
 * @category Forms
 */
export const Slider = {
  Root: SliderRoot,
  Label: SliderLabel,
  Value: SliderValue,
  Control: SliderControl,
  Track: SliderTrack,
  Indicator: SliderIndicator,
  Thumb: SliderThumb,
};
