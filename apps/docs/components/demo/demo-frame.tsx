"use client";

import * as React from "react";
import { ViewTransition } from "react";
import { cn } from "@/lib/cn";

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
 * The theme scoping works because the library re-declares its color ramps on
 * `.forte-theme` and `[data-forte-theme]`, not only on `:root`. A custom property
 * containing `var()` is substituted at the element where it is DECLARED, so
 * setting a seed on a descendant of `:root` alone would change nothing. It is
 * also why the frame's colors are written as `bg-background` rather than a
 * hardcoded value: `@theme inline` puts the token reference in the utility, so
 * it resolves here, under the scope, and not at `:root`.
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
    /* An inert view-transition boundary, and it is load-bearing. The root
     * layout wraps every page in the boundary that cross-fades between
     * routes, and React counts ANY transition inside that as an update of
     * it — a demo's `startTransition` included, which the async Combobox
     * demos use on every keystroke. React resolves a mutation to the
     * innermost boundary around it, so this one claims everything a demo
     * does and resolves it to nothing; without it, typing in that demo would
     * cross-fade the whole page and hold the input's caret behind a snapshot
     * for the length of the fade. See `components/page-transition.tsx`. */
    <ViewTransition default="none">
      <div
        className={cn(
          // `@container` lets demos respond to the frame rather than the
          // viewport, so a preview narrowed by the controls strip still shows its
          // true responsive behavior.
          "@container flex min-h-[8rem] flex-wrap items-center justify-center gap-3 p-6",
          "bg-background text-foreground",
          // The shell clips the frame, so the frame never rounds its own corners.
          "rounded-none",
          "forte-theme",
          className,
        )}
        // `dir` is a real HTML attribute, not a CSS trick — it drives Base UI's
        // keyboard direction handling as well as the visual flow.
        dir={scope.dir}
        data-theme={scope.theme === "inherit" ? undefined : scope.theme}
        data-forte-motion={scope.motion === "inherit" ? undefined : "reduce"}
      >
        {children}
      </div>
    </ViewTransition>
  );
}

const THEMES: DemoScope["theme"][] = ["inherit", "light", "dark"];

/* One control in the strip. `pointer` because it acts; the font trio because
 * there is no Preflight and a bare <button> would otherwise be 13px Arial. */
const CONTROL = [
  "inline-flex min-h-(--forte-target-min) cursor-pointer items-center gap-1",
  // Not `[font:inherit]`: Tailwind emits arbitrary properties after ordinary
  // utilities, and the `font` shorthand carries a `font-size` — so it silently
  // overwrote the `text-1` sitting right next to it.
  "rounded-2 border-0 bg-transparent px-2 py-1 font-sans font-normal leading-normal text-1",
  "text-foreground-muted transition-[color,background-color] duration-fast ease-standard",
  "hover:bg-panel-hover hover:text-foreground",
  "data-active:bg-primary-soft data-active:text-primary-text",
  "forte-focus-ring",
].join(" ");

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
    <div className="flex flex-wrap gap-1 border-t border-border-muted bg-panel px-3 py-2">
      <button
        type="button"
        className={CONTROL}
        onClick={() => onChange({ ...scope, theme: THEMES[(THEMES.indexOf(scope.theme) + 1) % THEMES.length]! })}
        aria-label={`Preview theme: ${themeLabel}. Activate to change.`}
        title="Preview theme"
      >
        <span aria-hidden="true">{scope.theme === "dark" ? "☾" : scope.theme === "light" ? "☀" : "◐"}</span>
        {themeLabel}
      </button>

      <button
        type="button"
        className={CONTROL}
        data-active={scope.dir === "rtl" || undefined}
        onClick={() => onChange({ ...scope, dir: scope.dir === "ltr" ? "rtl" : "ltr" })}
        aria-pressed={scope.dir === "rtl"}
        title="Right-to-left layout"
      >
        RTL
      </button>

      <button
        type="button"
        className={CONTROL}
        data-active={scope.motion === "reduce" || undefined}
        onClick={() => onChange({ ...scope, motion: scope.motion === "reduce" ? "inherit" : "reduce" })}
        aria-pressed={scope.motion === "reduce"}
        title="Simulate prefers-reduced-motion"
      >
        Reduced motion
      </button>

      <button
        type="button"
        className={CONTROL}
        onClick={onReset}
        title="Reset the demo to its initial state"
      >
        Reset
      </button>
    </div>
  );
}
