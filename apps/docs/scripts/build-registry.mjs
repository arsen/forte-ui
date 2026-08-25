/**
 * Generates demos/registry.ts by scanning demos/<component>/<name>.tsx.
 *
 * Explicit imports rather than a dynamic glob, for three reasons: the demos
 * stay type-checked, they stay tree-shakeable, and `import.meta.glob` is not
 * implemented in Next 16.2.10 (it compiles with hand-written ambient types and
 * then throws at prerender).
 *
 * Generating the file also means demos can be added in parallel without anyone
 * editing a shared barrel.
 *
 *   pnpm --filter @dofortech/pretty-ui-docs registry
 */
import { readdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const demosDir = join(root, "demos");

const entries = [];
for (const group of readdirSync(demosDir).sort()) {
  const dir = join(demosDir, group);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".tsx")) continue;
    const name = file.slice(0, -4);
    entries.push({ id: `${group}/${name}`, path: `./${group}/${name}`, file: `${group}/${file}` });
  }
}

const ident = (id) => "d_" + id.replace(/[^a-zA-Z0-9]/g, "_");

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:  pnpm --filter @dofortech/pretty-ui-docs registry
 *
 * Each demo is imported TWICE from the same path: once as a component (which
 * renders, and is type-checked) and once through the ?raw loader (the exact
 * bytes on disk). That is what makes the displayed code provably identical to
 * the running code.
 */
import type { ComponentType } from "react";

${entries.map((e) => `import ${ident(e.id)} from "${e.path}";\nimport ${ident(e.id)}_src from "${e.path}?raw";`).join("\n")}

export type DemoId =
${entries.map((e) => `  | "${e.id}"`).join("\n")};

export type Demo = { Component: ComponentType; source: string; file: string };

const REGISTRY: Record<DemoId, Demo> = {
${entries.map((e) => `  "${e.id}": { Component: ${ident(e.id)}, source: ${ident(e.id)}_src, file: "${e.file}" },`).join("\n")}
};

export function getDemo(id: DemoId): Demo {
  const demo = REGISTRY[id];
  // A missing demo is a build-time authoring mistake, and failing loudly here
  // is far better than rendering an empty box on the docs site.
  if (!demo) throw new Error("Unknown demo id: " + id);
  return demo;
}

export const DEMO_IDS = Object.keys(REGISTRY) as DemoId[];
`;

writeFileSync(join(demosDir, "registry.ts"), out);
console.log(`registry: ${entries.length} demos`);
