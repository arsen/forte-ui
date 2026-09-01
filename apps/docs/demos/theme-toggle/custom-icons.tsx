"use client";

import { ThemeToggle } from "@forte-ui/react";
import { Sun, MoonStar } from "lucide-react";

export default function ThemeToggleCustomIcons() {
  // Custom artwork drops into the same wrappers as the built-in glyphs, so
  // the CSS that picks the visible icon — and the cross-fade — keep working.
  // No size prop on the lucide icons: the wrapper sizes any svg it is handed
  // to `--forte-theme-toggle-icon-size`.
  return <ThemeToggle icons={{ light: <Sun />, dark: <MoonStar /> }} />;
}
