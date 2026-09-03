/* The files the overlay writes, one builder per file. The content is the
 * getting-started guides' snippets, parameterised — the guides are the spec,
 * and keeping these byte-close to the published steps is what lets a reader
 * diff a scaffolded app against the walkthrough and see only their own
 * answers. When a guide step changes, change the builder with it.
 */

import {
  rootBlock,
  fontImports,
  htmlAttrs,
  htmlClassAttr,
  nextFontSetup,
  type ThemeAnswers,
} from "./theme.js";

/* The body rule from the guides' "Replace the scaffold CSS" step. Present on
 * the non-Tailwind paths only — the Tailwind starter page carries the same
 * three declarations as utilities on `<main>`. */
const BODY_RULE = `body {
  margin: 0;
  background: var(--forte-color-background);
  color: var(--forte-color-foreground);
  font-family: var(--forte-font-sans);
}
`;

function joinBlocks(...blocks: string[]): string {
  return blocks.filter(Boolean).join("\n") + "\n";
}

/* The starter's one piece of chrome, and the working half of the guides'
 * "Light and dark" step: the theme the questionnaire just seeded can be
 * flipped without writing a line. Two spellings of the same corner, because
 * the Tailwind paths have utilities and the plain ones do not.
 *
 * `fixed` rather than in flow, so the page still centers the component it is
 * there to demonstrate — and the offsets are space tokens rather than `1rem`,
 * because this file is the first thing a new app is copied out of and a
 * hardcoded value here is the habit it teaches. */
const TOGGLE_TW = `<ThemeToggle className="fixed top-4 right-4" />`;
const TOGGLE_STYLE = `<ThemeToggle
  style={{ position: "fixed", top: "var(--forte-space-4)", right: "var(--forte-space-4)" }}
/>`;

/** `TOGGLE_STYLE` re-indented to sit at `indent` spaces (its first line is
 *  placed by the caller, the continuation lines by this). */
function indented(block: string, indent: number): string {
  const pad = " ".repeat(indent);
  return block
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}

/* -------------------------------------------------------------------------
 * Vite
 * ---------------------------------------------------------------------- */

export function viteIndexCss(a: ThemeAnswers, tailwind: boolean): string {
  const imports = fontImports(a);
  const fontBlock = imports.length
    ? `/* Or self-host these — any @font-face works. */\n${imports.join("\n")}\n`
    : "";
  if (tailwind) {
    /* Ordering is load-bearing (see the guide): the bridge's first line pins
     * the cascade-layer order, so it must precede `tailwindcss` and
     * `theme.css`. The font imports carry no layer statements — and @import
     * must precede every other statement — so they lead the file. */
    return joinBlocks(
      fontBlock,
      `@import "@forte-ui/react/tailwind.css";
@import "tailwindcss";
@import "@forte-ui/react/theme.css";
@import "@forte-ui/react/styles/reset.css";
`,
      rootBlock(a, "import"),
    );
  }
  return joinBlocks(fontBlock, rootBlock(a, "import"), BODY_RULE);
}

export function viteMainTsx(tailwind: boolean): string {
  /* On the Tailwind path `theme.css` is imported from index.css AFTER the
   * bridge — importing it here would pin the `forte` layer first and hand
   * Preflight the win. Without Tailwind there is no ordering hazard and the
   * guide imports it at the entry point. */
  const themeImport = tailwind
    ? ""
    : `import "@forte-ui/react/theme.css";\nimport "@forte-ui/react/styles/reset.css";\n`;
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
${themeImport}import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
}

/** `toggle` is false when the answers pinned a color scheme: `data-theme`
 *  then sits statically on `<html>` and a toggle would be a button whose one
 *  job is to fight it. The import goes with the element, so the starter
 *  still compiles clean under `noUnusedLocals`. */
export function viteAppTsx(name: string, tailwind: boolean, toggle: boolean): string {
  if (tailwind) {
    const toggleLine = toggle ? `      ${TOGGLE_TW}\n` : "";
    return `import { Button, Card${toggle ? ", ThemeToggle" : ""} } from "@forte-ui/react";

export default function App() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background text-foreground">
${toggleLine}      <Card.Root variant="elevated" className="items-start gap-5">
        <h1 className="text-5 font-semibold">${name}</h1>
        <p className="text-2 text-foreground-muted">
          Utilities and components, one theme.
        </p>
        <Button>It works</Button>
      </Card.Root>
    </main>
  );
}
`;
  }
  const toggleLine = toggle ? `      ${indented(TOGGLE_STYLE, 6)}\n` : "";
  return `import { Button${toggle ? ", ThemeToggle" : ""} } from "@forte-ui/react";

export default function App() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
${toggleLine}      <Button>It works</Button>
    </main>
  );
}
`;
}

export const VITE_CONFIG_TW = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

/* -------------------------------------------------------------------------
 * Next.js
 * ---------------------------------------------------------------------- */

export function nextGlobalsCss(a: ThemeAnswers, tailwind: boolean): string {
  if (tailwind) {
    return joinBlocks(
      `@import "@forte-ui/react/tailwind.css";
@import "tailwindcss";
@import "@forte-ui/react/theme.css";
@import "@forte-ui/react/styles/reset.css";
`,
      rootBlock(a, "next-font"),
    );
  }
  return joinBlocks(rootBlock(a, "next-font"), BODY_RULE);
}

/* Shipped into the Tailwind layout above its first import: the one line a
 * reader is most likely to reorder while tidying, and the one that breaks the
 * page when they do. */
const GLOBALS_FIRST_NOTE = `// globals.css first: it pins the cascade-layer order, and the library's own
// CSS arrives with its JS import. Import the library above it and Tailwind's
// Preflight wins over every component.
`;

export function nextLayoutTsx(name: string, a: ThemeAnswers, tailwind: boolean): string {
  const font = nextFontSetup(a);
  /* Without Tailwind, `theme.css` is imported here, above globals — safe
   * because nothing else declares layers. With Tailwind it must NOT be:
   * globals.css imports it after the bridge (see the guide's ordering note),
   * and a second import here would pin the `forte` layer before `base`. */
  const themeImport = tailwind
    ? ""
    : `import "@forte-ui/react/theme.css";\nimport "@forte-ui/react/styles/reset.css";\n`;
  /* ThemeScript + suppressHydrationWarning are the guides' "Light and dark"
   * step: the script replays a stored light/dark choice onto <html> before
   * first paint, and the suppression covers the attribute it legitimately
   * adds. Harmless with nothing stored — the page just follows the OS. */
  /* The toggle that writes what the script replays. It goes in the LAYOUT,
   * not the page, because it is chrome: it then survives every route the app
   * grows, and the page stays the one file a reader edits first. Being a flat
   * export it needs no `"use client"` here — the boundary the compound
   * components force on `page.tsx` does not reach the layout. */
  /* A pinned scheme drops all three. The attribute is static, so there is
   * nothing for the script to replay and nothing for the suppression to
   * cover — and the script is actively wrong here, not merely idle: it
   * replays whatever `forte-theme` record is on the origin, and on
   * localhost every project shares one origin, so a toggle pressed in some
   * OTHER app would flip this one's pinned palette on load. */
  const pinned = a.scheme !== "system";
  const toggle = tailwind ? TOGGLE_TW : indented(TOGGLE_STYLE, 8);
  const libImport = pinned ? "" : `import { ThemeScript, ThemeToggle } from "@forte-ui/react";\n`;
  const head = pinned ? "" : `      <head>\n        <ThemeScript />\n      </head>\n`;
  const toggleLine = pinned ? "" : `        ${toggle}\n`;
  /* On the Tailwind path `globals.css` is the layout's FIRST import, above
   * `@forte-ui/react`. Next emits CSS in import order, and the library's JS
   * pulls its own `@layer forte.*` blocks in with it — so with the library
   * imported first the compiled stylesheet OPENS with `@layer forte.components
   * { … }`, `forte` is pinned before the bridge's statement ever runs, and the
   * order ends up `forte, theme, base, …`: Preflight beats every component
   * and the starter's Button renders as bare text. Without Tailwind nothing
   * else declares layers and the guide's order (theme.css, then globals) is
   * the right one. */
  const imports = tailwind
    ? `${GLOBALS_FIRST_NOTE}import "./globals.css";\n${libImport}${font.importLine ? font.importLine + "\n" : ""}`
    : `${libImport}${font.importLine ? font.importLine + "\n" : ""}${themeImport}import "./globals.css";\n`;
  return `import type { Metadata } from "next";
${imports}
${font.consts ? font.consts + "\n\n" : ""}export const metadata: Metadata = {
  title: "${name}",
  description: "Scaffolded by create-forte-ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"${htmlAttrs(a)}${htmlClassAttr(font.fontVars)}${pinned ? "" : " suppressHydrationWarning"}>
${head}      <body>
${toggleLine}        {children}
      </body>
    </html>
  );
}
`;
}

export function nextPageTsx(name: string, tailwind: boolean): string {
  if (tailwind) {
    /* "use client" because of Card.Root: a server component receives a
     * client-reference proxy for the namespace, property access resolves to
     * undefined, and prerendering throws "Element type is invalid". The
     * flat-export page below needs no boundary. */
    return `"use client";

import { Button, Card } from "@forte-ui/react";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background text-foreground">
      <Card.Root variant="elevated" className="items-start gap-5">
        <h1 className="text-5 font-semibold">${name}</h1>
        <p className="text-2 text-foreground-muted">
          Utilities and components, one theme.
        </p>
        <Button>It works</Button>
      </Card.Root>
    </main>
  );
}
`;
  }
  return `import { Button } from "@forte-ui/react";

export default function Home() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <Button>It works</Button>
    </main>
  );
}
`;
}
