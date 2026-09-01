"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./ThemeToggle.module.css";
import { resolvedDocumentTheme, setDocumentTheme, type ResolvedThemeMode } from "./use-theme";

export type ThemeToggleVariant = "ghost" | "soft" | "outline";
export type ThemeToggleSize = "sm" | "md" | "lg";

export interface ThemeToggleIcons {
  /** Rendered while the resolved theme is light. Any `svg` inside is sized to `--forte-theme-toggle-icon-size`. */
  light?: React.ReactNode;
  /** Rendered while the resolved theme is dark. Any `svg` inside is sized to `--forte-theme-toggle-icon-size`. */
  dark?: React.ReactNode;
}

export interface ThemeToggleLabels {
  /** Accessible name while the resolved theme is light. @default "Switch to dark theme" */
  light?: string;
  /** Accessible name while the resolved theme is dark. @default "Switch to light theme" */
  dark?: string;
}

export interface ThemeToggleProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children"> {
  /**
   * How much chrome the button carries at rest: `ghost` is bare until hovered,
   * `soft` sits on a panel fill, `outline` draws a border. There is no `solid`
   * — the toggle states nothing on or off the way `Toggle` does, so a loud
   * fill would only compete with real actions nearby.
   * @default "ghost"
   */
  variant?: ThemeToggleVariant;
  /**
   * Size of the (square) button. Matches `Button` step for step so the toggle
   * lines up beside one in a header.
   * @default "md"
   */
  size?: ThemeToggleSize;
  /**
   * Controls the toggle. When set, the button never touches the document —
   * clicking only reports the opposite mode through `onThemeChange`, and the
   * icon follows this prop instead of the page. This is the hook-up for an
   * external theme manager (e.g. next-themes: pass its `resolvedTheme` here
   * and its `setTheme` to `onThemeChange`). Leave unset for the built-in
   * behaviour: the click writes `data-theme` on `<html>` and persists it to
   * `localStorage("forte-theme")`.
   */
  theme?: ResolvedThemeMode;
  /**
   * Called with the mode the click asks for. In uncontrolled mode it fires
   * after the document has been updated; with `theme` set it is the only
   * effect a click has.
   */
  onThemeChange?: (theme: ResolvedThemeMode) => void;
  /**
   * Replacement artwork, per resolved theme. Custom icons drop into the same
   * wrappers as the built-in sun and moon — the CSS that decides which one
   * shows, and the cross-fade between them, keep working unchanged.
   */
  icons?: ThemeToggleIcons;
  /**
   * Accessible names, per resolved theme — the override point for i18n. Each
   * names the action, not the state: while light shows, the button offers
   * dark. An `aria-label` prop still wins over both, but flattens the two
   * states into one name.
   */
  labels?: ThemeToggleLabels;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the button element.
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/* The default artwork. Hand-drawn on the same 24-unit grid as the library's
 * other inline glyphs, stroked in `currentColor` so tone changes, forced
 * colours and the hover colour all reach it with no extra rules. Decorative by
 * contract — the state lives in the visually-hidden label beside it. */
function SunIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 2.5v2.1M12 19.4v2.1M2.5 12h2.1M19.4 12h2.1M5.28 5.28l1.49 1.49M17.23 17.23l1.49 1.49M18.72 5.28l-1.49 1.49M6.77 17.23l-1.49 1.49" />
    </svg>
  );
}

function MoonIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.6 14.1A8.35 8.35 0 1 1 9.9 3.4a6.7 6.7 0 0 0 10.7 10.7Z" />
    </svg>
  );
}

/**
 * A button that switches the page between light and dark. Renders a native
 * `<button>` holding both a sun and a moon; **CSS keyed on `data-theme` (with
 * a `prefers-color-scheme` fallback) decides which one shows**, so the server
 * needs no idea what the visitor prefers — the HTML is theme-agnostic, there
 * is no hydration mismatch, and the right icon is right at first paint.
 *
 * Uncontrolled — the default — a click flips the *resolved* mode: it writes
 * `data-theme` on `<html>`, persists the choice to
 * `localStorage("forte-theme")`, and every `useTheme` on the page follows.
 * Pair the page with `ThemeScript` so the choice survives a reload without a
 * flash. Controlled — `theme` + `onThemeChange` — it is a dumb button for an
 * external manager such as next-themes.
 *
 * The current state is announced through a visually-hidden label naming the
 * *action* ("Switch to dark theme"); the icons are decorative.
 *
 * @summary A ready-made light/dark mode button — pair with ThemeScript to
 *   avoid a wrong-theme flash at first paint; useTheme drives custom toggles.
 * @category Actions
 */
export function ThemeToggle({
  variant = "ghost",
  size = "md",
  theme,
  onThemeChange,
  icons,
  labels,
  className,
  onClick,
  disabled,
  ...props
}: ThemeToggleProps): React.JSX.Element {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    /* The current mode is read off the document at click time rather than
     * subscribed to at render time: this component's render output does not
     * depend on it (CSS carries the icon), so subscribing would only buy
     * re-renders. From "system" the first click lands on the opposite of
     * whatever the OS currently shows — the click means "not this". */
    const next: ResolvedThemeMode =
      (theme ?? resolvedDocumentTheme()) === "dark" ? "light" : "dark";
    if (theme === undefined) setDocumentTheme(next);
    onThemeChange?.(next);
  };

  return (
    <button
      type="button"
      className={clsx(styles.root, "forte-focus-ring", className)}
      data-forte="theme-toggle"
      data-variant={variant}
      data-size={size}
      /* Only in controlled mode. The stylesheet gives the button's OWN
       * attribute higher specificity than any ancestor's, so a controlled
       * toggle shows its prop even inside a page themed the other way. */
      {...(theme !== undefined && { "data-theme": theme })}
      {...(disabled && { "data-disabled": true })}
      disabled={disabled}
      {...props}
      onClick={handleClick}
    >
      {/* Both icons are always in the DOM — that is the whole trick. The one
        * that does not apply is `visibility: hidden`, which removes it (label
        * included) from the accessibility tree, so the button's name is always
        * exactly one action. */}
      <span className={styles.icon} data-forte="theme-toggle-icon" data-icon="light">
        {icons?.light ?? <SunIcon />}
        <span className="forte-visually-hidden">{labels?.light ?? "Switch to dark theme"}</span>
      </span>
      <span className={styles.icon} data-forte="theme-toggle-icon" data-icon="dark">
        {icons?.dark ?? <MoonIcon />}
        <span className="forte-visually-hidden">{labels?.dark ?? "Switch to light theme"}</span>
      </span>
    </button>
  );
}
