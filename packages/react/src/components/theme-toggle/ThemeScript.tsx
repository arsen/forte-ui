"use client";

import * as React from "react";

/*
 * The pre-paint half of theme persistence.
 *
 * With no `data-theme` attribute the stylesheet already follows the OS through
 * `light-dark()`, so a first-time visitor never flashes no matter what. The
 * only load that CAN flash is one where a stored explicit choice disagrees
 * with the OS — dark chosen on a light-mode machine — and the window for it is
 * the gap between first paint and whenever React gets around to replaying the
 * choice. This script closes that gap by replaying it synchronously, before
 * the parser reaches `<body>`.
 *
 * That is also why it is a STRING and not behaviour inside a component: an
 * effect runs after paint by definition. The component below only exists to
 * put the string somewhere; `themeInitScript` is exported on its own for
 * frameworks that inject head markup as text.
 */

/**
 * The inline script `ThemeScript` renders, exported for frameworks where head
 * markup is authored as text rather than JSX. It reads
 * `localStorage("forte-theme")` — the key `useTheme` writes — and replays a
 * stored `"light"` / `"dark"` onto `<html data-theme>`; with nothing stored it
 * does nothing, leaving the page to follow the OS. Wrapped in `try` so a
 * blocked storage API costs nothing but the memory of the choice.
 */
export const themeInitScript =
  '(function(){try{var t=localStorage.getItem("forte-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();';

export interface ThemeScriptProps
  extends Omit<React.ComponentPropsWithoutRef<"script">, "children" | "dangerouslySetInnerHTML"> {
  /**
   * CSP nonce, when the app serves a `script-src` policy that requires one.
   * Forwarded to the rendered `<script>` element like any other prop; it is
   * only declared here so it appears in the prop table.
   */
  nonce?: string;
}

/**
 * Replays a persisted theme choice before first paint, so a page saved as dark
 * does not flash light while React loads. Render it in `<head>` of the root
 * layout, above the app:
 *
 * ```tsx
 * <html lang="en" suppressHydrationWarning>
 *   <head>
 *     <ThemeScript />
 *   </head>
 * ```
 *
 * `suppressHydrationWarning` belongs on `<html>` because the script legitimately
 * makes the client's root element differ from the server's. Vite and other
 * static-`index.html` setups inline `themeInitScript` in the HTML instead —
 * `create-forte-ui` scaffolds it — since a bundled component cannot run before
 * the bundle. Not needed at all if something else already replays the theme
 * (e.g. next-themes, which brings its own script).
 */
export function ThemeScript(props: ThemeScriptProps): React.JSX.Element {
  /* The spread comes first so `dangerouslySetInnerHTML` cannot be displaced —
   * an empty ThemeScript is strictly worse than no ThemeScript, because it
   * looks installed. */
  return <script {...props} dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
