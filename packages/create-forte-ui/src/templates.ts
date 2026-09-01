/* The files the overlay writes, one builder per file. The content is the
 * getting-started guides' snippets, parameterised — the guides are the spec,
 * and keeping these byte-close to the published steps is what lets a reader
 * diff a scaffolded app against the walkthrough and see only their own
 * answers. When a guide step changes, change the builder with it.
 */

import { rootBlock, fontImports, htmlAttrs, nextFontSetup, type ThemeAnswers } from "./theme.js";

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
  const themeImport = tailwind ? "" : `import "@forte-ui/react/theme.css";\n`;
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

export function viteAppTsx(name: string, tailwind: boolean): string {
  if (tailwind) {
    return `import { Button, Card } from "@forte-ui/react";

export default function App() {
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

export default function App() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <Button>It works</Button>
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
`,
      rootBlock(a, "next-font"),
    );
  }
  return joinBlocks(rootBlock(a, "next-font"), BODY_RULE);
}

export function nextLayoutTsx(name: string, a: ThemeAnswers, tailwind: boolean): string {
  const font = nextFontSetup(a);
  /* Without Tailwind, `theme.css` is imported here, above globals — safe
   * because nothing else declares layers. With Tailwind it must NOT be:
   * globals.css imports it after the bridge (see the guide's ordering note),
   * and a second import here would pin the `forte` layer before `base`. */
  const themeImport = tailwind ? "" : `import "@forte-ui/react/theme.css";\n`;
  /* ThemeScript + suppressHydrationWarning are the guides' "Light and dark"
   * step: the script replays a stored light/dark choice onto <html> before
   * first paint, and the suppression covers the attribute it legitimately
   * adds. Harmless with nothing stored — the page just follows the OS. */
  return `import type { Metadata } from "next";
import { ThemeScript } from "@forte-ui/react";
${font.importLine ? font.importLine + "\n" : ""}${themeImport}import "./globals.css";

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
    <html lang="en"${htmlAttrs(a)}${font.htmlClassAttr} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
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
