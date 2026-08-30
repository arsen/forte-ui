import path from "node:path";
import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const local = (p: string) => path.join(baseDir, p);

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // The library ships compiled ESM + CSS, but transpiling keeps Next's CSS
  // handling consistent for its side-effect stylesheet imports.
  transpilePackages: ["@forte-ui/react"],
  turbopack: {
    // Stated, not inferred.
    //
    // Next infers the workspace root by walking up for a lockfile, and it walks
    // PAST the first one it finds. A git worktree created under `.claude/` sits
    // inside the main checkout, so two `pnpm-workspace.yaml` files are in the
    // ancestry and the outer one — the main checkout — wins. That is the wrong
    // root for this build: the sources and `node_modules` it should be watching
    // are the worktree's, not the ones a sibling branch happens to have.
    //
    // Derived from this file rather than hardcoded, so it is right in the main
    // checkout and in every worktree without either knowing about the other.
    root: path.join(baseDir, "..", ".."),
    rules: {
      // A rule glob with no "/" matches on FILENAME only, so "*.tsx" matches at
      // any depth. `{ not: "foreign" }` keeps the loader away from node_modules.
      // The rule fires only for imports carrying an explicit `?raw` query, so
      // ordinary imports of the same file are untouched.
      "*.tsx": {
        condition: { all: [{ not: "foreign" }, { query: "?raw" }] },
        loaders: ["./loaders/raw-source-loader.cjs"],
        as: "*.js",
      },
      "*.css": {
        condition: { all: [{ not: "foreign" }, { query: "?raw" }] },
        loaders: ["./loaders/raw-source-loader.cjs"],
        as: "*.js",
      },
    },
  },
};

// MDX plugins must be STRINGS with serializable options — functions cannot
// cross into Turbopack's Rust side. A relative string resolves against
// @next/mdx's own package rather than ours, so absolute paths are required.
export default createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [
      ["rehype-slug", {}],
      [local("mdx-plugins/rehype-shiki.mjs"), {}],
      ["@stefanprobst/rehype-extract-toc", {}],
      ["@stefanprobst/rehype-extract-toc/mdx", {}],
    ],
  },
})(nextConfig);
