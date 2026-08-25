"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
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
   * Which semantic colour set the button draws from. Combines freely with
   * `variant` — `tone="danger" variant="outline"` is a low-emphasis
   * destructive action.
   * @default "primary"
   */
  tone?: ButtonTone;
  /**
   * Size of the button. Actual dimensions also follow the ambient
   * `data-pui-density` setting.
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
 * Styling is driven entirely by `data-*` attributes and `--pui-button-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=solid]:...`) without wrapping.
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
        className={clsx(styles.root, "pui-focus-ring", className)}
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-full-width={fullWidth || undefined}
        data-icon-only={iconOnly || undefined}
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
        <span className={styles.content}>{children}</span>
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            {/* Visually redundant with the spinner, but the spinner is
             * decorative; this is what actually reaches assistive tech. */}
            <span className="pui-visually-hidden">{loadingLabel}</span>
          </>
        ) : null}
      </BaseButton>
    );
  },
);
