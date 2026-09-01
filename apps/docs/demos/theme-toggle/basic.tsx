"use client";

import { ThemeToggle } from "@forte-ui/react";

export default function ThemeToggleBasic() {
  // Uncontrolled, which is the real thing: a click writes `data-theme` on
  // <html> and persists it to localStorage("forte-theme") — so this one flips
  // this whole docs site, not just the frame. The icon needs no state either
  // way: CSS keyed on the attribute decides which glyph shows.
  return <ThemeToggle />;
}
