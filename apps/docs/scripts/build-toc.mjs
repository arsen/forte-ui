/**
 * Generates components/toc-registry.ts by extracting the h2/h3 headings out of
 * app/**\/page.mdx.
 *
 * The point is a rail that is in the SERVER HTML. `<Toc />` is rendered by the
 * root layout, and a layout cannot read its child page's module exports — so
 * the `tableOfContents` export that `@stefanprobst/rehype-extract-toc/mdx`
 * already puts on every page is unreachable from where the rail lives. A map
 * keyed by route is reachable: the rail looks itself up by `usePathname()`,
 * which resolves during prerender, so the headings ship in the static HTML
 * instead of appearing a frame after hydration.
 *
 * ---------------------------------------------------------------------------
 * Why this re-runs the MDX pipeline instead of reading the headings out
 * ---------------------------------------------------------------------------
 * The ids are not ours to invent. `rehype-slug` assigns them — including the
 * `-1` suffix on a repeat, which is why the Toggle page's `### Toggle` under
 * `## API reference` is `#toggle-1` and not `#toggle`. A regex over the `##`
 * lines would get that wrong on exactly the pages where a wrong id is hardest
 * to spot. Running the same plugins over the same bytes cannot disagree with
 * the page.
 *
 * Shiki is deliberately NOT in the chain here. It is the slow half of the real
 * pipeline and it highlights code blocks, which contain no headings.
 *
 * This is a SNAPSHOT, and unlike demos/registry.ts it is keyed on heading TEXT
 * rather than on the file set — so renaming a heading with the dev server
 * already running leaves it stale, where adding a demo at least fails loudly.
 * That staleness is survivable because the rail treats this file as a seed and
 * reconciles against the rendered DOM on mount; see components/toc.tsx.
 *
 *   pnpm --filter @dofortech/pretty-ui-docs toc
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import extractToc from "@stefanprobst/rehype-extract-toc";

const root = fileURLToPath(new URL("..", import.meta.url));
const appDir = join(root, "app");

/** Every page.mdx under app/, with the route it answers on. */
function findPages(dir, segments = []) {
  const found = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      // Route groups and private folders contribute no URL segment — `(marketing)`
      // is organisation, `_lib` is not a route at all.
      if (entry.startsWith("_")) continue;
      const isGroup = entry.startsWith("(") && entry.endsWith(")");
      found.push(...findPages(path, isGroup ? segments : [...segments, entry]));
    } else if (entry === "page.mdx") {
      found.push({ route: "/" + segments.join("/"), path });
    }
  }
  return found;
}

const processor = createProcessor({
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, extractToc],
});

/* h1 is the page title, not a section of the page, and h4 is detail inside a
 * section rather than a stop. The rail lists neither — this mirrors the
 * `h2[id], h3[id]` selector the DOM read uses, and the two have to agree or the
 * seed would be visibly replaced on mount. */
function flatten(nodes, out = []) {
  for (const node of nodes ?? []) {
    // No id means no anchor to link to — rehype-slug gives one to every
    // heading, so this only skips something genuinely unlinkable.
    if (node.id && (node.depth === 2 || node.depth === 3)) {
      out.push({ id: node.id, text: node.value, depth: node.depth });
    }
    flatten(node.children, out);
  }
  return out;
}

const pages = findPages(appDir);
const entries = [];
for (const page of pages) {
  const file = await processor.process(readFileSync(page.path, "utf8"));
  const headings = flatten(file.data.toc);
  // One entry is a link to where you already are, and the rail hides itself
  // below two. Emitting those rows would only make them flicker away on mount.
  if (headings.length >= 2) entries.push({ route: page.route, headings });
}
entries.sort((a, b) => a.route.localeCompare(b.route));

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:  pnpm --filter @dofortech/pretty-ui-docs toc
 *
 * The h2/h3 headings of every MDX page, keyed by route, so the "On this page"
 * rail can be server-rendered from a layout that cannot see the page. It is a
 * SEED, not the source of truth — components/toc.tsx reconciles it against the
 * rendered headings on mount, which is what absorbs a stale entry between a
 * heading rename and the next run of this script.
 */
export type TocHeading = { id: string; text: string; depth: 2 | 3 };

export const TOC: Record<string, TocHeading[]> = {
${entries
  .map(
    (entry) =>
      `  ${JSON.stringify(entry.route)}: [\n${entry.headings
        .map((h) => `    { id: ${JSON.stringify(h.id)}, text: ${JSON.stringify(h.text)}, depth: ${h.depth} },`)
        .join("\n")}\n  ],`,
  )
  .join("\n")}
};
`;

writeFileSync(join(root, "components", "toc-registry.ts"), out);
console.log(`toc: ${entries.length} pages, ${entries.reduce((n, e) => n + e.headings.length, 0)} headings`);
