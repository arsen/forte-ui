"use client";

import * as React from "react";
import { ThemeToggle, type ResolvedThemeMode } from "@forte-ui/react";

export default function ThemeToggleControlled() {
  const [theme, setTheme] = React.useState<ResolvedThemeMode>("dark");

  // With `theme` set the button never touches the document — it reports the
  // opposite mode through `onThemeChange` and shows whatever the prop says.
  // Here that drives a theme island, so only this card flips; the same two
  // props are the hook-up for next-themes (`resolvedTheme` / `setTheme`).
  // `forte-theme` is load-bearing next to `data-theme`: the palette is
  // re-derived only on scope markers, so the attribute alone would flip
  // `color-scheme` while every colour kept the page's resolved values.
  return (
    <div
      data-theme={theme}
      className="forte-theme flex w-full max-w-sm items-center justify-between gap-4 rounded-surface border border-border bg-background p-surface"
    >
      <div className="grid gap-1">
        <span className="text-2 font-medium text-foreground">Scoped to this card</span>
        <span className="text-1 text-foreground-muted">currently {theme}</span>
      </div>
      <ThemeToggle theme={theme} onThemeChange={setTheme} variant="outline" />
    </div>
  );
}
