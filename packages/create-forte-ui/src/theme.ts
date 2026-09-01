/* The theme the questionnaire collects, and everything that serialises it.
 *
 * The record mirrors the Theme Studio's `ThemeConfig` — same keys, same value
 * sets — so a studio-exported command line maps onto the CLI's flags with no
 * translation. It differs in one deliberate way: the colour fields are
 * nullable. The studio always shows a concrete colour because its controls
 * need something to display; the CLI's contract is "only serialise
 * deviations", so an unanswered prompt stays `null` and writes NOTHING. A
 * scaffolded default would be a frozen default — an app that restates
 * the shipped seed stops following it when the library tunes it.
 */

import { SANS_FONTS, MONO_FONTS, findFont, SANS_FALLBACK, MONO_FALLBACK } from "./fonts.js";
import { hexToOklch, bestOnColor } from "./color.js";

export const RADIUS = ["none", "default", "soft", "pill"] as const;
export const DENSITY = ["compact", "default", "spacious"] as const;
export const MOTION = ["full", "default", "reduce"] as const;

export type Radius = (typeof RADIUS)[number];
export type Density = (typeof DENSITY)[number];
export type Motion = (typeof MOTION)[number];

export type ThemeAnswers = {
  /** Accent seed hex, or null to keep the library default (write nothing). */
  seed: string | null;
  secondary: string | null;
  /** 0 = pure grey neutrals, 1 = full brand tint. 1 is the shipped default. */
  tint: number;
  radius: Radius;
  density: Density;
  motion: Motion;
  /** Catalogue names. "System" writes nothing. */
  fontSans: string;
  fontMono: string;
};

export const DEFAULT_ANSWERS: ThemeAnswers = {
  seed: null,
  secondary: null,
  tint: 1,
  radius: "default",
  density: "default",
  motion: "default",
  fontSans: "System",
  fontMono: "System",
};

/* -------------------------------------------------------------------------
 * CSS emission
 * ---------------------------------------------------------------------- */

/** How the chosen fonts reach `--forte-font-sans` / `--forte-font-mono`:
 *  Vite loads the css2 stylesheet by `@import` and writes the stack verbatim;
 *  Next loads through `next/font/google` and points the token at the variable
 *  the loader defines. Same answer, framework-idiomatic serialisation. */
export type FontMode = "import" | "next-font";

/** The declarations for the `:root` block, one string per line, WITHOUT the
 *  surrounding braces. Empty array = every answer was a default = no block. */
export function rootDeclarations(a: ThemeAnswers, fontMode: FontMode): string[] {
  const lines: string[] = [];

  if (a.seed) lines.push(`--forte-accent-seed: ${a.seed};`);
  if (a.secondary) lines.push(`--forte-secondary-seed: ${a.secondary};`);
  if (a.tint !== 1) lines.push(`--forte-neutral-tint: ${a.tint};`);

  const sans = findFont(SANS_FONTS, a.fontSans);
  const mono = findFont(MONO_FONTS, a.fontMono);
  if (fontMode === "import") {
    if (sans.stack) lines.push(`--forte-font-sans: ${sans.stack};`);
    if (mono.stack) lines.push(`--forte-font-mono: ${mono.stack};`);
  } else {
    if (sans.stack) lines.push(`--forte-font-sans: var(--font-sans), ${SANS_FALLBACK};`);
    if (mono.stack) lines.push(`--forte-font-mono: var(--font-mono), ${MONO_FALLBACK};`);
  }

  /* Same emission as the studio's copied CSS: the on-colour is measured here
   * rather than left to the CSS fallback's fitted lightness threshold, so it
   * is exact in every browser — including those without contrast-color(). */
  const on = a.seed ? bestOnColor(hexToOklch(a.seed)!) : null;
  const onSec = a.secondary ? bestOnColor(hexToOklch(a.secondary)!) : null;
  if (on || onSec) {
    lines.push("");
    lines.push("/* Measured rather than derived, so it is exact in every browser. */");
    if (on) lines.push(`--forte-color-on-primary: ${on.color};`);
    if (onSec) lines.push(`--forte-color-on-secondary: ${onSec.color};`);
  }

  return lines;
}

/** A complete `:root { ... }` block, or "" when nothing deviates. */
export function rootBlock(a: ThemeAnswers, fontMode: FontMode): string {
  const decls = rootDeclarations(a, fontMode);
  if (decls.length === 0) return "";
  const body = decls.map((l) => (l === "" ? "" : `  ${l}`)).join("\n");
  return `:root {\n${body}\n}\n`;
}

/** `@import url(...)` lines for the chosen Google fonts (Vite path). Font
 *  imports carry no layer statements, so they are safe ahead of the bridge. */
export function fontImports(a: ThemeAnswers): string[] {
  return [findFont(SANS_FONTS, a.fontSans), findFont(MONO_FONTS, a.fontMono)]
    .filter((f) => f.css)
    .map((f) => `@import url("${f.css}");`);
}

/** ` data-forte-radius="pill" ...` — leading space included, "" when all
 *  defaults. Default modes stay UNSET so the app keeps following the OS
 *  (motion) and the library's own defaults. */
export function htmlAttrs(a: ThemeAnswers): string {
  const attrs = [
    a.radius !== "default" && `data-forte-radius="${a.radius}"`,
    a.density !== "default" && `data-forte-density="${a.density}"`,
    a.motion !== "default" && `data-forte-motion="${a.motion}"`,
  ].filter(Boolean);
  return attrs.length ? " " + attrs.join(" ") : "";
}

/* -------------------------------------------------------------------------
 * next/font emission
 * ---------------------------------------------------------------------- */

export type NextFontSetup = {
  /** `import { Inter, JetBrains_Mono } from "next/font/google";` or "". */
  importLine: string;
  /** The `const fontSans = Inter({...});` declarations, or "". */
  consts: string;
  /** ` className={...}` for the `<html>` element, or "". */
  htmlClassAttr: string;
};

/** The axes string in the catalogue is the truth about what a family can
 *  serve: `400..700` is a variable font (no `weight` needed), `400;500;700`
 *  is static and next/font requires the explicit list. */
function weightsFromAxes(css: string): string[] | null {
  const m = /wght@([^&]+)/.exec(css);
  if (!m || m[1]!.includes("..")) return null;
  return m[1]!.split(";");
}

export function nextFontSetup(a: ThemeAnswers): NextFontSetup {
  const picks = [
    { font: findFont(SANS_FONTS, a.fontSans), variable: "--font-sans", ident: "fontSans" },
    { font: findFont(MONO_FONTS, a.fontMono), variable: "--font-mono", ident: "fontMono" },
  ].filter((p) => p.font.css);

  if (picks.length === 0) return { importLine: "", consts: "", htmlClassAttr: "" };

  const names = picks.map((p) => p.font.name.replaceAll(" ", "_"));
  const consts = picks
    .map((p, i) => {
      const weights = weightsFromAxes(p.font.css!);
      const weightOpt = weights ? `, weight: [${weights.map((w) => `"${w}"`).join(", ")}]` : "";
      return `const ${p.ident} = ${names[i]}({ subsets: ["latin"], variable: "${p.variable}"${weightOpt} });`;
    })
    .join("\n");

  const classExpr =
    picks.length === 1
      ? `{${picks[0]!.ident}.variable}`
      : `{\`\${fontSans.variable} \${fontMono.variable}\`}`;

  return {
    importLine: `import { ${names.join(", ")} } from "next/font/google";`,
    consts,
    htmlClassAttr: ` className=${classExpr}`,
  };
}
