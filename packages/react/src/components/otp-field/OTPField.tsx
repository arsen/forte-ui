"use client";

import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { clsx } from "clsx";
import { Separator, type SeparatorProps } from "../separator";
import styles from "./OTPField.module.css";

export type OTPFieldSize = "sm" | "md" | "lg";
export type OTPFieldVariant = "outline" | "soft" | "underline";

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseOTPField.Root>;
type BaseInputProps = React.ComponentPropsWithoutRef<typeof BaseOTPField.Input>;

/**
 * `numeric` (the default), `alpha`, `alphanumeric`, or `none` to accept
 * anything. Derived from Base UI rather than restated, so a value it adds
 * arrives here without an edit.
 */
export type OTPFieldValidationType = NonNullable<BaseRootProps["validationType"]>;

/**
 * `size` and `variant` are chosen on `OTPField.Root`, and the slots paint
 * themselves from `--forte-otp-field-*` properties the root declares — so
 * inheritance alone is enough to make them *look* right, and this context
 * exists for the other half of the contract: every slot republishes them as
 * `data-size` / `data-variant` so a consumer can write `data-[size=lg]:…` on
 * one slot without wrapping the component. Passing them through context rather
 * than as per-part props is what makes a mismatched pair (an `lg` root with an
 * `sm` slot) unexpressible.
 */
const OTPFieldContext = React.createContext<{
  size: OTPFieldSize;
  variant: OTPFieldVariant;
}>({ size: "md", variant: "outline" });

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface OTPFieldRootProps
  extends Omit<
    BaseRootProps,
    "className" | "children" | "length" | "mask" | "validationType" | "autoSubmit"
  > {
  /**
   * How many characters the code has, and therefore how many slots the field
   * renders. Required: the root clamps the value, decides when it is complete
   * and writes the hidden input's `pattern` from it, all of which have to be
   * right on the server render, before a single slot has mounted.
   *
   * When you pass your own children, the number of `<OTPField.Input>`s has to
   * match — Base UI warns in development when it does not.
   */
  length: BaseRootProps["length"];
  /**
   * Replace each character with a dot, the way a password field does.
   *
   * Off by default, and worth leaving off. A code that is read off a phone and
   * typed once has nothing to shoulder-surf that the SMS did not already
   * expose, and hiding it takes away the user's only way to check what they
   * typed.
   * @default false
   */
  mask?: BaseRootProps["mask"];
  /**
   * Which characters the field accepts. Anything else is dropped as it is
   * typed or pasted and reported through `onValueInvalid`, so a code copied
   * with a stray space or a dash still lands correctly.
   *
   * It also picks the virtual keyboard: `numeric` asks for the digit pad,
   * which is most of why a phone is bearable to type a code on. Override
   * `inputMode` if you need a different one.
   * @default "numeric"
   */
  validationType?: OTPFieldValidationType;
  /**
   * Submit the owning form as soon as the last slot is filled.
   *
   * The reason to want it is that the code is the whole form — there is
   * nothing left to review, and a Verify button is a step whose only content
   * is "yes, I meant the six digits I just typed". `onValueComplete` runs
   * immediately before the submit, so you can still stop it.
   * @default false
   */
  autoSubmit?: BaseRootProps["autoSubmit"];
  /**
   * Size of the slots. Sets their square side and the character's font size
   * together, and the side comes from the same `--forte-control-*` tokens
   * `Input` and `Select.Trigger` read — so a code field lines up with the rest
   * of a form at every `data-forte-density` setting.
   * @default "md"
   */
  size?: OTPFieldSize;
  /**
   * How much visual weight each slot carries. `outline` reads as a form
   * control, `soft` as a filled field, `underline` as a row of rules.
   *
   * There is no `ghost`, unlike `Input`: a slot with no boundary leaves
   * nothing to count, and how many characters the code has is the one thing
   * the field has to say before anything is typed.
   * @default "outline"
   */
  variant?: OTPFieldVariant;
  /**
   * The slots, and anything between them. Leave it out and the root renders
   * `length` plain `<OTPField.Input>`s for you — the common case, and the one
   * where Base UI otherwise warns at runtime if the count and `length`
   * disagree.
   *
   * Pass children when the row is not uniform: groups split by an
   * `<OTPField.Separator />`, or a slot with its own `aria-label`. The count
   * still has to equal `length`.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups every slot of a one-time-code field and owns the value. Renders a
 * `<div role="group">` laid out as a wrapping flex row, plus a visually hidden
 * `<input>` beside it that carries the whole code into form submission and
 * constraint validation.
 *
 * ```tsx
 * <Field.Root name="code">
 *   <Field.Label>Verification code</Field.Label>
 *   <OTPField.Root length={6} />
 * </Field.Root>
 * ```
 *
 * The value is one string, not one per slot: `value`, `defaultValue`,
 * `onValueChange` and `onValueComplete` all speak in `"123456"`. Typing
 * advances, Backspace retreats, and a paste fills from the slot it lands on —
 * Base UI owns all of that, including clamping to `length` and filtering by
 * `validationType`.
 *
 * `autoComplete` defaults to `"one-time-code"`, which is what lets iOS and
 * Android offer a code straight from the SMS that just arrived. Do not
 * override it without a reason.
 *
 * State is exposed on `data-*` (`data-complete`, `data-filled`,
 * `data-disabled`, `data-readonly`, plus `data-invalid`, `data-valid`,
 * `data-dirty`, `data-touched` and `data-focused` inside a `Field.Root`) and
 * every visual decision is a `--forte-otp-field-*` custom property, so it can be
 * re-skinned from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[complete]:...`) without wrapping.
 */
export const OTPFieldRoot = React.forwardRef<HTMLDivElement, OTPFieldRootProps>(
  function OTPFieldRoot(
    { size = "md", variant = "outline", className, children, length, ...props },
    ref,
  ) {
    const context = React.useMemo(() => ({ size, variant }), [size, variant]);

    return (
      <OTPFieldContext.Provider value={context}>
        <BaseOTPField.Root
          ref={ref}
          length={length}
          className={clsx(styles.root, className)}
          data-forte="otp-field"
          data-size={size}
          data-variant={variant}
          {...props}
        >
          {/* `??`, not `||`: an empty array is a deliberate "render nothing"
            * and must not fall back to the default row. `Array.from` is fed a
            * length-only object rather than a spread, so a `length` of 6
            * allocates six slots and nothing else. */}
          {children ??
            Array.from({ length }, (_unused, index) => <OTPFieldInput key={index} />)}
        </BaseOTPField.Root>
      </OTPFieldContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

export interface OTPFieldInputProps extends Omit<BaseInputProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One character of the code. Renders an `<input>`.
 *
 * Slots take their index from the order they are rendered in, so there is no
 * `index` prop to keep in step — but the number of them must equal the root's
 * `length`, and Base UI warns in development when it does not. Render them
 * yourself only when the row needs something a bare list cannot express;
 * otherwise let `OTPField.Root` produce them.
 *
 * Exactly one slot is in the tab order at a time, which is what makes the
 * whole field a single tab stop rather than six. Focusing one selects its
 * character, so the next keypress replaces it instead of being rejected by a
 * full slot.
 *
 * `aria-label` on the FIRST slot is ignored — Base UI warns about it — because
 * the name belongs to the group, not to a character of it. Name the field with
 * a `<Field.Label>` or a `<label>` instead.
 */
export const OTPFieldInput = React.forwardRef<HTMLInputElement, OTPFieldInputProps>(
  function OTPFieldInput({ className, ...props }, ref) {
    const { size, variant } = React.useContext(OTPFieldContext);

    return (
      <BaseOTPField.Input
        ref={ref}
        // No `forte-target`: a slot is square on the `--forte-control-h-*` scale,
        // and the smallest combination the library can produce — `sm` at
        // `compact` density — is 24×24, exactly the SC 2.5.8 floor.
        className={clsx(styles.input, "forte-focus-ring", className)}
        data-forte="otp-field-input"
        data-size={size}
        data-variant={variant}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Separator
 * ---------------------------------------------------------------------- */

export interface OTPFieldSeparatorProps extends SeparatorProps {
  /**
   * Drops `role="separator"`, leaving the dash visible but absent from the
   * accessibility tree.
   *
   * Defaults to `true` here, which is the opposite of a standalone
   * `Separator`: the slots either side of it are one value and one control,
   * so the grouping is a reading aid for the eye only. Announcing a boundary
   * in the middle of a six-digit code describes the layout, not the field.
   * @default true
   */
  decorative?: boolean;
}

/**
 * The dash between two groups of slots — the `123 – 456` shape a six-digit
 * code is usually printed in. Renders the library's `Separator`, so it carries
 * `data-forte="separator"` rather than a marker of its own; scope to it with
 * `[data-forte="otp-field"] [data-forte="separator"]`.
 *
 * It is a **horizontal** rule sized to `--forte-otp-field-separator-length`,
 * not a vertical bar, and it counts against nothing: `length` is the number of
 * `Input`s, so a separator can go anywhere between them.
 *
 * ```tsx
 * <OTPField.Root length={6}>
 *   <OTPField.Input />
 *   <OTPField.Input />
 *   <OTPField.Input />
 *   <OTPField.Separator />
 *   <OTPField.Input />
 *   <OTPField.Input />
 *   <OTPField.Input />
 * </OTPField.Root>
 * ```
 */
export const OTPFieldSeparator = React.forwardRef<HTMLDivElement, OTPFieldSeparatorProps>(
  function OTPFieldSeparator({ className, decorative = true, ...props }, ref) {
    return (
      <Separator
        ref={ref}
        decorative={decorative}
        className={clsx(styles.separator, className)}
        {...props}
      />
    );
  },
);

/**
 * A one-time-code field built on Base UI's `OTPField` primitive.
 *
 * ```tsx
 * <OTPField.Root
 *   length={6}
 *   onValueComplete={(code) => verify(code)}
 * />
 * ```
 *
 * Motion — there is none, and that is a decision rather than an omission. The
 * only thing that changes as the user types is which slot holds a character,
 * and a slot that grew, bounced or flashed on fill would do it up to six times
 * in the two seconds it takes to enter a code, next to the caret the user is
 * watching. What does transition is colour: the boundary on hover, on
 * completion and on failure, each of which has a start and an end.
 *
 * @summary A row of single-character slots holding one verification code — one
 *   value, one tab stop, and paste that lands where you expect.
 * @category Forms
 */
export const OTPField = {
  Root: OTPFieldRoot,
  Input: OTPFieldInput,
  Separator: OTPFieldSeparator,
};
