"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import { Spinner } from "../spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type ButtonTone = "primary" | "secondary" | "danger" | "neutral";
export type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = React.ComponentPropsWithoutRef<typeof BaseButton>;

export interface ButtonProps extends Omit<BaseButtonProps, "className"> {
  /**
   * How much visual weight the button carries.
   * @default "solid"
   */
  variant?: ButtonVariant;
  /**
   * Which semantic color set the button draws from. Combines freely with
   * `variant` — `tone="danger" variant="outline"` is a low-emphasis
   * destructive action.
   * @default "primary"
   */
  tone?: ButtonTone;
  /**
   * Size of the button. Actual dimensions also follow the ambient
   * `data-forte-density` setting.
   * @default "md"
   */
  size?: ButtonSize;
  /**
   * Stretch the button to fill the width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Render as a square button sized for a single icon. Enforces the 24px
   * minimum hit target from WCAG SC 2.5.8. Always pair with `aria-label`.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Show a busy indicator and block interaction. The label keeps its space so
   * the button cannot resize mid-interaction.
   * @default false
   */
  loading?: boolean;
  /**
   * Announced to assistive technology while `loading` is true. Without it, a
   * screen reader user gets no signal that anything is happening.
   * @default "Loading"
   */
  loadingLabel?: string;
  /**
   * Keep the button focusable while it is disabled. A native `disabled`
   * button is blurred by the browser, which drops focus to `<body>` and loses
   * the user's place in the tab order — and takes `aria-busy` and
   * `loadingLabel` out of earshot with it. Left unset, this turns itself on
   * for the duration of `loading` so the busy state is actually announced;
   * pass it explicitly to override.
   * @default true while `loading`, otherwise false
   */
  focusableWhenDisabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button built on Base UI's unstyled `Button` primitive.
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-button-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=solid]:...`) without wrapping.
 *
 * @summary The clickable action control — submit, open, trigger; for a pressed
 *   state that sticks, use Toggle, and for pure navigation use a link.
 * @category Actions
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "solid",
      tone = "primary",
      size = "md",
      fullWidth = false,
      iconOnly = false,
      loading = false,
      loadingLabel = "Loading",
      disabled,
      focusableWhenDisabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <BaseButton
        ref={ref}
        className={clsx(styles.root, "forte-focus-ring", className)}
        data-forte="button"
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-full-width={fullWidth || undefined}
        {/* Spread-when-true, not `iconOnly || undefined`: JSX keeps an
          * `undefined`-valued key in the props object and the render-prop
          * merge copies it verbatim, so when this button is the outer half
          * of a composition its plain attribute would erase the
          * `data-icon-only` the inner element sets for itself. */
        ...(iconOnly && { "data-icon-only": true })}
        data-loading={loading || undefined}
        // A loading button is not merely styled as busy — it must not be
        // activatable, or a double submit slips through.
        disabled={disabled || loading}
        // Disabled keeps the button inert, so the double-submit guard above
        // still holds; this only stops the browser from blurring it, which
        // would otherwise strand `aria-busy` and the loading label on an
        // element the user has just been thrown off of.
        focusableWhenDisabled={focusableWhenDisabled ?? (loading || undefined)}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className={styles.content} data-forte="button-content">{children}</span>
        {loading ? (
          <>
            <Spinner
              className={styles.spinner}
              // `current` is the tone that composes: the ring takes the
              // button's own text color, so it keeps matching through every
              // variant, tone and hover state without Button having to hand it
              // a palette.
              tone="current"
              // The button already owns the announcement — `aria-busy` plus the
              // hidden label below. A second live region for the same wait is
              // worse than one, which is exactly what `decorative` is for.
              decorative
              // The one knob Button has to reach in through. Spinner declares
              // `--forte-spinner-size` on its OWN root, so an inherited value
              // never wins; setting it inline lands it on that element while
              // still resolving through Button's knob, so overriding
              // `--forte-button-spinner-size` on the button still works.
              style={
                {
                  "--forte-spinner-size": "var(--forte-button-spinner-size)",
                } as React.CSSProperties
              }
            />
            {/* Visually redundant with the spinner, but the spinner is
             * decorative; this is what actually reaches assistive tech. */}
            <span className="forte-visually-hidden">{loadingLabel}</span>
          </>
        ) : null}
      </BaseButton>
    );
  },
);
