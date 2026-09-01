"use client";

import * as React from "react";
import type { Scheme } from "./theme-studio/theme-config";

/* The OS listener for light ⇄ dark. The reading and writing of the mode
 * itself now come from the library — `useTheme` and the uncontrolled
 * `ThemeToggle` inside the configurator write `data-theme` and the
 * `forte-theme` record together — so the helpers that used to do that here
 * are gone. What is left is the one thing the library does not do: keep the
 * attribute following the OS, since this site always writes it (the
 * pre-paint script resolves the preference) rather than modelling "system"
 * as its absence the way the library does.
 *
 * `import type` on purpose: theme-config imports `readerTheme` from here,
 * and a value import back would close a cycle. */

const STORAGE_KEY = "forte-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * The mode the READER asked for — their stored `forte-theme` choice, or the
 * OS preference where they have made none. The same resolution the
 * pre-paint script does once per load, for the two places that need it
 * again mid-session: the OS listener below, and the studio handing the
 * attribute back after a pinned scheme is released.
 */
export function readerTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* Storage refused: the OS preference is still an answer. */
  }
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Follow the OS while no explicit choice is stored. The pre-paint script
 * resolves `prefers-color-scheme` once per load; this keeps up if the reader
 * changes it mid-session, and stands down the moment a stored choice exists —
 * an expressed preference outranks the system for the rest of time.
 *
 * It also stands down while the studio has a scheme PINNED: the attribute is
 * then part of the theme being designed, not a preference, and an OS switch
 * must not be able to knock a "light only" page into dark. Passed in rather
 * than read here so this module never imports the studio's store.
 *
 * A hook rather than a component, mounted once from the header's theme
 * drawer: it has to live somewhere that is on every page, and the drawer's
 * trigger is exactly that.
 */
export function useSystemThemeSync(scheme: Scheme) {
  React.useEffect(() => {
    if (scheme !== "system") return;
    const mq = window.matchMedia(DARK_QUERY);
    const sync = () => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [scheme]);
}
