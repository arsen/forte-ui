"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

type ThemeMode = "system" | "light" | "dark";

const ORDER: ThemeMode[] = ["system", "light", "dark"];
const LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};
const ICONS: Record<ThemeMode, string> = {
  system: "◐",
  light: "☀",
  dark: "☾",
};

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

export function ThemeToggle() {
  const [mode, setMode] = React.useState<ThemeMode>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("pui-theme") as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
    setMounted(true);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]!;
    setMode(next);
    applyMode(next);
    if (next === "system") {
      localStorage.removeItem("pui-theme");
    } else {
      localStorage.setItem("pui-theme", next);
    }
  }

  const label = mounted ? LABELS[mode] : LABELS.system;
  const icon = mounted ? ICONS[mode] : ICONS.system;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <span aria-hidden style={{ fontSize: "1em" }}>
        {icon}
      </span>
      {label}
    </Button>
  );
}
