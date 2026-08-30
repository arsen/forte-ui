"use client";

import * as React from "react";
import { Button } from "@dofortech/forte-ui";
import { Moon, Sun } from "lucide-react";
import { ICON } from "./styles";

const STORAGE_KEY = "forte-theme";

export type DocTheme = "light" | "dark";

/**
 * Write the mode. The one place `data-theme` and its storage record are set
 * together, because the two have to move as a pair: the attribute is what the
 * palette reads, and the record is what the pre-paint script in `layout.tsx`
 * replays on the next load. Writing only the attribute themes this page and
 * loses the choice on navigation.
 *
 * Exported because the Theme Studio offers the same switch in its own panel,
 * and a second copy of these five lines is exactly how the two would drift
 * apart on a key rename.
 */
export function setDocumentTheme(next: DocTheme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode / blocked storage: the switch still works for this page.
  }
}

/** The mode currently on the document. Only meaningful after mount — before
 *  the pre-paint script runs there is no attribute to read. */
export function getDocumentTheme(): DocTheme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

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
 * accessible name into `.forte-visually-hidden` text: with no visible label there
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
    setDocumentTheme(getDocumentTheme() === "dark" ? "light" : "dark");
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
        <span className="forte-visually-hidden">Switch to dark theme</span>
      </span>
      <span
        className="hidden in-data-[theme=dark]:inline-flex"
        title="Switch to light theme"
      >
        <Moon className={ICON} aria-hidden="true" />
        <span className="forte-visually-hidden">Switch to light theme</span>
      </span>
    </Button>
  );
}
