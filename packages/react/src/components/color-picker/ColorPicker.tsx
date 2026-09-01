"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { clsx } from "clsx";
import { Popover, type PopoverPopupProps } from "../popover";
import { Select } from "../select";
import styles from "./ColorPicker.module.css";
import {
  DEFAULT_SWATCHES,
  formatColor,
  hsvaToRgba,
  onColor,
  parseColor,
  sameColor,
  toCssColor,
  type ColorPickerFormat,
  type Hsva,
  type Rgba,
} from "./color";

export type { ColorPickerFormat, Hsva, Rgba };
export { DEFAULT_SWATCHES };

/** What moved the colour. Handed to `onValueChange` and `onValueCommitted` so
 * a consumer can tell a drag from a paste without watching the DOM. */
export type ColorPickerChangeReason =
  | "area"
  | "hue"
  | "alpha"
  | "swatch"
  | "input"
  | "eye-dropper"
  | "format-change"
  | "none";

export interface ColorPickerChangeDetails {
  /** The colour in the picker's internal model — hue survives here at zero
   * saturation, where the string cannot carry it. */
  hsva: Hsva;
  /** The same colour as eight-bit sRGB, so a consumer never has to re-parse
   * the string it was just handed. */
  rgba: Rgba;
  /** The notation `value` is written in. */
  format: ColorPickerFormat;
  /** What moved it. */
  reason: ColorPickerChangeReason;
}

const clamp = (n: number, min: number, max: number) =>
  n < min ? min : n > max ? max : n;

const ALL_FORMATS: readonly ColorPickerFormat[] = ["hex", "rgb", "hsl", "oklch"];

const FORMAT_LABELS: Record<ColorPickerFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
};

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ColorPickerContextValue {
  hsva: Hsva;
  rgba: Rgba;
  /** `rgb()` with alpha — every gradient stop and preview fill reads this. */
  css: string;
  /** The same colour at full alpha, for the alpha rail's own gradient. */
  solid: string;
  /** The colour written out in the current format; what `value` would be. */
  text: string;
  format: ColorPickerFormat;
  formats: readonly ColorPickerFormat[];
  setFormat: (format: ColorPickerFormat) => void;
  /** Change some channels and leave the rest alone. Merging rather than
   * replacing is what keeps hue alive while the area is dragged to black. */
  update: (patch: Partial<Hsva>, reason: ColorPickerChangeReason) => void;
  commit: (reason: ColorPickerChangeReason) => void;
  disabled: boolean;
}

const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(
  null,
);

function useColorPicker(part: string): ColorPickerContextValue {
  const context = React.useContext(ColorPickerContext);
  if (!context) {
    throw new Error(`<ColorPicker.${part}> must be rendered inside <ColorPicker.Root>.`);
  }
  return context;
}

/**
 * The four custom properties every part paints from.
 *
 * They are written as an INLINE STYLE on each part rather than once on the
 * root, and that is not duplication for its own sake: `ColorPicker.Popup` is
 * portalled to `<body>`, so it inherits from the document and not from the
 * React tree it was written in. A value declared on the root would reach an
 * inline panel and silently miss the popover one — which is the arrangement
 * almost every consumer uses.
 *
 * Inline is also the right precedence. These carry live state, the way Base
 * UI writes a slider thumb's position inline; a consumer retunes the picker
 * through the `--forte-color-picker-*` knobs in the stylesheet, none of which
 * this touches.
 */
function useColorVars(context: ColorPickerContextValue): React.CSSProperties {
  const { css, solid, hsva, rgba } = context;
  return React.useMemo(
    () =>
      ({
        "--forte-color-picker-color": css,
        "--forte-color-picker-solid": solid,
        /* Unitless, so it can be dropped straight into `hsl()`. A `deg` here
         * would be rejected inside `calc()` the same way the ramp's hue
         * arithmetic is. */
        "--forte-color-picker-hue": String(Math.round(hsva.h * 100) / 100),
        "--forte-color-picker-on-color": onColor(rgba),
      }) as React.CSSProperties,
    [css, solid, hsva.h, rgba],
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type PopoverRootProps = React.ComponentProps<typeof Popover.Root>;

export interface ColorPickerRootProps {
  /**
   * The selected colour, as a CSS colour string. Pass it with
   * `onValueChange` to control the picker.
   *
   * Accepts `#hex` (3, 4, 6 or 8 digits), `rgb()`, `hsl()`, `oklch()`,
   * `oklab()` and `transparent`, in both the legacy comma form and the modern
   * space form. A string that cannot be read is ignored rather than throwing,
   * so a half-typed value in your own state never blanks the picker. Named
   * colours (`rebeccapurple`) are not accepted — see the docs page.
   */
  value?: string;
  /**
   * The colour the picker starts on when it is uncontrolled.
   * @default "#000000"
   */
  defaultValue?: string;
  /**
   * Called on every change, including each frame of a drag. `value` is
   * written in the current `format`; `details` carries the same colour as
   * HSVA and RGBA, plus what moved it.
   */
  onValueChange?: (value: string, details: ColorPickerChangeDetails) => void;
  /**
   * Called when an interaction ENDS — pointer up, a keyboard step, a swatch
   * press, a committed text entry. This is the one to persist from: a drag
   * across the area fires `onValueChange` once per pointer move and this once.
   */
  onValueCommitted?: (value: string, details: ColorPickerChangeDetails) => void;
  /**
   * Which notation `value` is written in. Pass it with `onFormatChange` to
   * control the format.
   */
  format?: ColorPickerFormat;
  /**
   * The notation the picker starts in.
   * @default "hex"
   */
  defaultFormat?: ColorPickerFormat;
  /**
   * Called when the format changes. Switching format also re-emits the
   * current colour through `onValueChange` with reason `"format-change"`, so
   * a controlled `value` never disagrees with the notation on screen.
   */
  onFormatChange?: (format: ColorPickerFormat) => void;
  /**
   * The notations `ColorPicker.Format` offers, in order. Narrow it to the one
   * your app stores — a design tool that writes OKLCH has no use for a HEX
   * option that silently rounds.
   * @default ["hex", "rgb", "hsl", "oklch"]
   */
  formats?: readonly ColorPickerFormat[];
  /**
   * Whether every part ignores interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the popover is open when it first mounts. Only relevant when the
   * picker is used with `ColorPicker.Trigger` and `ColorPicker.Popup`.
   * @default false
   */
  defaultOpen?: PopoverRootProps["defaultOpen"];
  /**
   * Whether the popover is currently open. Pass it with `onOpenChange` to
   * control the popover.
   */
  open?: PopoverRootProps["open"];
  /**
   * Called when the popover wants to open or close.
   */
  onOpenChange?: PopoverRootProps["onOpenChange"];
  /**
   * Whether the popover takes the page over while it is open. See
   * `Popover.Root`'s own `modal` for the three settings.
   * @default false
   */
  modal?: PopoverRootProps["modal"];
  /**
   * The picker's parts.
   */
  children?: React.ReactNode;
}

/**
 * Owns the colour and the format, and renders no DOM element of its own — so
 * it takes neither `className` nor `ref`.
 *
 * It also renders a `Popover.Root`, which is what lets `ColorPicker.Trigger`
 * and `ColorPicker.Popup` exist without the consumer wiring a popover by hand.
 * A picker built out of `ColorPicker.Panel` alone simply never uses it: the
 * popover root renders nothing until a trigger and a popup are present.
 *
 * ```tsx
 * <ColorPicker.Root defaultValue="#7c3aed">
 *   <ColorPicker.Trigger>Brand colour</ColorPicker.Trigger>
 *   <ColorPicker.Popup>
 *     <ColorPicker.Area />
 *     <ColorPicker.HueSlider />
 *     <ColorPicker.Row>
 *       <ColorPicker.Format />
 *       <ColorPicker.Input />
 *     </ColorPicker.Row>
 *   </ColorPicker.Popup>
 * </ColorPicker.Root>
 * ```
 */
export function ColorPickerRoot({
  value,
  defaultValue = "#000000",
  onValueChange,
  onValueCommitted,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  formats = ALL_FORMATS,
  disabled = false,
  defaultOpen,
  open,
  onOpenChange,
  modal,
  children,
}: ColorPickerRootProps) {
  const [hsva, setHsva] = React.useState<Hsva>(
    () => parseColor(value ?? defaultValue) ?? { h: 0, s: 0, v: 0, a: 1 },
  );
  const [uncontrolledFormat, setUncontrolledFormat] =
    React.useState<ColorPickerFormat>(defaultFormat);
  const format = formatProp ?? uncontrolledFormat;

  /* The last string this component produced.
   *
   * It is what makes a controlled picker stable, and the reason is worth
   * stating: `hsl` and `oklch` are lossy at the precision they are printed
   * to, so `parse(format(colour))` can land an eight-bit step away from where
   * it started. Re-parsing our own output on every render would then nudge
   * the model on every frame of a drag, and the area's thumb would crawl.
   * Comparing STRINGS instead means a `value` that came back unchanged from
   * the consumer is recognised as ours and ignored — only a value they
   * actually changed is parsed and adopted. */
  const emittedRef = React.useRef<string | null>(null);

  /* The sanctioned "adjust state when a prop changes" pattern: cheaper than an
   * effect, and it lands before paint rather than after, so a controlled
   * picker never shows one frame of the old colour. */
  const [previousValue, setPreviousValue] = React.useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    if (value !== undefined && value !== emittedRef.current) {
      const parsed = parseColor(value);
      if (parsed) {
        setHsva((current) => ({
          ...parsed,
          /* A colour string cannot say which hue a black or a grey is, so
           * `parseColor` reports 0. Adopting that would swing the hue rail to
           * red the moment a consumer set the value to `#000`, and the user
           * would have lost the hue they were working in. */
          h: parsed.s === 0 || parsed.v === 0 ? current.h : parsed.h,
          s: parsed.v === 0 ? current.s : parsed.s,
        }));
      }
    }
  }

  const rgba = React.useMemo(() => hsvaToRgba(hsva), [hsva]);
  const text = React.useMemo(() => formatColor(hsva, format), [hsva, format]);
  const css = React.useMemo(() => toCssColor(hsva), [hsva]);
  const solid = React.useMemo(() => toCssColor({ ...hsva, a: 1 }), [hsva]);

  /* Every emit reads the CURRENT model out of a ref rather than the render's
   * closure. A pointer drag calls `update` many times between renders, and a
   * closure would hand each of those the colour from the last committed
   * paint — so a fast drag would emit stale colours and `commit` would report
   * the second-to-last one. */
  const stateRef = React.useRef({ hsva, format });
  stateRef.current = { hsva, format };

  const emit = React.useCallback(
    (
      next: Hsva,
      nextFormat: ColorPickerFormat,
      reason: ColorPickerChangeReason,
      handler: ((value: string, details: ColorPickerChangeDetails) => void) | undefined,
    ) => {
      const string = formatColor(next, nextFormat);
      emittedRef.current = string;
      handler?.(string, {
        hsva: next,
        rgba: hsvaToRgba(next),
        format: nextFormat,
        reason,
      });
      return string;
    },
    [],
  );

  const update = React.useCallback(
    (patch: Partial<Hsva>, reason: ColorPickerChangeReason) => {
      const next = { ...stateRef.current.hsva, ...patch };
      stateRef.current = { ...stateRef.current, hsva: next };
      setHsva(next);
      emit(next, stateRef.current.format, reason, onValueChange);
    },
    [emit, onValueChange],
  );

  const commit = React.useCallback(
    (reason: ColorPickerChangeReason) => {
      const { hsva: current, format: currentFormat } = stateRef.current;
      emit(current, currentFormat, reason, onValueCommitted);
    },
    [emit, onValueCommitted],
  );

  const setFormat = React.useCallback(
    (next: ColorPickerFormat) => {
      if (next === stateRef.current.format) return;
      stateRef.current = { ...stateRef.current, format: next };
      if (formatProp === undefined) setUncontrolledFormat(next);
      onFormatChange?.(next);
      /* The colour did not move, but the string that describes it did. A
       * controlled `value` left in the old notation would be parsed back on
       * the next render and shown in the old one, so the format switch would
       * appear not to work. */
      const string = emit(
        stateRef.current.hsva,
        next,
        "format-change",
        onValueChange,
      );
      onValueCommitted?.(string, {
        hsva: stateRef.current.hsva,
        rgba: hsvaToRgba(stateRef.current.hsva),
        format: next,
        reason: "format-change",
      });
    },
    [emit, formatProp, onFormatChange, onValueChange, onValueCommitted],
  );

  const context = React.useMemo<ColorPickerContextValue>(
    () => ({
      hsva,
      rgba,
      css,
      solid,
      text,
      format,
      formats,
      setFormat,
      update,
      commit,
      disabled,
    }),
    [hsva, rgba, css, solid, text, format, formats, setFormat, update, commit, disabled],
  );

  return (
    <ColorPickerContext.Provider value={context}>
      <Popover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
      >
        {children}
      </Popover.Root>
    </ColorPickerContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface ColorPickerTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className" | "color"> {
  /**
   * Hide the built-in swatch, for a trigger that shows the colour some other
   * way — a filled button, an icon that inherits it.
   * @default false
   */
  hideSwatch?: boolean;
  /**
   * The trigger's visible label. The current colour is announced after it, so
   * a trigger with no children is still named.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The button that opens the picker. Renders a `<button>` showing the current
 * colour as a swatch, followed by whatever children you give it.
 *
 * The colour is also announced, in a visually hidden span: colour is the one
 * thing a swatch cannot convey to a screen reader, and a trigger reading only
 * "Brand colour" leaves out the entire answer.
 */
export const ColorPickerTrigger = React.forwardRef<
  HTMLButtonElement,
  ColorPickerTriggerProps
>(function ColorPickerTrigger(
  { hideSwatch = false, disabled, className, style, children, ...props },
  ref,
) {
  const context = useColorPicker("Trigger");
  const vars = useColorVars(context);

  return (
    <Popover.Trigger
      ref={ref}
      /* `render` rather than the default element, so Popover's own neutral
       * trigger styling steps aside instead of resolving against this one by
       * source order. */
      render={<button type="button" />}
      className={clsx(styles.trigger, className)}
      disabled={context.disabled || disabled}
      /* The picker's live colour merged UNDER any style the caller passed, so
       * a consumer setting `style` on a part does not silently blank the
       * custom properties every gradient in it reads. Same everywhere below. */
      style={{ ...vars, ...style }}
      data-forte="color-picker-trigger"
      {...props}
    >
      {hideSwatch ? null : (
        <span className={styles.triggerSwatch} data-forte="color-picker-trigger-swatch" />
      )}
      {children}
      <span className="forte-visually-hidden">{context.text}</span>
    </Popover.Trigger>
  );
});

/* -------------------------------------------------------------------------
 * Popup / Panel
 * ---------------------------------------------------------------------- */

export interface ColorPickerPopupProps
  extends Omit<PopoverPopupProps, "className" | "children"> {
  /**
   * Render the wedge pointing back at the trigger.
   *
   * A boolean here where `Popover` wants a child element, because this
   * component's children are the picker's own parts and an `Arrow` mixed in
   * among them would be layout, not chrome. `ColorPicker.Arrow` is still
   * exported for the rare popup that composes its own header.
   * @default true
   */
  arrow?: boolean;
  /**
   * The picker's parts.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s) for the inner panel — the element that owns the
   * padding and the column layout.
   */
  panelClassName?: string;
  /**
   * Additional class name(s) for the popup surface. Applied after the
   * internal styles so consumer utilities (e.g. Tailwind) win without needing
   * `!important`.
   */
  className?: string;
}

/**
 * The picker on a popover surface, anchored to `ColorPicker.Trigger`.
 *
 * Wraps `Popover.Popup` and takes all of its props — `side`, `align`,
 * `sideOffset`, `initialFocus` and the rest — so placement is tuned the same
 * way it is on a popover.
 */
export const ColorPickerPopup = React.forwardRef<
  HTMLDivElement,
  ColorPickerPopupProps
>(function ColorPickerPopup(
  { arrow = true, className, panelClassName, children, ...props },
  ref,
) {
  const { disabled } = useColorPicker("Popup");

  return (
    <Popover.Popup ref={ref} className={clsx(styles.popup, className)} {...props}>
      {arrow ? <Popover.Arrow /> : null}
      {/* The panel, and not the popup itself, owns the padding and the column
        * — which is also what gives the picker a `data-forte` marker of its own
        * inside a surface that is already tagged `popover-popup`. */}
      <div
        className={clsx(styles.panel, panelClassName)}
        data-forte="color-picker-panel"
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </Popover.Popup>
  );
});

/** The wedge pointing back at the trigger. `ColorPicker.Popup` renders one by
 * default; this is here for a popup that turns `arrow` off and places its own. */
export const ColorPickerArrow = Popover.Arrow;

export interface ColorPickerPanelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The picker laid out in the page rather than in a popover. Renders a `<div>`
 * as a column, with the same padding, surface and width as
 * `ColorPicker.Popup`'s inner panel — the two share one rule, so a picker
 * moved from one to the other does not change shape.
 */
export const ColorPickerPanel = React.forwardRef<
  HTMLDivElement,
  ColorPickerPanelProps
>(function ColorPickerPanel({ className, ...props }, ref) {
  const { disabled } = useColorPicker("Panel");

  return (
    <div
      ref={ref}
      className={clsx(styles.panel, styles.standalonePanel, className)}
      data-forte="color-picker-panel"
      data-disabled={disabled || undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Row
 * ---------------------------------------------------------------------- */

export interface ColorPickerRowProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The compact control row: eyedropper, preview, format and text field sitting
 * on one line.
 *
 * A plain `<div>` rather than a Base UI part, the way `Popover.Footer` is. It
 * exists because that row is the piece of chrome every second picker grows,
 * and left to each consumer it is re-invented with a different gap each time —
 * one that stops the text field from shrinking below its content and pushing
 * the panel wider than the popup it sits in.
 */
export const ColorPickerRow = React.forwardRef<HTMLDivElement, ColorPickerRowProps>(
  function ColorPickerRow({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.row, className)}
        data-forte="color-picker-row"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Area
 * ---------------------------------------------------------------------- */

export interface ColorPickerAreaProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "onChange"> {
  /**
   * Accessible name for the horizontal axis.
   * @default "Saturation"
   */
  saturationLabel?: string;
  /**
   * Accessible name for the vertical axis.
   * @default "Brightness"
   */
  brightnessLabel?: string;
  /**
   * How far one arrow key moves each axis, as a fraction of the axis.
   * `Shift` multiplies it by ten, as it does on the sliders.
   * @default 0.01
   */
  step?: number;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The saturation/brightness canvas — the part that makes this a colour picker
 * rather than a swatch list. Renders a `<div>` with a draggable thumb and two
 * nested `<input type="range">`.
 *
 * The two inputs are the whole accessibility story. A 2D field has no ARIA
 * role of its own, so it is expressed as what it actually is: two ranges that
 * happen to share a thumb. Each is a real slider to assistive technology and
 * to the keyboard — arrow keys, Home, End and Page Up/Down all work without
 * this component implementing any of them — and an arrow key across the axes
 * moves focus to the other input, so the value that changes is the value that
 * gets announced.
 *
 * The canvas does NOT mirror under RTL, and that is deliberate: it is a
 * picture of a colour space, not a line of text, and the hue that sits on the
 * left of every other colour tool in the world should not move because the
 * surrounding paragraph runs the other way. The hue and alpha rails DO mirror,
 * because they are sliders and a slider's start follows the writing direction.
 */
export const ColorPickerArea = React.forwardRef<HTMLDivElement, ColorPickerAreaProps>(
  function ColorPickerArea(
    {
      saturationLabel = "Saturation",
      brightnessLabel = "Brightness",
      step = 0.01,
      className,
      style,
      /* Destructured rather than left in the rest object: the spread below
       * runs AFTER these attributes, so a consumer's `onPointerDown` would
       * replace the one that moves the colour instead of running beside it. */
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref,
  ) {
    const context = useColorPicker("Area");
    const { hsva, disabled, update, commit } = context;
    const vars = useColorVars(context);

    const areaRef = React.useRef<HTMLDivElement | null>(null);
    const saturationRef = React.useRef<HTMLInputElement>(null);
    const brightnessRef = React.useRef<HTMLInputElement>(null);
    const draggingRef = React.useRef(false);
    const [dragging, setDragging] = React.useState(false);

    React.useImperativeHandle(ref, () => areaRef.current as HTMLDivElement, []);

    const positionFrom = (event: React.PointerEvent<HTMLDivElement>) => {
      const element = areaRef.current;
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      /* Guard the divide: a canvas inside a popup that has not finished its
        * enter transition can still measure zero on the first pointer event. */
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        s: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        v: 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1),
      };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) {
        onPointerDown?.(event);
        return;
      }
      /* Stops the text-selection drag and, on touch, the scroll that would
        * otherwise steal the gesture — `touch-action: none` in the stylesheet
        * covers the part preventDefault cannot. */
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
      /* Pointer-down does not focus a div, and the keyboard should carry on
        * from wherever the user just clicked. `preventDefault` above means
        * this is the only thing that moves focus. */
      saturationRef.current?.focus();
      const next = positionFrom(event);
      if (next) update(next, "area");
      onPointerDown?.(event);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (!draggingRef.current) return;
      const next = positionFrom(event);
      if (next) update(next, "area");
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      (event.type === "pointerup" ? onPointerUp : onPointerCancel)?.(event);
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      commit("area");
    };

    /* All four arrows, on both inputs.
     *
     * Two things fall out of taking them all rather than only the two each
     * input does not own. Focus follows the axis that changed, so the value a
     * screen reader announces is the value that moved — announcing an
     * unchanged saturation while brightness went up is worse than saying
     * nothing. And `Shift` means ten steps on every arrow: left to the native
     * range control, the same-axis arrows would ignore it while the cross-axis
     * ones honoured it, so the canvas would accelerate in one direction and
     * not the other.
     *
     * Home, End, Page Up and Page Down are deliberately left to the input,
     * which already does the right thing with them — ends of the axis, and ten
     * percent a page. */
    const ARROWS: Record<string, { axis: "s" | "v"; direction: 1 | -1 }> = {
      ArrowRight: { axis: "s", direction: 1 },
      ArrowLeft: { axis: "s", direction: -1 },
      ArrowUp: { axis: "v", direction: 1 },
      ArrowDown: { axis: "v", direction: -1 },
    };

    const handleArrow = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const move = ARROWS[event.key];
      if (!move) return;
      event.preventDefault();
      const amount = step * (event.shiftKey ? 10 : 1) * move.direction;
      update({ [move.axis]: clamp(hsva[move.axis] + amount, 0, 1) }, "area");
      commit("area");
      (move.axis === "s" ? saturationRef : brightnessRef).current?.focus();
    };

    /* Two precisions, on purpose. The HANDLE is placed from the unrounded
     * value: rounding it to whole percent quantises a drag to 1% of the
     * canvas, which on a 240px panel is a visible two-pixel stutter under a
     * pointer that is moving smoothly. The ANNOUNCED value is rounded,
     * because "37.6%" is not what a screen-reader user wants to hear on every
     * arrow press. The input's own value keeps two decimals so the two never
     * disagree by more than a rounding step. */
    const percent = (n: number) => Math.round(n * 100);
    const exact = (n: number) => Math.round(n * 10000) / 100;

    return (
      <div
        ref={areaRef}
        className={clsx(styles.area, className)}
        data-forte="color-picker-area"
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        style={{ ...vars, ...style }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        {...props}
      >
        <div
          className={clsx(styles.areaThumb, "forte-focus-ring-within")}
          data-forte="color-picker-area-thumb"
          style={{
            /* Physical, not logical: see the note on RTL above. */
            left: `${exact(hsva.s)}%`,
            top: `${exact(1 - hsva.v)}%`,
          }}
        >
          <input
            ref={saturationRef}
            className={styles.srOnly}
            type="range"
            min={0}
            max={100}
            step={step * 100}
            value={exact(hsva.s)}
            disabled={disabled}
            aria-label={saturationLabel}
            aria-valuetext={`${percent(hsva.s)}%`}
            onChange={(event) => {
              update({ s: Number(event.target.value) / 100 }, "area");
              commit("area");
            }}
            onKeyDown={handleArrow}
          />
          <input
            ref={brightnessRef}
            className={styles.srOnly}
            type="range"
            min={0}
            max={100}
            step={step * 100}
            value={exact(hsva.v)}
            disabled={disabled}
            aria-label={brightnessLabel}
            /* The input is horizontal; the axis it drives is not. Without this
              * the pair is announced as two identical horizontal sliders. */
            aria-orientation="vertical"
            aria-valuetext={`${percent(hsva.v)}%`}
            onChange={(event) => {
              update({ v: Number(event.target.value) / 100 }, "area");
              commit("area");
            }}
            onKeyDown={handleArrow}
          />
        </div>
      </div>
    );
  },
);

/* -------------------------------------------------------------------------
 * Hue and alpha rails
 * ---------------------------------------------------------------------- */

interface RailProps {
  channel: "hue" | "alpha";
  label: string;
  className?: string;
  style?: React.CSSProperties;
  rest: Record<string, unknown>;
}

/**
 * The two rails are one component behind two exports.
 *
 * Both are Base UI sliders with a painted track: same anatomy, same keyboard,
 * same pointer handling, and the differences — range, gradient, what the thumb
 * is filled with — are three lines. Base UI is doing the work that matters
 * here, including the RTL flip, which is why neither rail implements a drag.
 */
function Rail({ channel, label, className, style, rest }: RailProps) {
  const context = useColorPicker(channel === "hue" ? "HueSlider" : "AlphaSlider");
  const { hsva, disabled, update, commit } = context;
  const vars = useColorVars(context);

  const hue = channel === "hue";
  const value = hue ? hsva.h : hsva.a * 100;

  return (
    <BaseSlider.Root
      value={value}
      min={0}
      max={hue ? 360 : 100}
      step={1}
      largeStep={10}
      disabled={disabled}
      /* The handle stays inside the rail at either end instead of hanging half
       * off it. On an ordinary slider that is cosmetic; here the rail is the
       * only thing saying which colour is selected, and a handle centred on
       * the edge at hue 0 sits half over the panel with red behind only one
       * side of it. */
      thumbAlignment="edge"
      onValueChange={(next) =>
        update(hue ? { h: next } : { a: next / 100 }, hue ? "hue" : "alpha")
      }
      onValueCommitted={() => commit(hue ? "hue" : "alpha")}
      className={clsx(styles.rail, className)}
      data-forte={`color-picker-${channel}-slider`}
      style={{ ...vars, ...style }}
      {...rest}
    >
      <BaseSlider.Control className={styles.railControl}>
        <BaseSlider.Track
          className={hue ? styles.hueTrack : styles.alphaTrack}
          data-forte={`color-picker-${channel}-track`}
        >
          <BaseSlider.Thumb
            className={clsx(styles.railThumb, "forte-focus-ring-within")}
            data-forte={`color-picker-${channel}-thumb`}
            aria-label={label}
            getAriaValueText={(_formatted, raw) =>
              hue ? `${Math.round(raw)}°` : `${Math.round(raw)}%`
            }
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

export interface ColorPickerHueSliderProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Accessible name for the rail.
   * @default "Hue"
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The hue rail — 0° to 360°, one degree per arrow key and ten per Page Up.
 *
 * Hue is the axis the canvas cannot show, since the canvas is a slice through
 * one hue. Rendering an `Area` without this leaves the user stuck in whichever
 * hue the value arrived in.
 */
export function ColorPickerHueSlider({
  label = "Hue",
  className,
  style,
  ...props
}: ColorPickerHueSliderProps) {
  return (
    <Rail channel="hue" label={label} className={className} style={style} rest={props} />
  );
}

export interface ColorPickerAlphaSliderProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Accessible name for the rail.
   * @default "Opacity"
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The opacity rail — 0% to 100% over a checkerboard.
 *
 * Rendering it is what turns alpha on: the picker omits alpha from every
 * format while the colour is fully opaque, so a picker without this rail emits
 * `#7c3aed` rather than `#7c3aedff` and needs no prop to say so. A
 * `defaultValue` that already carries alpha keeps it either way.
 */
export function ColorPickerAlphaSlider({
  label = "Opacity",
  className,
  style,
  ...props
}: ColorPickerAlphaSliderProps) {
  return (
    <Rail channel="alpha" label={label} className={className} style={style} rest={props} />
  );
}

/* -------------------------------------------------------------------------
 * Swatches
 * ---------------------------------------------------------------------- */

interface SwatchesContextValue {
  /** The swatch that holds the group's single tab stop. */
  roving: string | null;
}

const SwatchesContext = React.createContext<SwatchesContextValue | null>(null);

export interface ColorPickerSwatchesProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "color"> {
  /**
   * The palette, as CSS colour strings. Anything `value` accepts works here,
   * including translucent colours.
   * @default DEFAULT_SWATCHES
   */
  colors?: readonly string[];
  /**
   * How many swatches per row. Also the arrow-key stride, so Up and Down move
   * between rows rather than by one.
   * @default 8
   */
  columns?: number;
  /**
   * Accessible name for the group.
   * @default "Colour swatches"
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A grid of preset colours. Renders a `<div>` with `role="radiogroup"`.
 *
 * Radio semantics, not a row of buttons, because that is what the control
 * actually is: a set of mutually exclusive options where at most one is
 * current. It buys the whole keyboard convention with it — one tab stop for
 * the group, arrow keys between swatches, and selection following focus — so a
 * twenty-four colour palette costs a keyboard user one Tab instead of
 * twenty-four.
 *
 * The colours come from `colors`; children are not read. That is what lets the
 * group know its own order, which is what arrow keys and the single tab stop
 * are computed from. For a palette you want to build element by element, use
 * `ColorPicker.Swatch` on its own — outside a group each swatch is an
 * independent toggle.
 */
export const ColorPickerSwatches = React.forwardRef<
  HTMLDivElement,
  ColorPickerSwatchesProps
>(function ColorPickerSwatches(
  {
    colors = DEFAULT_SWATCHES,
    columns = 8,
    label = "Colour swatches",
    className,
    style,
    onKeyDown,
    ...props
  },
  ref,
) {
  const { rgba, disabled } = useColorPicker("Swatches");

  /* The tab stop belongs to the selected swatch, and to the first one when
   * nothing matches — the roving-tabindex rule, which is what stops Tab from
   * landing on a swatch the user has never seen while the selected one is
   * three rows up. */
  const roving = React.useMemo(() => {
    const selected = colors.find((color) => {
      const parsed = parseColor(color);
      return parsed ? sameColor(hsvaToRgba(parsed), rgba) : false;
    });
    return selected ?? colors[0] ?? null;
  }, [colors, rgba]);

  const context = React.useMemo(() => ({ roving }), [roving]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[data-forte="color-picker-swatch"]:not(:disabled)',
      ),
    );
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;

    /* Left and right follow the writing direction — unlike the canvas, this
     * IS a list, and a list reads the way its language does. */
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? -1 : 1;

    let next = index;
    switch (event.key) {
      case "ArrowRight":
        next = index + forward;
        break;
      case "ArrowLeft":
        next = index - forward;
        break;
      case "ArrowDown":
        next = index + columns;
        break;
      case "ArrowUp":
        next = index - columns;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    /* Clamped rather than wrapped: a grid whose last row is short would
     * otherwise send Down into a gap and then round to an unrelated column. */
    const target = items[clamp(next, 0, items.length - 1)];
    target?.focus();
    /* Selection follows focus — the radio convention, and here also a live
     * preview: arrowing across the palette paints as it goes. Done by clicking
     * the swatch rather than from a `focus` handler on it, so it does not
     * depend on `:focus-visible` matching a script-moved focus, and so a
     * pointer press stays exactly one selection rather than two. */
    target?.click();
  };

  return (
    <SwatchesContext.Provider value={context}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={clsx(styles.swatches, className)}
        data-forte="color-picker-swatches"
        data-disabled={disabled || undefined}
        style={
          {
            "--forte-color-picker-swatch-columns": columns,
            ...style,
          } as React.CSSProperties
        }
        onKeyDown={handleKeyDown}
        {...props}
      >
        {colors.map((color, index) => (
          <ColorPickerSwatch key={`${color}-${index}`} value={color} />
        ))}
      </div>
    </SwatchesContext.Provider>
  );
});

export interface ColorPickerSwatchProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className" | "value" | "color"> {
  /**
   * The colour this swatch sets, as a CSS colour string.
   */
  value: string;
  /**
   * Accessible name. Defaults to the colour string, which is the only thing
   * that is reliably true about it — a name of your own ("Brand primary") is
   * better wherever you have one.
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One preset colour. Renders a `<button>`.
 *
 * Inside `ColorPicker.Swatches` it is a radio in that group. On its own it is
 * a toggle button carrying `aria-pressed` — a lone `role="radio"` would
 * promise a group that does not exist.
 *
 * Selection is decided by comparing eight-bit colour, not strings, so a swatch
 * written `#f00` is still shown as current when the value reads
 * `rgb(255 0 0)`.
 */
export const ColorPickerSwatch = React.forwardRef<
  HTMLButtonElement,
  ColorPickerSwatchProps
>(function ColorPickerSwatch(
  { value, label, disabled: disabledProp, className, style, onClick, ...props },
  ref,
) {
  const { rgba, disabled, update, commit } = useColorPicker("Swatch");
  const group = React.useContext(SwatchesContext);

  const parsed = React.useMemo(() => parseColor(value), [value]);
  const selected = parsed ? sameColor(hsvaToRgba(parsed), rgba) : false;

  const select = () => {
    if (!parsed) return;
    update(parsed, "swatch");
    commit("swatch");
  };

  return (
    <button
      ref={ref}
      type="button"
      role={group ? "radio" : undefined}
      aria-checked={group ? selected : undefined}
      aria-pressed={group ? undefined : selected}
      aria-label={label ?? value}
      disabled={disabled || disabledProp}
      tabIndex={group ? (group.roving === value ? 0 : -1) : undefined}
      className={clsx(styles.swatch, "forte-focus-ring", className)}
      data-forte="color-picker-swatch"
      data-selected={selected || undefined}
      style={
        {
          "--forte-color-picker-swatch": value,
          "--forte-color-picker-swatch-on": parsed
            ? onColor(hsvaToRgba(parsed))
            : "currentColor",
          ...style,
        } as React.CSSProperties
      }
      onClick={(event) => {
        select();
        onClick?.(event);
      }}
      {...props}
    >
      {selected ? (
        <svg
          className={styles.swatchTick}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m3.5 8.5 3 3 6-7" />
        </svg>
      ) : null}
    </button>
  );
});

/* -------------------------------------------------------------------------
 * Preview and value
 * ---------------------------------------------------------------------- */

export interface ColorPickerPreviewProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "color"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A chip filled with the current colour, over a checkerboard so a translucent
 * value is legible. Renders a `<div>`.
 *
 * Decorative: `aria-hidden`, because the colour it shows is already announced
 * by the trigger and readable in `ColorPicker.Input`, and a third announcement
 * of the same value on every drag frame is noise.
 */
export const ColorPickerPreview = React.forwardRef<
  HTMLDivElement,
  ColorPickerPreviewProps
>(function ColorPickerPreview({ className, style, ...props }, ref) {
  const context = useColorPicker("Preview");
  const vars = useColorVars(context);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx(styles.preview, className)}
      data-forte="color-picker-preview"
      style={{ ...vars, ...style }}
      {...props}
    />
  );
});

export interface ColorPickerValueProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The current colour as text, in the current format. Renders a `<span>` in the
 * mono face with tabular figures, so the readout does not change width as the
 * digits change under a drag.
 */
export const ColorPickerValue = React.forwardRef<
  HTMLSpanElement,
  ColorPickerValueProps
>(function ColorPickerValue({ className, ...props }, ref) {
  const { text } = useColorPicker("Value");

  return (
    <span
      ref={ref}
      className={clsx(styles.value, className)}
      data-forte="color-picker-value"
      {...props}
    >
      {text}
    </span>
  );
});

/* -------------------------------------------------------------------------
 * Format
 * ---------------------------------------------------------------------- */

export interface ColorPickerFormatProps {
  /**
   * Accessible name for the control.
   * @default "Colour format"
   */
  label?: string;
  /**
   * Additional class name(s) for the trigger. Applied after the internal
   * styles so consumer utilities (e.g. Tailwind) win without needing
   * `!important`.
   */
  className?: string;
}

/**
 * Picks the notation the value is written in, from the `formats` allowed on
 * `ColorPicker.Root`. Composes this library's own `Select`.
 *
 * Changing it rewrites the value rather than the colour: the same colour comes
 * back out as `#7c3aed`, `rgb(124 58 237)`, `hsl(262.1 83.3% 57.8%)` or
 * `oklch(0.5413 0.2466 293.01)` — which is also why HEX rounds and the other
 * three do not.
 */
export function ColorPickerFormatSelect({
  label = "Colour format",
  className,
}: ColorPickerFormatProps) {
  const { format, formats, setFormat, disabled } = useColorPicker("Format");

  const items = React.useMemo(
    () =>
      Object.fromEntries(formats.map((value) => [value, FORMAT_LABELS[value]])),
    [formats],
  );

  return (
    <Select.Root
      items={items}
      value={format}
      onValueChange={(next) => setFormat(next as ColorPickerFormat)}
      disabled={disabled}
    >
      <Select.Trigger
        size="sm"
        variant="ghost"
        aria-label={label}
        className={clsx(styles.format, className)}
        data-forte="color-picker-format"
      >
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        {formats.map((value) => (
          <Select.Item key={value} value={value}>
            {FORMAT_LABELS[value]}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select.Root>
  );
}

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

export interface ColorPickerInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<"input">,
    "className" | "value" | "defaultValue" | "type" | "onChange"
  > {
  /**
   * Accessible name for the field.
   * @default "Colour value"
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A text field holding the colour in the current format. Renders an `<input>`.
 *
 * It is the picker's precision instrument and its paste target — and, for
 * anyone who cannot use a canvas at all, the route to an exact colour that the
 * canvas is not.
 *
 * While it has focus the field keeps the text the user is typing, not the
 * formatted value: rewriting `#7c3` to `#77cc33` mid-keystroke would move the
 * caret and make the field impossible to type into. Every keystroke that
 * parses is applied immediately, so the panel previews as you type; one that
 * does not is left alone and marked `data-invalid`. Blur restores the
 * canonical text, so an abandoned edit cannot leave the field disagreeing with
 * the colour.
 */
export const ColorPickerInput = React.forwardRef<
  HTMLInputElement,
  ColorPickerInputProps
>(function ColorPickerInput(
  { label = "Colour value", className, onKeyDown, onBlur, ...props },
  ref,
) {
  const { text, disabled, update, commit } = useColorPicker("Input");
  const [draft, setDraft] = React.useState<string | null>(null);
  const invalid = draft !== null && parseColor(draft) === null;

  return (
    <input
      ref={ref}
      type="text"
      /* Off, all of it: a colour string is not a word, and a keyboard that
        * capitalises the first letter turns `#ff0000` into something the
        * parser rejects on the way in. */
      spellCheck={false}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      inputMode="text"
      disabled={disabled}
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={draft ?? text}
      className={clsx(styles.input, "forte-focus-ring", className)}
      data-forte="color-picker-input"
      data-invalid={invalid || undefined}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        const parsed = parseColor(next);
        if (parsed) update(parsed, "input");
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          const parsed = draft === null ? null : parseColor(draft);
          if (parsed) {
            update(parsed, "input");
            commit("input");
          }
          /* Enter re-canonicalises without waiting for blur, so `#7C3AED`
            * becomes `#7c3aed` under the cursor and the user can see the
            * value was taken. */
          setDraft(null);
        } else if (event.key === "Escape") {
          setDraft(null);
        }
        onKeyDown?.(event);
      }}
      onBlur={(event) => {
        if (draft !== null && parseColor(draft)) commit("input");
        setDraft(null);
        onBlur?.(event);
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * EyeDropper
 * ---------------------------------------------------------------------- */

interface EyeDropperInstance {
  open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
}

type EyeDropperConstructor = new () => EyeDropperInstance;

export interface ColorPickerEyeDropperProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Accessible name for the button.
   * @default "Pick a colour from the screen"
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Samples a colour from anywhere on the screen, through the browser's
 * EyeDropper API. Renders a `<button>` — or nothing at all where the API is
 * missing, which today is Firefox and every browser on iOS.
 *
 * Rendering nothing is the point: this is a shortcut to a colour the rest of
 * the picker can already reach, so its absence costs a user nothing, while a
 * button that opens no eyedropper costs them a click and their confidence in
 * the rest of the panel. The detection runs in an effect rather than during
 * render because the server cannot know the answer, and guessing there is what
 * produces a hydration mismatch.
 */
export const ColorPickerEyeDropper = React.forwardRef<
  HTMLButtonElement,
  ColorPickerEyeDropperProps
>(function ColorPickerEyeDropper(
  { label = "Pick a colour from the screen", disabled: disabledProp, className, onClick, ...props },
  ref,
) {
  const { disabled, update, commit } = useColorPicker("EyeDropper");
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  if (!supported) return null;

  const pick = async (): Promise<void> => {
    const Constructor = (window as unknown as { EyeDropper?: EyeDropperConstructor })
      .EyeDropper;
    if (!Constructor) return;
    try {
      const { sRGBHex } = await new Constructor().open();
      const parsed = parseColor(sRGBHex);
      if (parsed) {
        /* The API reports no alpha, so the current one is kept rather than
          * reset — sampling a colour should not also clear a transparency the
          * user set on purpose. */
        update({ h: parsed.h, s: parsed.s, v: parsed.v }, "eye-dropper");
        commit("eye-dropper");
      }
    } catch {
      /* Dismissing the eyedropper rejects with AbortError. It is a normal way
        * to end the interaction, not a failure to report. */
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || disabledProp}
      aria-label={label}
      className={clsx(styles.eyeDropper, "forte-focus-ring", className)}
      data-forte="color-picker-eye-dropper"
      onClick={(event) => {
        void pick();
        onClick?.(event);
      }}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={styles.eyeDropperIcon}
      >
        <path d="M13.7 2.3a1.9 1.9 0 0 0-2.7 0L9.6 3.7l2.7 2.7 1.4-1.4a1.9 1.9 0 0 0 0-2.7Z" />
        <path d="M8.9 4.4 3.4 9.9c-.3.3-.45.55-.5.9L2.5 13a.5.5 0 0 0 .6.6l2.2-.4c.35-.05.6-.2.9-.5l5.5-5.5-2.8-2.8Z" />
      </svg>
    </button>
  );
});

/* -------------------------------------------------------------------------
 * HiddenInput
 * ---------------------------------------------------------------------- */

export interface ColorPickerHiddenInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "value" | "onChange"> {
  /**
   * The field name the colour is submitted under.
   */
  name: string;
}

/**
 * Submits the colour with a form. Renders `<input type="hidden">`.
 *
 * Place it next to `ColorPicker.Trigger`, NOT inside `ColorPicker.Popup`. The
 * popup is portalled to `<body>` and unmounted while it is closed, so a hidden
 * input in there is outside the form's element tree even when it exists, and
 * missing entirely by the time anything is submitted.
 */
export const ColorPickerHiddenInput = React.forwardRef<
  HTMLInputElement,
  ColorPickerHiddenInputProps
>(function ColorPickerHiddenInput({ name, ...props }, ref) {
  const { text } = useColorPicker("HiddenInput");

  return (
    <input
      ref={ref}
      type="hidden"
      name={name}
      value={text}
      readOnly
      data-forte="color-picker-hidden-input"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A colour picker: a saturation/brightness canvas, hue and opacity rails, a
 * preset palette, an eyedropper and a text field that reads and writes four
 * CSS notations.
 *
 * Base UI has no colour-picker primitive, so this one is built here — on
 * `Popover` for the anchored surface and on Base UI's `Slider` for the two
 * rails, which is where the keyboard, the pointer capture and the RTL flip
 * come from.
 *
 * ```tsx
 * <ColorPicker.Root defaultValue="#7c3aed">
 *   <ColorPicker.Trigger>Brand colour</ColorPicker.Trigger>
 *   <ColorPicker.Popup>
 *     <ColorPicker.Area />
 *     <ColorPicker.HueSlider />
 *     <ColorPicker.AlphaSlider />
 *     <ColorPicker.Swatches />
 *     <ColorPicker.Row>
 *       <ColorPicker.EyeDropper />
 *       <ColorPicker.Format />
 *       <ColorPicker.Input />
 *     </ColorPicker.Row>
 *   </ColorPicker.Popup>
 * </ColorPicker.Root>
 * ```
 *
 * Every part is opt-in. A picker that is nothing but a palette is
 * `Root` + `Swatches`; one with no transparency simply leaves out
 * `AlphaSlider`, and the value it emits has no alpha channel in it.
 *
 * Styling is driven by `data-*` attributes and `--forte-color-picker-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[selected]:...`) without wrapping.
 *
 * @summary Full colour selection — saturation/brightness canvas, hue and alpha
 *   rails, preset swatches, and a text field that speaks four CSS notations.
 * @category Forms
 */
export const ColorPicker = {
  Root: ColorPickerRoot,
  Trigger: ColorPickerTrigger,
  Popup: ColorPickerPopup,
  Arrow: ColorPickerArrow,
  Panel: ColorPickerPanel,
  Row: ColorPickerRow,
  Area: ColorPickerArea,
  HueSlider: ColorPickerHueSlider,
  AlphaSlider: ColorPickerAlphaSlider,
  Swatches: ColorPickerSwatches,
  Swatch: ColorPickerSwatch,
  Preview: ColorPickerPreview,
  Value: ColorPickerValue,
  Format: ColorPickerFormatSelect,
  Input: ColorPickerInput,
  EyeDropper: ColorPickerEyeDropper,
  HiddenInput: ColorPickerHiddenInput,
};
