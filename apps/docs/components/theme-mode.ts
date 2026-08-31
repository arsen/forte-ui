"use client";

import * as React from "react";

/* Light ⇄ dark for the whole site — the reading of it, the writing of it, and
 * the listener that follows the OS while the reader has not chosen. The
 * BUTTON that used to live beside these helpers is gone: the header's theme
 * control now opens the theme drawer, and the mode strip inside the
 * configurator is what flips this. The helpers stay together here because the
 * attribute and its storage record have to move as a pair everywhere. */

const STORAGE_KEY = "forte-theme";

export type DocTheme = "light" | "dark";

/**
 * Write the mode. The one place `data-theme` and its storage record are set
 * together, because the two have to move as a pair: the attribute is what the
 * palette reads, and the record is what the pre-paint script in `layout.tsx`
 * replays on the next load. Writing only the attribute themes this page and
 * loses the choice on navigation.
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
 * Follow the OS while no explicit choice is stored. The pre-paint script
 * resolves `prefers-color-scheme` once per load; this keeps up if the reader
 * changes it mid-session, and stands down the moment a stored choice exists —
 * an expressed preference outranks the system for the rest of time.
 *
 * A hook rather than a component, mounted once from the header's theme
 * drawer: it has to live somewhere that is on every page, and the drawer's
 * trigger is exactly that.
 */
export function useSystemThemeSync() {
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
}
