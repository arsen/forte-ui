import { appendFileSync, cpSync, mkdirSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { glob } from "glob";

const root = fileURLToPath(new URL(".", import.meta.url));

// Turn every source file into its own entry point so the published output
// mirrors the source structure (better tree-shaking, and one `"use client"`
// boundary per component), instead of relying on `output.preserveModules`.
// The CSS does NOT follow the entries — see `cssCodeSplit` below.
const entries = Object.fromEntries(
  glob
    .sync("src/**/*.{ts,tsx}", {
      ignore: ["src/**/*.d.ts", "src/**/*.stories.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    })
    .map((file) => [
      relative("src", file.slice(0, file.length - extname(file).length)),
      fileURLToPath(new URL(file, import.meta.url)),
    ]),
);

// Global stylesheets (theme/reset) are not imported by any JS entry, so they
// would not be emitted by the bundler. Copy them verbatim into dist so
// consumers can `import "@forte-ui/react/theme.css"`.
//
// The published theme.css then gains one line the source file does not have:
// the `@import` of the bundled component CSS. It cannot live in
// `src/styles/theme.css`, because `components.css` exists only in dist —
// everything that serves the SOURCE (the check:* fixtures through Vite) would
// hit a dangling import, and those already get each component's CSS from the
// `.module.css` import in its own TSX. Appending after the copy keeps the
// documented one-line setup bringing in everything, with no new import for
// apps to add.
function copyGlobalStyles(): Plugin {
  return {
    name: "forte-ui:copy-global-styles",
    apply: "build",
    closeBundle() {
      const from = resolve(root, "src/styles");
      const to = resolve(root, "dist/styles");
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to, { recursive: true });
      appendFileSync(resolve(to, "theme.css"), '@import "./components.css";\n');
    },
  };
}

// Rollup strips top-of-file directives when it hoists modules into shared
// chunks, so `"use client"` written in the source never reaches `dist`. For a
// React library that is not cosmetic: without the directive, a Next.js App
// Router server component that imports us pulls the components into the RSC
// graph, where `React.createContext` does not exist, and the app crashes at
// module evaluation with an error that names React rather than this package.
//
// The directive is recorded per-module during `transform`, then re-emitted on
// any chunk that ended up containing one of those modules — so it lands on the
// real client boundaries rather than being blanket-prepended to everything
// (including the pure-helper chunks — clsx, cn — which must NOT be marked).
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: "forte-ui:preserve-use-client",
    transform(code, id) {
      if (/^\s*(["'])use client\1/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      const hasClient = Object.keys(chunk.modules).some((id) => clientModules.has(id));
      if (!hasClient || /^\s*(["'])use client\1/.test(code)) return null;
      return { code: `"use client";\n${code}`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.stories.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
      tsconfigPath: "./tsconfig.json",
    }),
    copyGlobalStyles(),
    preserveUseClient(),
  ],
  build: {
    target: "es2022",
    // Every component's CSS goes into ONE file, `dist/styles/components.css`,
    // which the published theme.css imports, and no JS chunk imports a
    // stylesheet. Per-chunk CSS (what `vite-plugin-lib-inject-css` used to wire
    // up) made the Next.js App Router emit a separate render-blocking
    // stylesheet for every client component a page reached — 20 to 34 per page
    // on boom.design — because Turbopack will not merge CSS across client
    // entries it cannot prove are order-independent (#165). Through theme.css
    // the rules land in the app's own CSS file instead.
    //
    // Concatenation order between components is safe to fix arbitrarily: it
    // was load order before, which no two pages agreed on. Every rule is in
    // `@layer forte.*`, and the few that reach into another component —
    // InputGroup into Button, Button into Avatar, Menu into Kbd — outrank the
    // target's own rules on specificity, never on order.
    cssCodeSplit: false,
    lib: {
      entry: resolve(root, "src/index.ts"),
      formats: ["es"],
      cssFileName: "components",
    },
    rollupOptions: {
      // tailwind-merge is an optional peer: bundling it would defeat the point
      // of letting the app's own copy (and version) win.
      external: ["react", "react-dom", "react/jsx-runtime", "tailwind-merge", /^@base-ui\/react/],
      input: entries,
      output: {
        assetFileNames: "styles/[name][extname]",
        entryFileNames: "[name].js",
      },
      // We re-emit these ourselves in preserveUseClient(), so Rollup's warning
      // about dropping them is noise that would hide real warnings.
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
