"use client";

import * as React from "react";
import {
  Form as BaseForm,
  type FormProps as BaseFormProps,
} from "@base-ui/react/form";
import { clsx } from "clsx";
import styles from "./Form.module.css";

export type FormValidationMode = "onSubmit" | "onBlur" | "onChange";

export interface FormProps<
  FormValues extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<BaseFormProps<FormValues>, "className"> {
  /**
   * When the fields inside are validated. `validationMode` on an individual
   * `Field.Root` takes precedence over this.
   *
   * - `onSubmit` — validate on submit, then re-validate on change. The default,
   *   and the right one for most forms: it does not tell someone their email
   *   is invalid while they are still on the third character of it.
   * - `onBlur` — validate a field when it loses focus.
   * - `onChange` — validate on every keystroke. Pair it with
   *   `validationDebounceTime` on the field if `validate` is expensive.
   * @default "onSubmit"
   */
  validationMode?: FormValidationMode;
  /**
   * Errors that came from somewhere other than the browser — a server
   * response, a form action, a schema parse. Keys are the `name` of a
   * `Field.Root`; values are a message or an array of messages, which the
   * matching `Field.Error` then renders.
   */
  errors?: BaseFormProps<FormValues>["errors"];
  /**
   * Called on submit once every field passes validation, with the form's
   * values collected by `name`. Base UI calls `preventDefault()` on the native
   * event for you, so this replaces `onSubmit` rather than sitting beside it.
   */
  onFormSubmit?: BaseFormProps<FormValues>["onFormSubmit"];
  /**
   * A ref to imperative actions. `validate()` runs every field; pass a field
   * name to run just one.
   */
  actionsRef?: BaseFormProps<FormValues>["actionsRef"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the underlying `<form>` element. Declared explicitly rather than
   * through `forwardRef` because the component is generic — a `forwardRef`
   * wrapper would erase `FormValues` and with it the typing of
   * `onFormSubmit`.
   */
  ref?: React.Ref<HTMLFormElement>;
}

/**
 * A `<form>` that collects the validation state of every `Field` inside it,
 * built on Base UI's `Form` primitive.
 *
 * ```tsx
 * <Form
 *   onFormSubmit={async (values) => {
 *     const result = await save(values);
 *     if (!result.ok) setErrors(result.errors); // keys match Field.Root name
 *   }}
 *   errors={errors}
 * >
 *   <Field.Root name="email">…</Field.Root>
 *   <Button type="submit">Save</Button>
 * </Form>
 * ```
 *
 * Two things it does that a bare `<form>` does not: it blocks submission while
 * any field is invalid and moves focus to the first one that failed, and it
 * routes the `errors` object back to the right `Field.Error` by `name` — which
 * is why the `name` belongs on `Field.Root` rather than on the control.
 *
 * It lays out as a column with `--forte-form-gap` between children, since a form
 * is nearly always a stack of fields. Set `display` through `className` for
 * anything else; the gap is a knob rather than a hardcoded rule for exactly
 * that reason.
 */
export function Form<
  FormValues extends Record<string, unknown> = Record<string, unknown>,
>({ className, ...props }: FormProps<FormValues>): React.JSX.Element {
  return <BaseForm className={clsx(styles.root, className)} data-forte="form" {...props} />;
}
