"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import { Button, type ButtonProps } from "../button";
import { useAutoSize } from "../textarea/Textarea";
import styles from "./InputGroup.module.css";

export type InputGroupSize = "sm" | "md" | "lg";
export type InputGroupVariant = "outline" | "soft" | "ghost";
export type InputGroupAddonAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface InputGroupRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Size of the group. Height, inline padding and font size move together for
   * the control and every addon at once, and the numbers come from the same
   * `--pui-control-*` tokens `Input` and `Select.Trigger` read — so a group
   * and a plain input on one row are the same height at every
   * `data-pui-density` setting.
   * @default "md"
   */
  size?: InputGroupSize;
  /**
   * How much visual weight the group carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance — the
   * same three `Input` has, because to a reader the group *is* the input.
   * @default "outline"
   */
  variant?: InputGroupVariant;
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

/** The selector the root uses to find its control for click-to-focus. */
const CONTROL_SELECTOR =
  '[data-pui="input-group-input"], [data-pui="input-group-textarea"]';

/** Elements a pointer-down inside the group must be left alone on: they are
 * interactive in their own right, and stealing the gesture would break them. */
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [contenteditable="true"]';

/**
 * The field shell: a `<div>` that draws one control boundary — border,
 * background, radius, sizes, variants — around a bare `<InputGroup.Input>` or
 * `<InputGroup.Textarea>` and any number of `<InputGroup.Addon>`s, so icons,
 * prefixes and buttons sit *inside* the field instead of bolted onto it.
 *
 * Focus lives on the control; the group rings for it via
 * `.pui-focus-ring-within`, so the whole field lights up the way a plain
 * `Input` does. Buttons inside addons ring themselves, and the group stands
 * down while they do.
 *
 * The group is a caret region, not a button: clicking anywhere in it —
 * a prefix, an icon, the padding — focuses the control, exactly as clicking
 * the empty end of a plain input places the caret. Interactive children keep
 * the gesture for themselves.
 *
 * There is no `disabled` prop here on purpose. Disabled, read-only and
 * invalid all belong to the control (or the `Field.Root` above it), and the
 * group watches them through `:has()` — one source of truth, no way for the
 * shell and the control to disagree.
 */
export const InputGroupRoot = React.forwardRef<
  HTMLDivElement,
  InputGroupRootProps
>(function InputGroupRoot(
  {
    size = "md",
    variant = "outline",
    fullWidth = false,
    className,
    onPointerDown,
    ...props
  },
  ref,
) {
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    // A pointer-down on an interactive child — the control itself included —
    // must behave natively: the input places its caret, a button presses.
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
      return;
    }
    const control =
      event.currentTarget.querySelector<HTMLElement>(CONTROL_SELECTOR);
    if (!control || control.matches(":disabled")) {
      return;
    }
    // Without this the mousedown blurs an already-focused control for the
    // duration of the click — the ring flickers off and back on.
    event.preventDefault();
    control.focus();
  };

  return (
    <div
      ref={ref}
      className={clsx(styles.root, "pui-focus-ring-within", className)}
      data-pui="input-group"
      data-size={size}
      data-variant={variant}
      data-full-width={fullWidth || undefined}
      // The group is presentational: the control and the buttons inside are
      // what assistive technology should see, not the box around them.
      role="presentation"
      onPointerDown={handlePointerDown}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

type BaseInputProps = React.ComponentPropsWithoutRef<typeof BaseInput>;

export interface InputGroupInputProps
  extends Omit<BaseInputProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The text control, rendered bare: the group owns the border, the background
 * and the height, so this element is transparent and stretches to fill
 * whatever the addons leave.
 *
 * Like `Input`, this is Base UI's `Input` — which *is* `Field.Control` — so a
 * group inside a `Field.Root` picks up the label, the description, the error
 * message, `name` and the validity attributes with no wiring, and the group's
 * boundary recolours from the `data-invalid` this element carries.
 */
export const InputGroupInput = React.forwardRef<
  HTMLElement,
  InputGroupInputProps
>(function InputGroupInput({ className, ...props }, ref) {
  return (
    <BaseInput
      ref={ref}
      // No `.pui-focus-ring`: the group rings on behalf of this element
      // through `.pui-focus-ring-within`, which also silences the UA ring
      // here. A second ring on the segment inside the ringed box is exactly
      // the double-ring that split is designed to prevent.
      className={clsx(styles.input, className)}
      data-pui="input-group-input"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Textarea
 * ---------------------------------------------------------------------- */

type BaseControlProps = React.ComponentPropsWithoutRef<typeof BaseField.Control>;

type TextareaElementProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "className"
>;

export interface InputGroupTextareaProps extends TextareaElementProps {
  /**
   * The number of rows the box is at its shortest. Sets the native `rows`
   * attribute and the floor the control can never shrink below — including
   * under `autoResize`.
   * @default 3
   */
  rows?: number;
  /**
   * The number of rows the box may grow to before it starts scrolling
   * instead. Only a ceiling: a textarea shorter than this is unaffected.
   * Unset means no ceiling.
   */
  maxRows?: number;
  /**
   * Grow with the content as the user types, between `rows` and `maxRows` —
   * the same behaviour, and the same `field-sizing` implementation with the
   * same fallback, as `Textarea`'s `autoResize`.
   * @default false
   */
  autoResize?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /** Replace the rendered element. Defaults to a `<textarea>`. */
  render?: BaseControlProps["render"];
  /** Callback fired when the value changes. Use when controlled. */
  onValueChange?: BaseControlProps["onValueChange"];
}

/**
 * The multi-line control, rendered bare the way `InputGroup.Input` is — the
 * group draws the box. Height is counted in rows, exactly as `Textarea`
 * counts it, and pairs naturally with `align="block-start"` /
 * `align="block-end"` addons for a header row of actions or a footer row
 * with a character count.
 *
 * There is no `resize` prop: the group's boundary is not this element's, so a
 * native resize handle would sit visibly inside the field and drag a corner
 * that is not the corner of anything. `autoResize` is the way a composer
 * grows here.
 */
export const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(function InputGroupTextarea(
  { rows = 3, maxRows, autoResize = false, render, className, style, ...props },
  ref,
) {
  const autoSizeRef = useAutoSize(autoResize);

  const setRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      autoSizeRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, autoSizeRef],
  );

  const controlProps = {
    ref: setRef,
    render: render ?? <textarea />,
    className: clsx(styles.textarea, className),
    "data-pui": "input-group-textarea",
    "data-auto-resize": autoResize || undefined,
    rows,
    style: {
      // Row counts reach CSS as custom properties because the height they
      // describe is `calc(rows * 1lh + padding)` — a value only the
      // stylesheet knows the other terms of.
      "--pui-input-group-rows": String(rows),
      ...(maxRows != null
        ? { "--pui-input-group-max-rows": String(maxRows) }
        : null),
      // Consumer last, per the same rule that puts `className` last.
      ...style,
    } as React.CSSProperties,
    ...props,
  };

  // `Field.Control` is typed for the `<input>` it renders by default; the
  // props bag is typed as a textarea's and re-typed once, at the boundary —
  // the same trade `Textarea` makes.
  return <BaseField.Control {...(controlProps as unknown as BaseControlProps)} />;
});

/* -------------------------------------------------------------------------
 * Addon
 * ---------------------------------------------------------------------- */

export interface InputGroupAddonProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Which edge of the control the addon sits against. The `inline` pair
   * shares the control's row; the `block` pair takes a full-width row of its
   * own, above or below — the shape a textarea's toolbar or footer wants.
   *
   * Alignment is logical, so `inline-start` is the left edge in LTR and the
   * right edge in RTL with no extra work.
   * @default "inline-start"
   */
  align?: InputGroupAddonAlign;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A slot inside the field for everything that is not the value: icons,
 * prefixes and suffixes (wrap words in `<InputGroup.Text>`), buttons
 * (`<InputGroup.Button>`), a `Spinner`, a keyboard hint.
 *
 * Placement is visual, driven by CSS `order`, so DOM order is free to follow
 * focus order: put an addon that holds a button *after* the control in the
 * source and the Tab sequence reads control-then-button even while the button
 * draws at the start edge.
 *
 * Purely decorative content — icons above all — still needs
 * `aria-hidden="true"`: the group cannot know which children carry meaning.
 * Text that names or explains the control belongs to the field
 * (`Field.Label`, `Field.Description`), not in here; a sighted-only prefix
 * like a currency sign should be restated where assistive technology will
 * meet it.
 */
export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(function InputGroupAddon(
  { align = "inline-start", className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(styles.addon, className)}
      data-pui="input-group-addon"
      data-align={align}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------- */

export interface InputGroupTextProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Words inside an addon — a protocol, a unit, a domain, a count. A styled
 * `<span>`: muted, unwrappable, sized by the group. Give it an `id` and point
 * the control's `aria-describedby` at it when the text is information rather
 * than decoration.
 */
export const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  InputGroupTextProps
>(function InputGroupText({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(styles.text, className)}
      data-pui="input-group-text"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Button
 * ---------------------------------------------------------------------- */

export interface InputGroupButtonProps extends ButtonProps {}

/**
 * A `Button` preset for life inside an addon: `ghost` + `neutral` so it reads
 * as part of the field rather than a call to action, and sized by the group —
 * the CSS caps it to the field's inner height, so at `sm` the visual box can
 * dip below 24px. That is why this wrapper exists instead of a line of docs:
 * it adds `.pui-target`, which floors the *hit* area at 24×24 without
 * touching the visual one.
 *
 * It is otherwise exactly `Button` — every prop passes through, so
 * `variant="solid"` turns the end addon into a primary action when the design
 * calls for one. `iconOnly` still needs its `aria-label`.
 */
export const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(function InputGroupButton(
  { variant = "ghost", tone = "neutral", size = "sm", className, ...props },
  ref,
) {
  // Composed pretty-ui component: `Button` tags its own root with
  // `data-pui="button"`, and this wrapper deliberately does not rename it —
  // scope with `[data-pui="input-group-addon"] [data-pui="button"]`.
  return (
    <Button
      ref={ref}
      variant={variant}
      tone={tone}
      size={size}
      className={clsx("pui-target", className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A single field boundary around a text control and its trimmings.
 *
 * ```tsx
 * <InputGroup.Root>
 *   <InputGroup.Addon>
 *     <SearchIcon aria-hidden="true" />
 *   </InputGroup.Addon>
 *   <InputGroup.Input placeholder="Search…" />
 *   <InputGroup.Addon align="inline-end">
 *     <InputGroup.Button iconOnly aria-label="Clear">
 *       <XIcon aria-hidden="true" />
 *     </InputGroup.Button>
 *   </InputGroup.Addon>
 * </InputGroup.Root>
 * ```
 */
export const InputGroup = {
  Root: InputGroupRoot,
  Input: InputGroupInput,
  Textarea: InputGroupTextarea,
  Addon: InputGroupAddon,
  Text: InputGroupText,
  Button: InputGroupButton,
};
