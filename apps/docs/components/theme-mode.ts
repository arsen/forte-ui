"use client";

import * as React from "react";

/* The OS listener for light ⇄ dark. The reading and writing of the mode
 * itself now come from the library — `useTheme` and the uncontrolled
 * `ThemeToggle` inside the configurator write `data-theme` and the
 * `forte-theme` record together — so the helpers that used to do that here
 * are gone. What is left is the one thing the library does not do: keep the
 * attribute following the OS, since this site always writes it (the
 * pre-paint script resolves the preference) rather than modelling "system"
 * as its absence the way the library does. */

const STORAGE_KEY = "forte-theme";

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
