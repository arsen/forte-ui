import { cpSync, mkdirSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { glob } from "glob";

const root = fileURLToPath(new URL(".", import.meta.url));

// Turn every source file into its own entry point so the published output
// mirrors the source structure (better tree-shaking + per-component CSS),
// instead of relying on `output.preserveModules`.
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
function copyGlobalStyles(): Plugin {
  return {
    name: "forte-ui:copy-global-styles",
    apply: "build",
    closeBundle() {
      const from = resolve(root, "src/styles");
      const to = resolve(root, "dist/styles");
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to, { recursive: true });
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
// (including the CSS-only and pure-helper chunks, which must NOT be marked).
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
    libInjectCss(),
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
    lib: {
      entry: resolve(root, "src/index.ts"),
      formats: ["es"],
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
