"use client";

import * as React from "react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { clsx } from "clsx";
import styles from "./Fieldset.module.css";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseFieldset.Root>;

export interface FieldsetRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Disables every control inside the fieldset. This is the native
   * `<fieldset disabled>` behaviour, so it reaches controls the library knows
   * nothing about too.
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
 * Groups related fields under one heading. Renders a `<fieldset>` laid out as
 * a column, with the browser's border, padding and margins removed.
 *
 * Use it for a set of fields that belong together — a billing address, a group
 * of checkboxes — not for every field. A `Field.Root` already names a single
 * control; wrapping one in a fieldset gives it two names.
 */
export const FieldsetRoot = React.forwardRef<HTMLFieldSetElement, FieldsetRootProps>(
  function FieldsetRoot({ className, ...props }, ref) {
    return (
      <BaseFieldset.Root
        ref={ref}
        className={clsx(styles.root, className)}
        data-pui="fieldset"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Legend
 * ---------------------------------------------------------------------- */

type BaseLegendProps = React.ComponentPropsWithoutRef<
  typeof BaseFieldset.Legend
>;

export interface FieldsetLegendProps extends Omit<BaseLegendProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The heading that names the fieldset. Renders a `<div>`, not a `<legend>` —
 * Base UI associates it with `aria-labelledby` instead, which announces the
 * same way and lays out like ordinary text.
 *
 * That matters: a real `<legend>` sits *in* the fieldset's border, cannot be
 * positioned like a normal block, and drags along UA styles that differ
 * between browsers.
 */
export const FieldsetLegend = React.forwardRef<
  HTMLDivElement,
  FieldsetLegendProps
>(function FieldsetLegend({ className, ...props }, ref) {
  return (
    <BaseFieldset.Legend
      ref={ref}
      className={clsx(styles.legend, className)}
      data-pui="fieldset-legend"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A fieldset built on Base UI's `Fieldset` primitives.
 *
 * ```tsx
 * <Fieldset.Root>
 *   <Fieldset.Legend>Shipping address</Fieldset.Legend>
 *   <Field.Root name="street">…</Field.Root>
 *   <Field.Root name="city">…</Field.Root>
 * </Fieldset.Root>
 * ```
 */
export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
};
