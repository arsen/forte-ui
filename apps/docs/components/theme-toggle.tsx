"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";
import { Moon, Sun } from "lucide-react";
import { ICON } from "./styles";

const STORAGE_KEY = "pui-theme";

/**
 * Light ⇄ dark, and nothing else — no "system" step to cycle past.
 *
 * The component renders NOTHING from state, and that is the whole point. The
 * mode lives in one place, `data-theme` on <html>, written before first paint
 * by the inline script in `layout.tsx`; React only flips it. State here would
 * have to start at a guess on the server, so the first client render would
 * paint that guess and correct itself a frame later — the icon showing one
 * mode and then snapping, which is the bug this shape removes. Both branches
 * ship in the HTML instead and CSS picks one off the same attribute the
 * palette reads, so the server output is already right.
 *
 * Icon only, like the two controls either side of it. That moves the whole
 * accessible name into `.pui-visually-hidden` text: with no visible label there
 * is nothing for SC 2.5.3 to require a match with, so the name is free to
 * describe the ACTION — which is the useful thing for a control whose glyph
 * shows the current state rather than what pressing it does. `title` carries
 * the same sentence to a hovering mouse, and sits on the spans rather than the
 * button because it has to change with the mode.
 */
export function ThemeToggle() {
  // Nothing stored means the reader has never expressed a preference, so the
  // OS keeps the last word for the rest of the session too — the pre-paint
  // script resolves it once, and this keeps up if they change it mid-session.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage: the switch still works for this page.
    }
  }

  return (
    <Button variant="ghost" size="sm" iconOnly onClick={toggle}>
      {/* Light is the default branch so a reader with JS off — where no script
        * ever writes `data-theme` — sees one icon rather than both. */}
      <span
        className="inline-flex in-data-[theme=dark]:hidden"
        title="Switch to dark theme"
      >
        <Sun className={ICON} aria-hidden="true" />
        <span className="pui-visually-hidden">Switch to dark theme</span>
      </span>
      <span
        className="hidden in-data-[theme=dark]:inline-flex"
        title="Switch to light theme"
      >
        <Moon className={ICON} aria-hidden="true" />
        <span className="pui-visually-hidden">Switch to light theme</span>
      </span>
    </Button>
  );
}
