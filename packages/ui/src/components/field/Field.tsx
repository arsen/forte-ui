"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import styles from "./Field.module.css";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseField.Root>;

export interface FieldRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups one control with its label, description and error message, and owns
 * the validation state they all read. Renders a `<div>` laid out as a column.
 *
 * The control is any Base UI form component — `Input`, `Checkbox`, `Switch`,
 * `Select` — and none of them need wiring: the field supplies the id the label
 * points at, the `aria-describedby` linking description and error, and the
 * `name` used on submit. Give `name` to the field rather than to the control,
 * so `<Form onFormSubmit>` and server-returned `errors` can find it.
 *
 * The column stretches its children, which is why an `Input` inside a field is
 * full width without `fullWidth`.
 */
export const FieldRoot = React.forwardRef<HTMLDivElement, FieldRootProps>(
  function FieldRoot({ className, ...props }, ref) {
    return (
      <BaseField.Root
        ref={ref}
        className={clsx(styles.root, className)}
        data-pui="field"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseField.Label>;

export interface FieldLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Whether the rendered element is a native `<label>`.
   *
   * Leave it `true` for `Input`, `Checkbox` and `Switch`. Set it to `false`
   * for a control that is a `<button>` — `Select.Trigger` is the one in this
   * library — where native label behaviour is actively wrong: the button would
   * pick up `:hover` from the label, and clicking the label would fire a click
   * on the trigger and open the popup. With `false` the association is made
   * with `aria-labelledby` instead, and the element rendered defaults to a
   * `<div>` so the pair stays consistent (Base UI logs an error in development
   * if a `<label>` is rendered with `nativeLabel={false}`, or vice versa).
   * @default true
   */
  nativeLabel?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The field's visible label, associated with the control automatically.
 * Renders a `<label>` — or a `<div>` when `nativeLabel` is `false`.
 *
 * Both labelling shapes work, and the difference is only where the control
 * sits:
 *
 * ```tsx
 * // Sibling: the label points at the control with htmlFor.
 * <Field.Label>Email</Field.Label>
 * <Input type="email" />
 *
 * // Wrapping: the label contains the control. Preferred for a Checkbox or a
 * // Switch, which have no text of their own.
 * <Field.Label><Checkbox /> Email me about releases</Field.Label>
 * ```
 *
 * A wrapping label lays itself out as a row and takes a `pointer` cursor,
 * because clicking it toggles the control; a sibling label is chrome and keeps
 * the default arrow.
 */
export const FieldLabel = React.forwardRef<HTMLElement, FieldLabelProps>(
  function FieldLabel({ nativeLabel = true, render, className, ...props }, ref) {
    return (
      <BaseField.Label
        ref={ref}
        nativeLabel={nativeLabel}
        // Base UI keeps rendering a <label> when only `nativeLabel={false}` is
        // passed, and then errors in development because the element and the
        // flag disagree. Defaulting the element to a <div> means the one prop
        // says the whole thing.
        render={render ?? (nativeLabel ? undefined : <div />)}
        className={clsx(styles.label, className)}
        data-pui="field-label"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Description
 * ---------------------------------------------------------------------- */

type BaseDescriptionProps = React.ComponentPropsWithoutRef<
  typeof BaseField.Description
>;

export interface FieldDescriptionProps
  extends Omit<BaseDescriptionProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Supporting text for the field. Renders a `<p>` wired into the control's
 * `aria-describedby`, so it is announced with the control rather than being
 * stray text next to it.
 *
 * Put the format hint here, not in the placeholder — a placeholder disappears
 * the moment the user starts typing, which is exactly when the hint is needed.
 */
export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(function FieldDescription({ className, ...props }, ref) {
  return (
    <BaseField.Description
      ref={ref}
      className={clsx(styles.description, className)}
      data-pui="field-description"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Error
 * ---------------------------------------------------------------------- */

type BaseErrorProps = React.ComponentPropsWithoutRef<typeof BaseField.Error>;

export interface FieldErrorProps extends Omit<BaseErrorProps, "className"> {
  /**
   * Which failure to render for. Omit it to show whatever message the field
   * currently has — the browser's own text for a native constraint, the string
   * returned by `validate`, or the entry `<Form errors>` holds for this
   * field's `name`. Pass a `ValidityState` key (`"valueMissing"`,
   * `"typeMismatch"`, `"patternMismatch"`, …) to render only for that one
   * failure, which is how you replace a browser message with your own wording.
   * Pass `true` to always render, when an external form library owns
   * visibility.
   */
  match?: BaseErrorProps["match"];
  /**
   * The message. Omit it and the field supplies the text itself; several
   * failures at once arrive as a `<ul>`.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The validation message. Renders a `<div>`, and only while the field is
 * actually failing — it is unmounted otherwise, so nothing reserves space for
 * it.
 *
 * Base UI keeps the outgoing element mounted until its exit transition
 * finishes, so the message fades out with its own text rather than snapping to
 * the next one.
 */
export const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  function FieldError({ className, ...props }, ref) {
    return (
      <BaseField.Error
        ref={ref}
        className={clsx(styles.error, className)}
        data-pui="field-error"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

type BaseItemProps = React.ComponentPropsWithoutRef<typeof BaseField.Item>;

export interface FieldItemProps extends Omit<BaseItemProps, "className"> {
  /**
   * Whether this one item ignores user interaction. `disabled` on the
   * surrounding `Field.Root` takes precedence.
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
 * One row inside a `CheckboxGroup` or radio group: a control, its own label,
 * and optionally its own description. Renders a `<div>`.
 *
 * A `Field.Root` names the group as a whole; a `Field.Item` gives each member
 * a label of its own without opening a second field.
 */
export const FieldItem = React.forwardRef<HTMLDivElement, FieldItemProps>(
  function FieldItem({ className, ...props }, ref) {
    return (
      <BaseField.Item
        ref={ref}
        className={clsx(styles.item, className)}
        data-pui="field-item"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A field built on Base UI's `Field` primitives.
 *
 * ```tsx
 * <Field.Root name="email" validationMode="onBlur">
 *   <Field.Label>Email</Field.Label>
 *   <Input type="email" required />
 *   <Field.Description>We only use this for receipts.</Field.Description>
 *   <Field.Error match="valueMissing">An email address is required.</Field.Error>
 *   <Field.Error match="typeMismatch">That does not look like an email address.</Field.Error>
 * </Field.Root>
 * ```
 *
 * There is no `Field.Control` here on purpose: Base UI's `Input` *is*
 * `Field.Control`, so `<Input>` is the styled control, and `Checkbox`,
 * `Switch` and `Select` slot in the same way with no extra part.
 *
 * `Field.Validity` is re-exported from Base UI unchanged — it renders no DOM
 * of its own, it hands the raw `ValidityState` to a render function.
 */
export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  Item: FieldItem,
  Validity: BaseField.Validity,
};
