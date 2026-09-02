/**
 * Generates components/component-catalog.ts — the component index and the
 * sidebar's Components group — from the library's own catalogue.
 *
 * The list used to be typed out in `nav.tsx`: fifty-six rows, kept in step with
 * `src/components/` by hand and by memory. This reads
 * `@forte-ui/react/docs-data/components.json`, which docgen builds from the
 * `@summary` / `@category` doc comments it already refuses to build without —
 * so a component cannot reach npm uncatalogued, and now cannot reach the site
 * unlisted either.
 *
 * ---------------------------------------------------------------------------
 * The route of an entry, and why nothing here guesses
 * ---------------------------------------------------------------------------
 * Most entries own a page: `NavList` → `app/(docs)/components/nav-list/`, found
 * by kebab-casing the name. Four do not — `AlertDialog` is documented on
 * Dialog's page, `KbdGroup` on Kbd's — and they say so themselves, with
 * `@partOf` in the library source.
 *
 * That tag is the whole reason this script has no fallback. An earlier sketch
 * resolved a missing page by dropping to the component's source DIRECTORY,
 * which happens to be right for those four and is silently wrong for the case
 * that matters: a new component whose page nobody wrote would resolve to its
 * neighbour's page and look documented. So the rule is exactly two branches —
 * own page, or the page of the entry it declares itself part of — and anything
 * else fails the build.
 *
 * Anchors are derived rather than declared: `KbdGroup` links to
 * `/components/kbd/#kbdgroup` only if that id actually exists on the page.
 * The ids are rehype-slug's, so they are read the way build-toc.mjs reads
 * them — by running the same plugins over the same bytes — and a heading
 * renamed out from under one simply drops the anchor rather than pointing at
 * nothing.
 *
 *   pnpm --filter @forte-ui/docs catalog
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import extractToc from "@stefanprobst/rehype-extract-toc";

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "app/(docs)/components");

// Resolved through the package's own exports map, not a relative path across
// the workspace: this is the same file a consumer gets, and pointing at
// `../../packages/react/...` would work here and nowhere else.
const require = createRequire(import.meta.url);
const catalogue = require("@forte-ui/react/docs-data/components.json");

/** `NavList` → `nav-list`, `OTPField` → `otp-field`. */
const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

/** `NavList` → `Nav List`, `OTPField` → `OTP Field`. The second pass is what
 *  keeps an initialism together — without it the run of capitals splits into
 *  `O T P Field`. */
const titleize = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

const pages = new Set(
  readdirSync(componentsDir)
    .filter((entry) => statSync(join(componentsDir, entry)).isDirectory())
    .sort(),
);

/* Only the pages that host a `@partOf` entry are parsed — four of them, not
 * fifty-six. Shiki is left out for the same reason build-toc leaves it out: it
 * is the slow half of the pipeline and it highlights code, which holds no
 * headings. */
const processor = createProcessor({
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, extractToc],
});

const headingIds = async (route) => {
  const ids = new Set();
  const collect = (nodes) => {
    for (const node of nodes ?? []) {
      if (node.id) ids.add(node.id);
      collect(node.children);
    }
  };
  const file = await processor.process(readFileSync(join(componentsDir, route, "page.mdx"), "utf8"));
  collect(file.data.toc);
  return ids;
};

const errors = [];
const byName = new Map(catalogue.map((entry) => [entry.name, entry]));
const resolved = [];

for (const entry of catalogue) {
  const own = kebab(entry.name);

  if (!entry.partOf) {
    if (!pages.has(own)) {
      errors.push(
        `${entry.name}: no page at app/(docs)/components/${own}/ — write one, or tag the ` +
          `component @partOf <Component> in packages/react/src/components/${entry.dir}/ if it ` +
          `is meant to be documented on a sibling's page`,
      );
      continue;
    }
    resolved.push({ ...entry, route: own, anchor: null });
    continue;
  }

  // docgen has already checked that the target exists and is a sibling; what
  // it cannot know is whether that sibling has a page on THIS site.
  const host = byName.get(entry.partOf);
  const hostRoute = host && kebab(host.name);
  if (!pages.has(hostRoute)) {
    errors.push(`${entry.name}: @partOf ${entry.partOf}, which has no page at ${hostRoute}/`);
    continue;
  }
  const ids = await headingIds(hostRoute);
  const anchor = entry.name.toLowerCase();
  resolved.push({ ...entry, route: hostRoute, anchor: ids.has(anchor) ? anchor : null });
}

// The other direction. A page whose component was renamed or removed keeps
// answering on its URL and keeps its row in the sidebar, and nothing about the
// site looks wrong — this is the only place that notices.
for (const page of pages) {
  if (!resolved.some((entry) => entry.route === page && !entry.partOf)) {
    errors.push(`app/(docs)/components/${page}/: no catalogue entry resolves to it`);
  }
}

if (errors.length) {
  console.error("\ncatalog: component-catalog.ts cannot be generated:");
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

const href = (entry) => `/components/${entry.route}/${entry.anchor ? `#${entry.anchor}` : ""}`;
const lit = (value) => JSON.stringify(value);

const CATEGORIES = [...new Set(catalogue.map((entry) => entry.category))];

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:  pnpm --filter @forte-ui/docs catalog
 *
 * The library's component catalogue, resolved to routes on this site. Both the
 * index page and the sidebar's Components group render from it, so neither can
 * drift from what \`@forte-ui/react\` actually exports.
 */

/** The six buckets, in the order the library declares them. */
export const CATEGORIES = [
${CATEGORIES.map((c) => `  ${lit(c)},`).join("\n")}
] as const;

export type Category = (typeof CATEGORIES)[number];

export type CatalogEntry = {
  /** The exported name — \`NavList\`, \`OTPField\`. */
  name: string;
  /** That name as prose — \`Nav List\`, \`OTP Field\`. */
  title: string;
  href: string;
  category: Category;
  /** The one-line \`@summary\` from the component's doc comment. */
  summary: string;
  /**
   * Set when the entry heads no page of its own and is documented alongside
   * another — \`AlertDialog\` is \`partOf: "Dialog"\`. Its \`href\` then points
   * into that component's page.
   */
  partOf: string | null;
};

export const CATALOG: CatalogEntry[] = [
${resolved
  .map(
    (entry) =>
      `  { name: ${lit(entry.name)}, title: ${lit(titleize(entry.name))}, href: ${lit(href(entry))}, category: ${lit(entry.category)}, summary: ${lit(entry.summary)}, partOf: ${lit(entry.partOf)} },`,
  )
  .join("\n")}
];

/**
 * The sidebar's rows: one per PAGE, alphabetical.
 *
 * A separate array rather than a filter over \`CATALOG\`, and the duplication is
 * deliberate. \`nav.tsx\` is a client component, so whatever it imports ships to
 * the browser — a filter would reference \`CATALOG\` and drag all sixty
 * summaries into the bundle to render fifty-six links. Two independent consts
 * let the one nothing on the client reads be dropped.
 */
export const COMPONENT_PAGES: { title: string; href: string }[] = [
${resolved
  .filter((entry) => !entry.partOf)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((entry) => `  { title: ${lit(titleize(entry.name))}, href: ${lit(href(entry))} },`)
  .join("\n")}
];
`;

writeFileSync(join(root, "components", "component-catalog.ts"), out);
const hosted = resolved.filter((entry) => entry.partOf);
console.log(
  `catalog: ${resolved.length} entries, ${pages.size} pages` +
    ` (${hosted.filter((e) => e.anchor).length}/${hosted.length} hosted entries anchored)`,
);
