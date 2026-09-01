"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
import styles from "./Input.module.css";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "outline" | "soft" | "ghost";

type BaseInputProps = React.ComponentPropsWithoutRef<typeof BaseInput>;

export interface InputProps
  extends Omit<BaseInputProps, "className" | "size"> {
  /**
   * Size of the control. Height, inline padding and font size all move
   * together, and the actual numbers follow the ambient `data-forte-density`
   * setting. Matches `Select.Trigger`'s scale, so an input and a select on the
   * same row line up.
   *
   * This shadows the native `size` attribute (which sets a width in
   * characters). Reach for `fullWidth`, a CSS `inline-size`, or
   * `render={<input size={10} />}` if you need that instead.
   * @default "md"
   */
  size?: InputSize;
  /**
   * How much visual weight the control carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance.
   * @default "outline"
   */
  variant?: InputVariant;
  /**
   * Stretch the input to fill the width of its container. Only needed outside
   * a `Field.Root` — a field is a flex column, so an input inside one already
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
 * A text input built on Base UI's `Input` primitive.
 *
 * Base UI's `Input` *is* `Field.Control` — the same component under a friendlier
 * name — so this needs no wiring to participate in a `Field`: put one inside a
 * `Field.Root` and it picks up the label, the description, the error message,
 * `name`, `disabled` and the validity attributes automatically. Outside a field
 * it is an ordinary `<input>`, so `type`, `placeholder`, `required`, `pattern`
 * and the rest all pass straight through.
 *
 * ```tsx
 * <Field.Root name="email">
 *   <Field.Label>Email</Field.Label>
 *   <Input type="email" required placeholder="you@example.com" />
 *   <Field.Error />
 * </Field.Root>
 * ```
 *
 * For a multi-line control reach for `Textarea`, which is the same
 * `Field.Control` rendered as a `<textarea>` and adds the things a paragraph of
 * text needs — row-based sizing, a growth ceiling, and `autoResize`.
 *
 * State is exposed on `data-*` (`data-disabled`, `data-invalid`, `data-valid`,
 * `data-dirty`, `data-touched`, `data-filled`, `data-focused`) and every visual
 * decision is a `--forte-input-*` custom property, so it can be re-skinned from
 * plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[invalid]:...`) without wrapping.
 *
 * @summary The single-line text field; wrap in Field for label and error
 *   wiring, in InputGroup for inner icons and buttons; for numbers use
 *   NumberField.
 * @category Forms
 */
export const Input = React.forwardRef<HTMLElement, InputProps>(
  function Input(
    { size = "md", variant = "outline", fullWidth = false, className, ...props },
    ref,
  ) {
    return (
      <BaseInput
        ref={ref}
        // No `forte-target` here: the SC 2.5.8 floor is about pointer targets
        // that are smaller than 24px, and even a `compact` `sm` input is
        // 24px tall and at least as wide as its text.
        className={clsx(styles.root, "forte-focus-ring", className)}
        data-forte="input"
        data-size={size}
        data-variant={variant}
        data-full-width={fullWidth || undefined}
        {...props}
      />
    );
  },
);
