"use client";

import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import styles from "./Radio.module.css";

export type RadioSize = "sm" | "md" | "lg";
export type RadioTone = "primary" | "secondary" | "danger" | "neutral";
export type RadioGroupOrientation = "vertical" | "horizontal";

/* -------------------------------------------------------------------------
 * Radio
 * ---------------------------------------------------------------------- */

export interface RadioProps<Value = unknown>
  extends Omit<BaseRadio.Root.Props<Value>, "className" | "children"> {
  /**
   * The value this radio submits when it is the one selected. Matched against
   * the group's `value`, so it has to be unique within the group. Required —
   * a radio with no value cannot be selected.
   */
  value: Value;
  /**
   * Size of the painted circle. The dot is derived from it rather than fixed,
   * so it keeps its proportion at every size and when a consumer overrides
   * `--pui-radio-size` to something off the scale.
   * @default "md"
   */
  size?: RadioSize;
  /**
   * Which semantic colour set the selected fill draws from. Inside a
   * `Field.Root` an invalid field overrides this with the danger palette, so
   * a validation error always reads as an error.
   * @default "primary"
   */
  tone?: RadioTone;
  /**
   * Set to `true` when `render` replaces the root with a real `<button>`.
   * The root is a `<span>` by default so that an enclosing `<label>` stays
   * valid HTML; for the sibling-label pattern (`<label htmlFor>` + `id`) pass
   * `nativeButton render={<button />}` instead. With `nativeButton`, `id`
   * lands on the root element rather than on the hidden input.
   * @default false
   */
  nativeButton?: boolean;
  /**
   * Additional class name(s) for the indicator — the dot inside the circle.
   * Applied after the internal styles.
   */
  indicatorClassName?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the root element. Declared as a prop rather than through
   * `forwardRef` because the component is generic — a `forwardRef` wrapper
   * would erase `Value` and with it the inference on `value`.
   */
  ref?: React.Ref<HTMLElement>;
}

/**
 * One option in a `RadioGroup`, built on Base UI's unstyled `Radio` primitive.
 *
 * The root renders a `<span>` plus a hidden `<input>` beside it, so it carries
 * no accessible name of its own — wrap it in a `<label>`, pair it with a
 * `<label htmlFor>` (see `nativeButton`), or put it inside a `Field.Item`.
 *
 * A radio only means anything inside a `RadioGroup`: the group owns the value,
 * and it is what makes the set one tab stop with the arrow keys moving between
 * options. A lone `<Radio />` renders, but nothing can ever select it.
 *
 * State is exposed on `data-*` attributes (`data-checked`, `data-unchecked`,
 * `data-disabled`, `data-readonly`, and the `Field` validity attributes) on
 * both the root and the indicator, and every visual decision is a
 * `--pui-radio-*` custom property, so it can be re-skinned from plain CSS or
 * targeted with Tailwind arbitrary variants (`data-[checked]:...`) without
 * wrapping.
 */
export function Radio<Value = unknown>({
  size = "md",
  tone = "primary",
  indicatorClassName,
  className,
  ...props
}: RadioProps<Value>): React.JSX.Element {
  return (
    <BaseRadio.Root
      // `.pui-target` grows the hit area to the 24px SC 2.5.8 floor with an
      // absolutely positioned pseudo-element, leaving the painted circle at
      // its designed size. The root is not inside a clipping container, so the
      // focus ring stays outset.
      className={clsx(styles.root, "pui-target", "pui-focus-ring", className)}
      data-pui="radio"
      data-size={size}
      data-tone={tone}
      {...props}
    >
      <BaseRadio.Indicator
        // Without `keepMounted` Base UI removes the dot the moment another
        // option is picked, and the exit transition has no element left to run
        // on — the dot would vanish instead of shrinking away. Kept mounted, it
        // is hidden by scale and opacity, which also means the enter transition
        // starts from a rendered box.
        keepMounted
        className={clsx(styles.indicator, indicatorClassName)}
        data-pui="radio-indicator"
      />
    </BaseRadio.Root>
  );
}

/* -------------------------------------------------------------------------
 * RadioGroup
 * ---------------------------------------------------------------------- */

export interface RadioGroupProps<Value = unknown>
  extends Omit<BaseRadioGroup.Props<Value>, "className"> {
  /**
   * Direction the options are laid out in. Horizontal groups wrap.
   *
   * Layout only — it does not change the keyboard model. Base UI drives the
   * group with all four arrow keys whichever way it is laid out, so a
   * horizontal group still answers to Up and Down.
   * @default "vertical"
   */
  orientation?: RadioGroupOrientation;
  /**
   * The selected value. Pairs with `onValueChange` for a controlled group;
   * use `defaultValue` for an uncontrolled one.
   * @default undefined
   */
  value?: Value;
  /**
   * The value selected on mount when uncontrolled. Leave it out for a group
   * that starts with nothing selected — but prefer a default where one is
   * defensible, because an empty group has no focusable option to arrow into
   * until something is picked.
   * @default undefined
   */
  defaultValue?: Value;
  /**
   * Disables every radio in the group.
   * @default false
   */
  disabled?: boolean;
  /**
   * Shows the current value but refuses to change it. Unlike `disabled` the
   * options stay focusable and announce `aria-readonly`.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Requires a selection before the surrounding form will submit.
   * @default false
   */
  required?: boolean;
  /**
   * Identifies the group in form submission. Inside a `Field.Root` the field's
   * `name` is used instead, so this is only needed outside one.
   */
  name?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the group element. Declared as a prop rather than through
   * `forwardRef` because the component is generic — a `forwardRef` wrapper
   * would erase `Value` and with it the typing of `onValueChange`.
   */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Shared state for a series of `Radio`s, built on Base UI's `RadioGroup`
 * primitive. Renders a `<div role="radiogroup">`.
 *
 * Unlike `CheckboxGroup`, this is a keyboard mode as well as a state
 * container: the whole group is a single tab stop, and the arrow keys move
 * between options — selecting as they go, which is the native radio
 * behaviour and the reason a radio group must never be used for choices that
 * trigger an expensive side effect on selection.
 *
 * The group has no implicit accessible name — give it `aria-labelledby`
 * pointing at a heading, name it with a `Field.Label nativeLabel={false}`, or
 * render it inside a `Fieldset.Root` with a `Fieldset.Legend`.
 */
export function RadioGroup<Value = unknown>({
  orientation = "vertical",
  className,
  ...props
}: RadioGroupProps<Value>): React.JSX.Element {
  return (
    <BaseRadioGroup
      className={clsx(styles.group, className)}
      data-pui="radio-group"
      data-orientation={orientation}
      {...props}
    />
  );
}
