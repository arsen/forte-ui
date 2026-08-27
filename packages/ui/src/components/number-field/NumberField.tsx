"use client";

import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { clsx } from "clsx";
import styles from "./NumberField.module.css";

export type NumberFieldSize = "sm" | "md" | "lg";
export type NumberFieldVariant = "outline" | "soft" | "ghost";
export type NumberFieldScrubDirection = "horizontal" | "vertical";

// Module-scoped ambient declaration, not a global one: the package compiles
// without `@types/node`, and every bundler statically replaces the literal
// expression `process.env.NODE_ENV`, so the dev-only warning below is dropped
// from production builds. The `typeof` guard covers the bundler that doesn't.
declare const process: { env: { NODE_ENV?: string } };

const isDevelopment =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/* -------------------------------------------------------------------------
 * Icons
 *
 * All decorative. The steppers already carry Base UI's own `aria-label`
 * ("Increase" / "Decrease"), and the two scrub glyphs depict an affordance,
 * not a value — `data-scrubbing` is what a consumer reads for state.
 * ---------------------------------------------------------------------- */

function MinusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="M4 8h8" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="M8 4v8M4 8h8" />
    </svg>
  );
}

/**
 * The resting affordance: a double-headed arrow that says "this drags".
 *
 * Drawn pointing along the inline axis and rotated to the block axis by the
 * stylesheet, so one glyph covers both scrub directions. It is symmetric about
 * both axes, which is also why it needs no `--pui-direction` correction in
 * RTL — there is no "forward" end to get backwards.
 */
function ScrubGripIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* No inline `display: block` here, unlike the stepper glyphs. An inline
        * style beats every stylesheet rule, and the stylesheet is what takes
        * the grip away in the states that cannot be dragged. The `display` it
        * needs is set on `.scrubGrip` instead. */}
      <path d="M3.5 8h9M6 5.5 3.5 8 6 10.5M10 5.5 12.5 8 10 10.5" />
    </svg>
  );
}

/**
 * The glyph that stands in for the mouse pointer while a scrub is running.
 *
 * It is filled rather than stroked, and painted with a wide background-coloured
 * stroke UNDER the fill (`paint-order: stroke`, set in the stylesheet). The
 * cursor is portalled to `<body>` and dragged across whatever the page happens
 * to contain, so a single-tone glyph disappears the moment it crosses something
 * of a similar colour — the halo is what keeps it readable everywhere.
 */
function ScrubCursorIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 26 14"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M3 7 8.5 3v2.5h9V3L23 7l-5.5 4V8.5h-9V11Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

/**
 * `size` and `variant` are chosen once, on `NumberField.Root`, and every part
 * republishes them as `data-size` / `data-variant` so a consumer can write
 * `data-[size=lg]:…` against the input or a stepper without wrapping anything.
 * Passing them through context rather than as per-part props is what makes a
 * mismatched pair — an `lg` group holding `sm` steppers — unexpressible.
 */
const NumberFieldContext = React.createContext<{
  size: NumberFieldSize;
  variant: NumberFieldVariant;
}>({ size: "md", variant: "outline" });

/**
 * The scrub direction, published by `ScrubArea` and read by `ScrubAreaCursor`.
 *
 * It has to travel through React context and not through the DOM, because the
 * cursor is portalled to `<body>`: by the time it renders it is no longer a
 * descendant of the scrub area, so no CSS selector and no `data-*` lookup can
 * reach the direction. The React tree still nests, which is what this uses.
 */
const ScrubAreaContext = React.createContext<{
  direction: NumberFieldScrubDirection;
}>({ direction: "horizontal" });

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseNumberField.Root>;

export interface NumberFieldRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Size of the control. Height, inline padding, stepper width and font size
   * all move together, and the numbers come from the same `--pui-control-*`
   * tokens `Input` and `Select.Trigger` read — so the three line up on one row
   * at every `data-pui-density` setting.
   * @default "md"
   */
  size?: NumberFieldSize;
  /**
   * How much visual weight the control carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance — the
   * same three `Input` has.
   * @default "outline"
   */
  variant?: NumberFieldVariant;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups every part of the number field and owns its value. Renders a `<div>`
 * laid out as a column, so a `ScrubArea` wrapping the label sits above the
 * `Group`.
 *
 * The value is a `number | null`, never a string: `null` is the empty field,
 * which is what makes "cleared" distinguishable from zero. `format` takes
 * `Intl.NumberFormatOptions`, so currency, percent and unit displays are a prop
 * rather than a wrapper.
 *
 * ```tsx
 * <NumberField.Root defaultValue={100} min={0} max={999}>
 *   <NumberField.ScrubArea>
 *     <Field.Label>Width</Field.Label>
 *   </NumberField.ScrubArea>
 *   <NumberField.Group>
 *     <NumberField.Decrement />
 *     <NumberField.Input />
 *     <NumberField.Increment />
 *   </NumberField.Group>
 * </NumberField.Root>
 * ```
 */
export const NumberFieldRoot = React.forwardRef<HTMLDivElement, NumberFieldRootProps>(
  function NumberFieldRoot({ size = "md", variant = "outline", className, ...props }, ref) {
    const context = React.useMemo(() => ({ size, variant }), [size, variant]);

    return (
      <NumberFieldContext.Provider value={context}>
        <BaseNumberField.Root
          ref={ref}
          className={clsx(styles.root, className)}
          data-pui="number-field"
          data-size={size}
          data-variant={variant}
          {...props}
        />
      </NumberFieldContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

type BaseGroupProps = React.ComponentPropsWithoutRef<typeof BaseNumberField.Group>;

export interface NumberFieldGroupProps extends Omit<BaseGroupProps, "className"> {
  /**
   * Stretch the group to fill the width of its container. Only needed outside
   * a `Field.Root` — a field is a flex column, so a group inside one already
   * stretches.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The bordered shell holding the steppers and the input. Renders a `<div>`, and
 * it — not the input — is the element that looks like the control: the input
 * inside it is borderless and transparent, so the three segments read as one
 * box.
 *
 * Which is why the group carries `.pui-focus-ring-within` rather than the input
 * carrying `.pui-focus-ring`. Focusing the text field rings the whole control,
 * the way focusing an `Input` rings the whole input — and since the steppers are
 * not tab stops, that is the only ring anyone sees by default. An app that puts
 * them back in the tab order gets an inset ring on the button instead; the
 * stylesheet suppresses the group's ring in that case so the two never stack.
 *
 * The one thing that DOES stack is an app-level global `:focus-visible` rule.
 * It outranks every `pretty-ui` layer by design, so it re-rings the input this
 * component deliberately left unringed, and the control wears two rings — a
 * rounded one around the group and a square-cornered one around the middle
 * segment. Scope such a rule away from parts a component already rings:
 * `:focus-visible:not(:where(.pui-focus-ring-within *))`.
 *
 * `data-scrubbing` lands here while a `ScrubArea` drag is running, which is
 * what ties the drag happening on the label back to the value it is changing.
 */
export const NumberFieldGroup = React.forwardRef<HTMLDivElement, NumberFieldGroupProps>(
  function NumberFieldGroup({ fullWidth = false, className, ...props }, ref) {
    const { size, variant } = React.useContext(NumberFieldContext);

    return (
      <BaseNumberField.Group
        ref={ref}
        className={clsx(styles.group, "pui-focus-ring-within", className)}
        data-pui="number-field-group"
        data-size={size}
        data-variant={variant}
        data-full-width={fullWidth || undefined}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

type BaseInputProps = React.ComponentPropsWithoutRef<typeof BaseNumberField.Input>;

export interface NumberFieldInputProps extends Omit<BaseInputProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The text field itself. Renders an `<input>` that is borderless and
 * transparent — `Group` draws the box around it.
 *
 * The digits are set in `tabular-nums`. That is not typographic polish: during
 * a scrub the value changes every few pixels of pointer movement, and
 * proportional figures make the number visibly breathe as the digits change
 * width. Tabular figures hold still.
 *
 * Base UI gives it `aria-roledescription="Number field"` and wires it to a
 * `Field.Label` above; the label names it, the role description explains it.
 */
export const NumberFieldInput = React.forwardRef<HTMLInputElement, NumberFieldInputProps>(
  function NumberFieldInput({ className, ...props }, ref) {
    const { size, variant } = React.useContext(NumberFieldContext);

    return (
      <BaseNumberField.Input
        ref={ref}
        className={clsx(styles.input, className)}
        data-pui="number-field-input"
        data-size={size}
        data-variant={variant}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Steppers
 * ---------------------------------------------------------------------- */

type BaseIncrementProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Increment
>;

export interface NumberFieldIncrementProps
  extends Omit<BaseIncrementProps, "className"> {
  /**
   * Glyph to render. Defaults to a plus sign.
   * @default <PlusIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/*
 * Both steppers share one `.stepper` rule — they are the same button mirrored,
 * and splitting them would be two copies of eleven declarations to keep in
 * step. They keep DISTINCT `data-pui` markers all the same: the marker names
 * the PART, which is Base UI's anatomy and a consumer's only stable selector,
 * while the class names the rule. `.stepper[data-pui$="increment"]` is how the
 * stylesheet tells them apart where it has to.
 */
function stepperClassName(className?: string) {
  return clsx(
    styles.stepper,
    // Nothing reaches this by default — Base UI gives both steppers
    // `tabIndex={-1}`, because the arrow keys already do what they do from the
    // field the user is already in. It is here for the app that puts them back
    // in the tab order with `tabIndex={0}`, and `data-focus-inset` below flips
    // the ring inward: the buttons sit flush against the group's edge, so an
    // outward ring would be drawn over the input segment beside them.
    "pui-focus-ring",
    // At `sm` under `data-pui-density="compact"` the group is exactly 24px tall,
    // so the button inside its border is 22px — under the SC 2.5.8 floor. This
    // grows the hit area without repainting anything, and unlike the ring it
    // matters on every configuration, since these are pointer targets first.
    "pui-target",
    className,
  );
}

/**
 * The stepper that increases the value. Renders a `<button>`.
 *
 * Base UI gives it `aria-label="Increase"` and `aria-controls` pointing at the
 * input, so the default glyph needs no label of its own — and `tabIndex={-1}`,
 * so it is a pointer affordance rather than a tab stop. That is the right shape
 * for a spin button: the arrow keys already step the value from the field
 * itself, and two extra stops per field would cost keyboard users presses
 * without adding a capability.
 *
 * Holding it repeats, and the modifier keys apply to a press as well —
 * <kbd>Alt</kbd> steps by `smallStep`, <kbd>Shift</kbd> by `largeStep`.
 */
export const NumberFieldIncrement = React.forwardRef<
  HTMLButtonElement,
  NumberFieldIncrementProps
>(function NumberFieldIncrement({ className, children, ...props }, ref) {
  const { size, variant } = React.useContext(NumberFieldContext);

  return (
    <BaseNumberField.Increment
      ref={ref}
      className={stepperClassName(className)}
      data-pui="number-field-increment"
      data-size={size}
      data-variant={variant}
      data-focus-inset=""
      {...props}
    >
      {children ?? <PlusIcon />}
    </BaseNumberField.Increment>
  );
});

type BaseDecrementProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Decrement
>;

export interface NumberFieldDecrementProps
  extends Omit<BaseDecrementProps, "className"> {
  /**
   * Glyph to render. Defaults to a minus sign.
   * @default <MinusIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The stepper that decreases the value. Renders a `<button>`, labelled
 * "Decrease" by Base UI and outside the tab order for the same reason
 * `Increment` is.
 *
 * Put it before `Input` in the markup. The order is physical, not logical: it
 * is what makes the minus land on the start edge, and it flips with `dir="rtl"`
 * on its own because the group is a flex row and its corner radii are logical.
 */
export const NumberFieldDecrement = React.forwardRef<
  HTMLButtonElement,
  NumberFieldDecrementProps
>(function NumberFieldDecrement({ className, children, ...props }, ref) {
  const { size, variant } = React.useContext(NumberFieldContext);

  return (
    <BaseNumberField.Decrement
      ref={ref}
      className={stepperClassName(className)}
      data-pui="number-field-decrement"
      data-size={size}
      data-variant={variant}
      data-focus-inset=""
      {...props}
    >
      {children ?? <MinusIcon />}
    </BaseNumberField.Decrement>
  );
});

/* -------------------------------------------------------------------------
 * Scrub area
 * ---------------------------------------------------------------------- */

type BaseScrubAreaProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.ScrubArea
>;

export interface NumberFieldScrubAreaProps
  extends Omit<BaseScrubAreaProps, "className"> {
  /**
   * Axis the pointer has to travel along. Also picks the resize cursor and the
   * rotation of both scrub glyphs.
   * @default "horizontal"
   */
  direction?: NumberFieldScrubDirection;
  /**
   * Render the double-headed arrow after the children.
   *
   * This is the whole reason a scrub area is discoverable: nothing else about a
   * label suggests it can be dragged, and a cursor change only arrives once the
   * pointer is already on it. Turn it off when the surrounding design carries
   * the affordance some other way — never just to tidy the layout.
   * @default true
   */
  grip?: boolean;
  /**
   * Render a `ScrubAreaCursor` with the default glyph.
   *
   * Scrubbing takes a pointer lock, and a locked pointer is an INVISIBLE one —
   * without a stand-in the user drags with no cursor at all. That is why this
   * defaults to on. Set it to `false` when you want to supply your own, and
   * render `<NumberField.ScrubAreaCursor>` inside the scrub area yourself.
   * @default true
   */
  cursor?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The click-and-drag surface. Renders a `<span>`, and is normally wrapped
 * around the field's label — dragging sideways over the word "Width" changes
 * the width, which is the interaction Figma and Blender taught everyone.
 *
 * Scrubbing is invisible unless the component says so, so three cues ship by
 * default and they cover three different moments:
 *
 * 1. **At rest** — the `grip`, a double-headed arrow after the label. This is
 *    the only cue present before the user has done anything, and the only one a
 *    touch user ever sees, so it is on by default.
 * 2. **On hover** — a resize cursor (`ew-resize` / `ns-resize`, per
 *    `direction`) and a panel wash behind the label.
 * 3. **During the drag** — `data-scrubbing` tints this area and the `Group`'s
 *    border, and the `cursor` stands in for the pointer the lock has hidden.
 *
 * The resize cursor is a deliberate exception to the library's pointer rule.
 * `cursor: pointer` promises "click me and something happens", and clicking a
 * scrub area does nothing at all — the value only moves once the pointer does.
 * The resize cursor is the one the platform already uses for exactly this
 * gesture.
 *
 * ```tsx
 * <NumberField.ScrubArea direction="vertical" pixelSensitivity={3}>
 *   <Field.Label>Opacity</Field.Label>
 * </NumberField.ScrubArea>
 * ```
 */
export const NumberFieldScrubArea = React.forwardRef<
  HTMLSpanElement,
  NumberFieldScrubAreaProps
>(function NumberFieldScrubArea(
  { direction = "horizontal", grip = true, cursor = true, className, children, ...props },
  ref,
) {
  const { size, variant } = React.useContext(NumberFieldContext);
  const scrubContext = React.useMemo(() => ({ direction }), [direction]);

  if (isDevelopment && cursor) {
    // The one mistake this API can produce: copying Base UI's markup, which
    // spells the cursor out, into a component that already renders one. Two
    // identical glyphs stack pixel-perfectly, so nothing looks wrong — the
    // warning is the only way anyone finds out.
    const hasOwnCursor = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === NumberFieldScrubAreaCursor,
    );
    if (hasOwnCursor) {
      console.warn(
        "[pretty-ui] NumberField.ScrubArea renders its own ScrubAreaCursor by " +
          "default. Pass `cursor={false}` alongside your own, or drop yours.",
      );
    }
  }

  return (
    <ScrubAreaContext.Provider value={scrubContext}>
      <BaseNumberField.ScrubArea
        ref={ref}
        direction={direction}
        className={clsx(styles.scrubArea, className)}
        data-pui="number-field-scrub-area"
        data-size={size}
        data-variant={variant}
        data-direction={direction}
        {...props}
      >
        {children}
        {grip ? (
          <ScrubGripIcon className={styles.scrubGrip} data-pui="number-field-scrub-grip" />
        ) : null}
        {cursor ? <NumberFieldScrubAreaCursor /> : null}
      </BaseNumberField.ScrubArea>
    </ScrubAreaContext.Provider>
  );
});

type BaseScrubAreaCursorProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.ScrubAreaCursor
>;

export interface NumberFieldScrubAreaCursorProps
  extends Omit<BaseScrubAreaCursorProps, "className"> {
  /**
   * Glyph to render. Defaults to a haloed double-headed arrow, rotated to match
   * the scrub area's `direction`.
   * @default <ScrubCursorIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The stand-in for the mouse pointer while a scrub is running. Renders a
 * `<span>` portalled to `<body>` and positioned by Base UI, only while the drag
 * is live.
 *
 * `ScrubArea` renders one for you; reach for this directly only to supply a
 * different glyph, and pass `cursor={false}` to the scrub area when you do.
 *
 * Two consequences of the portal are worth knowing. It does not inherit a
 * `.pui-theme` scope, so it paints from whatever the document root resolves —
 * the same trade every portalled surface in this library makes. And Base UI
 * writes `transform` on it on every pointer move, so nothing here may animate
 * or set that property.
 *
 * It does not render at all in Safari (which shifts the layout when a pointer
 * lock is taken) or after a denied lock; the native cursor stays visible in
 * both cases, so the drag still works — it just looks ordinary.
 */
export const NumberFieldScrubAreaCursor = React.forwardRef<
  HTMLSpanElement,
  NumberFieldScrubAreaCursorProps
>(function NumberFieldScrubAreaCursor({ className, children, ...props }, ref) {
  const { direction } = React.useContext(ScrubAreaContext);

  return (
    <BaseNumberField.ScrubAreaCursor
      ref={ref}
      className={clsx(styles.scrubAreaCursor, className)}
      data-pui="number-field-scrub-area-cursor"
      data-direction={direction}
      {...props}
    >
      {children ?? <ScrubCursorIcon />}
    </BaseNumberField.ScrubAreaCursor>
  );
});

/**
 * A number field built on Base UI's `NumberField` primitive.
 *
 * It is a text input that knows it holds a number: it parses and formats with
 * `Intl.NumberFormat`, steps with the arrow keys and the two stepper buttons,
 * clamps to `min`/`max`, and hands a form a real `number | null` rather than a
 * string that happens to look numeric.
 *
 * ```tsx
 * <Field.Root name="quantity">
 *   <NumberField.Root defaultValue={1} min={1} max={99}>
 *     <NumberField.ScrubArea>
 *       <Field.Label>Quantity</Field.Label>
 *     </NumberField.ScrubArea>
 *     <NumberField.Group>
 *       <NumberField.Decrement />
 *       <NumberField.Input />
 *       <NumberField.Increment />
 *     </NumberField.Group>
 *   </NumberField.Root>
 * </Field.Root>
 * ```
 *
 * The `ScrubArea` is the part worth knowing about: wrap it around the label and
 * the label becomes a drag handle. It ships its own affordances — a grip glyph
 * at rest, a resize cursor on hover, a tint plus a stand-in pointer during the
 * drag — because a draggable label that looks like a label is a feature nobody
 * discovers. See `NumberField.ScrubArea` for the three cues and how to replace
 * them.
 *
 * Motion — the steppers snap in on `--pui-duration-instant` and spring back
 * out, the way `Button` does. Nothing animates the value itself: it changes
 * every few pixels of a scrub, so a transition on the digits would spend the
 * whole gesture interpolating toward a number that has already moved.
 */
export const NumberField = {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  Increment: NumberFieldIncrement,
  Decrement: NumberFieldDecrement,
  ScrubArea: NumberFieldScrubArea,
  ScrubAreaCursor: NumberFieldScrubAreaCursor,
};
