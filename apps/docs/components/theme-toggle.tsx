"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

const STORAGE_KEY = "pui-theme";

/**
 * Light ⇄ dark, and nothing else — no "system" step to cycle past.
 *
 * The component renders NOTHING from state, and that is the whole point. The
 * mode lives in one place, `data-theme` on <html>, written before first paint
 * by the inline script in `layout.tsx`; React only flips it. State here would
 * have to start at a guess on the server, so the first client render would
 * paint that guess and correct itself a frame later — the label reading
 * "System" and then snapping, which is the bug this shape removes. Both labels
 * ship in the HTML instead and CSS picks one off the same attribute the
 * palette reads, so the server output is already right.
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
    <Button variant="ghost" size="sm" onClick={toggle}>
      {/* Light is the default branch so a reader with JS off — where no script
        * ever writes `data-theme` — sees one label rather than both. */}
      <span className="inline-flex items-center gap-2 in-data-[theme=dark]:hidden">
        <span aria-hidden>☀</span>
        Light
        {/* The accessible name has to CONTAIN the visible label (SC 2.5.3), so
          * the action is appended to it rather than replacing it via
          * aria-label. */}
        <span className="pui-visually-hidden">theme, switch to dark</span>
      </span>
      <span className="hidden items-center gap-2 in-data-[theme=dark]:inline-flex">
        <span aria-hidden>☾</span>
        Dark
        <span className="pui-visually-hidden">theme, switch to light</span>
      </span>
    </Button>
  );
}
