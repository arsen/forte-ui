"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { clsx } from "clsx";
import styles from "./Checkbox.module.css";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxTone = "primary" | "secondary" | "danger" | "neutral";
export type CheckboxGroupOrientation = "vertical" | "horizontal";

type BaseCheckboxRootProps = React.ComponentPropsWithoutRef<
  typeof BaseCheckbox.Root
>;
type BaseCheckboxGroupProps = React.ComponentPropsWithoutRef<
  typeof BaseCheckboxGroup
>;

export interface CheckboxProps
  extends Omit<BaseCheckboxRootProps, "className" | "children"> {
  /**
   * Size of the box. The tick scales with it, so the mark keeps its optical
   * weight at every size.
   * @default "md"
   */
  size?: CheckboxSize;
  /**
   * Which semantic color set the checked fill draws from. Inside a
   * `Field.Root` an invalid field overrides this with the danger palette, so
   * a validation error always reads as an error.
   * @default "primary"
   */
  tone?: CheckboxTone;
  /**
   * Whether the checkbox is currently ticked. Pairs with `onCheckedChange` for
   * a controlled checkbox; use `defaultChecked` for an uncontrolled one.
   * @default undefined
   */
  checked?: boolean;
  /**
   * Whether the checkbox starts ticked when uncontrolled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Mixed state: neither ticked nor unticked. Renders a dash instead of a
   * tick and sets `data-indeterminate` on both the root and the indicator.
   * Independent of `checked` — a checkbox that is indeterminate submits
   * whatever `checked` says it submits.
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Marks this checkbox as the one that controls every other checkbox in the
   * group. Only works inside a `CheckboxGroup` that has been given `value`
   * and `allValues`; outside one it does nothing at all. The group drives the
   * indeterminate state when only some children are ticked.
   * @default false
   */
  parent?: boolean;
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
   * Additional class name(s) for the indicator — the element that holds the
   * tick. Applied after the internal styles.
   */
  indicatorClassName?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A checkbox built on Base UI's unstyled `Checkbox` primitive.
 *
 * The root renders a `<span>` plus a hidden `<input>` beside it, so it carries
 * no accessible name of its own — wrap it in a `<label>`, pair it with a
 * `<label htmlFor>` (see `nativeButton`), or put it inside a `Field.Root`.
 *
 * State is exposed on `data-*` attributes (`data-checked`, `data-unchecked`,
 * `data-indeterminate`, `data-disabled`, `data-readonly`, and the `Field`
 * validity attributes) on both the root and the indicator, and every visual
 * decision is a `--forte-checkbox-*` custom property, so it can be re-skinned
 * from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[indeterminate]:...`) without wrapping.
 *
 * @summary An independent yes/no option with an optional mixed state; for
 *   one-of-many use RadioGroup, for a setting that applies immediately use
 *   Switch.
 * @category Forms
 */
export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  function Checkbox(
    {
      size = "md",
      tone = "primary",
      indicatorClassName,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <BaseCheckbox.Root
        ref={ref}
        // `.forte-target` grows the hit area to the 24px SC 2.5.8 floor with an
        // absolutely positioned pseudo-element, leaving the painted box at its
        // designed size. The root is not inside a clipping container, so the
        // focus ring stays outset.
        className={clsx(styles.root, "forte-target", "forte-focus-ring", className)}
        data-forte="checkbox"
        data-size={size}
        data-tone={tone}
        {...props}
      >
        <BaseCheckbox.Indicator
          // Without `keepMounted` Base UI removes the indicator as soon as the
          // checkbox is unticked, and the exit transition has no element left
          // to run on — the mark would vanish instead of un-drawing. Kept
          // mounted, it is hidden by opacity, which also means the enter
          // transition starts from a rendered box.
          keepMounted
          className={clsx(styles.indicator, indicatorClassName)}
          data-forte="checkbox-indicator"
        >
          {/* Decorative: the state is already carried by the hidden input's
            * `checked` and by `aria-checked` on the root. */}
          <svg
            className={styles.svg}
            data-forte="checkbox-svg"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            {/* `pathLength={1}` renormalizes the path so `stroke-dasharray: 1`
              * covers exactly the whole stroke, whatever the geometry. That is
              * what lets the draw-in be expressed as `stroke-dashoffset: 1 → 0`
              * in the stylesheet without a magic length constant, and what
              * keeps the two marks interchangeable. */}
            <path
              className={clsx(styles.mark, styles.check)}
              d="m3.5 8.5 3 3 6-7"
              pathLength={1}
            />
            <path
              className={clsx(styles.mark, styles.dash)}
              d="M3.75 8h8.5"
              pathLength={1}
            />
          </svg>
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );
  },
);

export interface CheckboxGroupProps
  extends Omit<BaseCheckboxGroupProps, "className"> {
  /**
   * Direction the checkboxes are laid out in. Horizontal groups wrap.
   * @default "vertical"
   */
  orientation?: CheckboxGroupOrientation;
  /**
   * Values of the checkboxes that are ticked. Pairs with `onValueChange` for
   * a controlled group; use `defaultValue` for an uncontrolled one. Required
   * if any child uses the `parent` prop.
   * @default undefined
   */
  value?: string[];
  /**
   * Values of the checkboxes that start ticked when uncontrolled.
   * @default undefined
   */
  defaultValue?: string[];
  /**
   * Values of *all* checkboxes in the group, ticked or not. Needed only for a
   * parent checkbox: it is how the group knows the difference between "some"
   * and "all" and therefore when the parent is indeterminate.
   * @default undefined
   */
  allValues?: string[];
  /**
   * Disables every checkbox in the group.
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Shared state for a series of `Checkbox`es, built on Base UI's
 * `CheckboxGroup` primitive.
 *
 * The group has no implicit accessible name — give it `aria-labelledby`
 * pointing at a heading, or render it as a `Fieldset.Root` with a
 * `Fieldset.Legend`.
 *
 * @summary One array value shared by several Checkboxes, with an optional
 *   parent checkbox that summarises and toggles the lot.
 * @category Forms
 */
export const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>(function CheckboxGroup({ orientation = "vertical", className, ...props }, ref) {
  return (
    <BaseCheckboxGroup
      ref={ref}
      // Base UI leaves the element role-less. `role="group"` is what makes an
      // `aria-labelledby` on this element actually announce as a group label;
      // it sits before the spread so a consumer (or `Fieldset.Root`, whose
      // <fieldset> is already a group) can override it.
      role="group"
      className={clsx(styles.group, className)}
      data-forte="checkbox-group"
      data-orientation={orientation}
      {...props}
    />
  );
});
