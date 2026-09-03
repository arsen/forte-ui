/**
 * The one Shiki highlighter for the whole docs site.
 *
 * Written as .mjs rather than .ts because it is imported from BOTH sides of
 * the build: app code (via lib/highlighter.ts) and the MDX rehype plugin,
 * which Turbopack loads as plain ESM and cannot resolve TypeScript from.
 * One instance, one theme/grammar list, no drift.
 *
 * `shiki/core` plus the JavaScript regex engine avoids shipping the Oniguruma
 * WASM binary, and importing five grammars explicitly keeps the full language
 * set out of the build. `ts` is loaded alongside `tsx` because a fence with a
 * grammar this list is missing is not an error — the rehype plugin leaves the
 * block as a plain unstyled <pre>, with no `shiki` class, no colors and no
 * padding — and ```ts is the miss authors actually write.
 */
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import ts from "shiki/langs/typescript.mjs";
import tsx from "shiki/langs/tsx.mjs";
import css from "shiki/langs/css.mjs";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";

export const highlighter = await createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [ts, tsx, css, bash, json],
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});

/**
 * `defaultColor: false` makes Shiki emit BOTH themes as CSS custom properties
 * rather than inlining one theme's colors. The stylesheet picks between them,
 * so highlighting follows the site's light/dark toggle with no re-render and
 * no flash of the wrong palette.
 */
export const shikiOptions = {
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false,
  cssVariablePrefix: "--forte-shiki-",
};

/**
 * @param {string} code
 * @param {string} [lang]
 * @returns {string} HTML
 */
export function highlight(code, lang = "tsx") {
  return highlighter.codeToHtml(code.trim(), { lang, ...shikiOptions });
}
