"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";
import { Monitor, Moon, Sun } from "lucide-react";
import { ICON } from "./styles";

type ThemeMode = "system" | "light" | "dark";

const ORDER: ThemeMode[] = ["system", "light", "dark"];
const LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};
const ICONS: Record<ThemeMode, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
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

  /* Before the effect has read localStorage the server's guess is all there
   * is, and it has to be the one the server rendered or React replaces the
   * markup. The no-flash script has already applied the real theme to the
   * document by then, so only this button is briefly out of step. */
  const label = mounted ? LABELS[mode] : LABELS.system;
  const Icon = mounted ? ICONS[mode] : ICONS.system;

  return (
    /* Icon only. The mode is a three-way cycle, so the word next to the glyph
     * was never the whole story either — it named the CURRENT mode, not what
     * pressing would do — and it is still said in full by `aria-label` and by
     * the tooltip a hover brings up. */
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <Icon className={ICON} aria-hidden="true" />
    </Button>
  );
}
