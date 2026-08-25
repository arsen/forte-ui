"use client";

import * as React from "react";
import styles from "./demo-frame.module.css";

export type DemoScope = {
  theme: "inherit" | "light" | "dark";
  dir: "ltr" | "rtl";
  motion: "inherit" | "reduce";
};

/**
 * Wraps a demo in a scoped theming context.
 *
 * `children` stays server-rendered — this component only sets attributes on a
 * wrapper, so the demo itself never becomes a client component just to gain a
 * light/dark toggle.
 *
 * The theme scoping works because the library re-declares its colour ramps on
 * `.pui-theme` and `[data-pui-theme]`, not only on `:root`. A custom property
 * containing `var()` is substituted at the element where it is DECLARED, so
 * setting a seed on a descendant of `:root` alone would change nothing.
 */
export function DemoFrame({
  children,
  scope,
  className,
}: {
  children: React.ReactNode;
  scope: DemoScope;
  className?: string;
}) {
  return (
    <div
      className={[styles.frame, "pui-theme", className].filter(Boolean).join(" ")}
      // `dir` is a real HTML attribute, not a CSS trick — it drives Base UI's
      // keyboard direction handling as well as the visual flow.
      dir={scope.dir}
      data-theme={scope.theme === "inherit" ? undefined : scope.theme}
      data-pui-motion={scope.motion === "inherit" ? undefined : "reduce"}
    >
      {children}
    </div>
  );
}

const THEMES: DemoScope["theme"][] = ["inherit", "light", "dark"];

/** The control strip. Kept separate so a demo can be rendered without it. */
export function DemoControls({
  scope,
  onChange,
  onReset,
}: {
  scope: DemoScope;
  onChange: (next: DemoScope) => void;
  onReset: () => void;
}) {
  const themeLabel = scope.theme === "inherit" ? "Auto" : scope.theme === "light" ? "Light" : "Dark";

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={`${styles.control} pui-focus-ring`}
        onClick={() => onChange({ ...scope, theme: THEMES[(THEMES.indexOf(scope.theme) + 1) % THEMES.length]! })}
        aria-label={`Preview theme: ${themeLabel}. Activate to change.`}
        title="Preview theme"
      >
        <span aria-hidden="true">{scope.theme === "dark" ? "☾" : scope.theme === "light" ? "☀" : "◐"}</span>
        {themeLabel}
      </button>

      <button
        type="button"
        className={`${styles.control} pui-focus-ring`}
        data-active={scope.dir === "rtl" || undefined}
        onClick={() => onChange({ ...scope, dir: scope.dir === "ltr" ? "rtl" : "ltr" })}
        aria-pressed={scope.dir === "rtl"}
        title="Right-to-left layout"
      >
        RTL
      </button>

      <button
        type="button"
        className={`${styles.control} pui-focus-ring`}
        data-active={scope.motion === "reduce" || undefined}
        onClick={() => onChange({ ...scope, motion: scope.motion === "reduce" ? "inherit" : "reduce" })}
        aria-pressed={scope.motion === "reduce"}
        title="Simulate prefers-reduced-motion"
      >
        Reduced motion
      </button>

      <button
        type="button"
        className={`${styles.control} pui-focus-ring`}
        onClick={onReset}
        title="Reset the demo to its initial state"
      >
        Reset
      </button>
    </div>
  );
}
