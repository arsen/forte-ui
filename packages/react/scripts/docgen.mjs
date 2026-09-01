/**
 * Extracts prop documentation from the TypeScript source into docs-data/props.json,
 * and the component catalogue into docs-data/components.md.
 *
 * Generated at build time in THIS package (not in the docs app) so the docs
 * build never pays the cost of constructing a TypeScript program, and so turbo
 * can cache the result.
 *
 *   pnpm --filter @forte-ui/react docgen
 *
 * The catalogue is the discovery layer the JSON files cannot be: props.json is
 * a 255-key lookup table, useless for "which component do I reach for?". Each
 * user-facing component carries `@summary` (a one-line when-to-use) and
 * `@category` in its doc comment; this script assembles them into one small
 * markdown file an agent can read whole, with each entry pointing at the exact
 * props.json / theming.json keys for the follow-up lookup. Both tags are
 * REQUIRED on every catalogue root — the build fails on a missing one, so a
 * new component cannot ship uncatalogued (the drift that killed the skill's
 * hand-written index). react-docgen-typescript strips block tags from the
 * description it returns, so the tags never leak into props.json.
 *
 * This script runs LAST in the docgen chain (see package.json) so the
 * theming.json it reads for the per-entry knob pointers is this run's output,
 * not the previous one's.
 */
import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, withCustomConfig } from "react-docgen-typescript";
import ts from "typescript";

/*
 * react-docgen-typescript collects destructured prop defaults per FILE, not per
 * component: its statement filter (`!!stmt.name`) drops every
 * `const X = forwardRef(...)` — a variable statement has no `.name` — so it
 * falls back to scanning ALL variable statements and merging their binding
 * defaults into one name-keyed map, last one wins. Two parts in one file
 * sharing a prop name then share a default: ScrollArea.Scrollbar's
 * `orientation = "vertical"` overwrote Root's `"both"` in props.json — and a
 * code-based default beats the prop's correct `@default` JSDoc tag, so the tag
 * could not repair it. Scope the extraction to the statement that actually
 * declares the component; anything this simpler walk cannot resolve (classes,
 * `X.defaultProps = ...`) falls back to the library's own behaviour.
 */
const extractDefaults = Parser.prototype.extractDefaultPropsFromComponent;
Parser.prototype.extractDefaultPropsFromComponent = function (symbol, source) {
  let stmt = symbol.valueDeclaration ?? symbol.declarations?.[0];
  while (stmt && stmt.parent && stmt.parent !== source) stmt = stmt.parent;
  const fn = stmt && this.getFunctionStatement(stmt);
  const param = fn?.parameters?.[0]?.name;
  if (param && ts.isObjectBindingPattern(param)) return this.getPropMap(param.elements);
  return extractDefaults.call(this, symbol, source);
};

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "src/components");

const parser = withCustomConfig(join(root, "tsconfig.json"), {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: true,
  // Deliberately NOT setting shouldExtractLiteralValuesFromEnum: with it, a
  // union like "solid" | "soft" is reported as an enum whose members must be
  // reassembled by hand. Without it the type arrives as the readable string
  // that we want to print verbatim.
  propFilter: (prop) => {
    // The usual `!prop.parent.fileName.includes('node_modules')` check still
    // lets hundreds of inherited DOM and Base UI props through. Keeping only
    // props DECLARED outside node_modules is what actually filters them.
    const decls = prop.declarations ?? [];
    return decls.length > 0 && decls.some((d) => !d.fileName.includes("node_modules"));
  },
});

const files = [];
for (const dir of readdirSync(componentsDir).sort()) {
  const full = join(componentsDir, dir);
  for (const f of readdirSync(full)) {
    if (f.endsWith(".tsx") && !f.endsWith(".test.tsx")) files.push(join(full, f));
  }
}

const parsed = parser.parse(files);

const stripQuotes = (v) => (typeof v === "string" ? v.replace(/^"(.*)"$/s, "$1") : v);

/** @type {Record<string, {name:string, description:string, props:any[]}>} */
const out = {};
for (const c of parsed) {
  const props = Object.values(c.props ?? {})
    .map((p) => ({
      name: p.name,
      type: p.type?.name ?? "unknown",
      required: Boolean(p.required),
      // A destructured default arrives unquoted ('md'); a value read from an
      // `@default "md"` tag arrives verbatim, quotes included. Strip the pair
      // so the prop table renders one convention wherever the value came from.
      defaultValue: stripQuotes(p.defaultValue?.value ?? null),
      description: (p.description ?? "").trim(),
    }))
    // Required props first, then alphabetical — the order a reader scans in.
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));

  if (!props.length) continue;
  out[c.displayName] = { name: c.displayName, description: (c.description ?? "").trim(), props };
}

const dest = join(root, "docs-data");
if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "props.json"), JSON.stringify(out, null, 2));

console.log(`docgen: ${Object.keys(out).length} components`);
for (const [k, v] of Object.entries(out)) console.log(`  ${k}: ${v.props.length} props`);

/* -------------------------------------------------------------------------
 * docs-data/components.md — the component catalogue
 * ---------------------------------------------------------------------- */

// The fixed bucket list, validated exactly: a typo'd @category must be a build
// error, not a silently unlisted component — same reason a var() typo is the
// library's most-documented trap.
const CATEGORIES = ["Actions", "Forms", "Overlays", "Navigation", "Content & layout", "Feedback"];

// Group every parsed component by its directory under src/components. The
// directory is the unit of enforcement: a dir may hold several catalogue
// roots (checkbox/ ships Checkbox AND CheckboxGroup), but a dir with none is
// a component that would be invisible to agents — fail on it.
const byDir = new Map();
for (const c of parsed) {
  const m = /src\/components\/([^/]+)\//.exec(c.filePath ?? "");
  if (!m) continue;
  if (!byDir.has(m[1])) byDir.set(m[1], []);
  byDir.get(m[1]).push(c);
}

const oneLine = (s) => (s ?? "").replace(/\s+/g, " ").trim();

const errors = [];
const entries = [];
for (const [dir, comps] of byDir) {
  const tagged = comps.filter((c) => c.tags && ("summary" in c.tags || "category" in c.tags));
  if (!tagged.length) {
    errors.push(`src/components/${dir}: no component carries @summary/@category — add them to its root doc comment`);
    continue;
  }
  for (const c of tagged) {
    const summary = oneLine(c.tags.summary);
    const category = oneLine(c.tags.category);
    if (!summary) errors.push(`${c.displayName}: has @category but no @summary`);
    if (!CATEGORIES.includes(category)) {
      errors.push(`${c.displayName}: @category "${category}" is not one of: ${CATEGORIES.join(", ")}`);
    }
    entries.push({ name: c.displayName, dir, summary, category, parts: [], hooks: [] });
  }

  // Attach every part to the catalogue root whose name is its longest prefix
  // (CheckboxGroupLabel → CheckboxGroup, not Checkbox). A part matching no
  // root (theme-toggle's ThemeScript) goes to the dir's shortest-named root —
  // the one entry a reader of that dir's docs would start from. Only names
  // that made it into props.json are listed: those are the keys the entry
  // exists to point at.
  const roots = entries.filter((e) => e.dir === dir);
  const fallback = roots.reduce((a, b) => (a.name.length <= b.name.length ? a : b));
  for (const c of comps) {
    if (!out[c.displayName]) continue;
    const owner =
      roots
        .filter((e) => c.displayName.startsWith(e.name))
        .sort((a, b) => b.name.length - a.name.length)[0] ?? fallback;
    owner.parts.push(c.displayName);
  }
}

// Hooks are not components, so the parser never sees them — read them off the
// barrel instead: every value export named use* belongs to the catalogue
// entry it is named after (useDialog → Dialog), else to the dir's root entry.
const indexSrc = ts.createSourceFile(
  "index.ts",
  readFileSync(join(root, "src/index.ts"), "utf8"),
  ts.ScriptTarget.Latest,
);
for (const stmt of indexSrc.statements) {
  if (!ts.isExportDeclaration(stmt) || stmt.isTypeOnly || !stmt.exportClause) continue;
  if (!ts.isNamedExports(stmt.exportClause)) continue;
  const dir = stmt.moduleSpecifier?.text?.replace("./components/", "");
  const roots = entries.filter((e) => e.dir === dir);
  if (!roots.length) continue;
  for (const el of stmt.exportClause.elements) {
    const name = el.name.text;
    if (!name.startsWith("use")) continue;
    const owner =
      roots
        .filter((e) => name.slice(3).startsWith(e.name))
        .sort((a, b) => b.name.length - a.name.length)[0] ??
      roots.reduce((a, b) => (a.name.length <= b.name.length ? a : b));
    owner.hooks.push(name);
  }
}

if (errors.length) {
  console.error("\ndocgen: components.md cannot be generated:");
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

// theming.json is fresh — this script runs after theming-docgen (package.json
// orders the chain that way) precisely so this read is never one run stale.
const themingKeys = new Set(Object.keys(JSON.parse(readFileSync(join(dest, "theming.json"), "utf8"))));

const lines = [
  "# @forte-ui/react — component catalogue",
  "",
  "<!-- GENERATED by scripts/docgen.mjs — do not edit by hand. The entries are",
  "     the @summary/@category doc comments in src/components/**/*.tsx; edit",
  "     those and run `pnpm --filter @forte-ui/react docgen`. -->",
  "",
  "Read this file whole when deciding which component to use. Then look up the",
  "exact installed API in the sibling files: `props.json` (every part's props,",
  "keyed by the part names listed here), `theming.json` (per-component CSS",
  "knobs, keyed as noted per entry), `tokens.json` (every global `--forte-*`",
  "token).",
  "",
  "A **compound** entry renders dot-notation parts — props.json key",
  "`SelectTrigger` renders as `<Select.Trigger>` — and the file rendering them",
  "needs `\"use client\"`. Flat entries render directly from React Server",
  "Components.",
];

for (const cat of CATEGORIES) {
  const inCat = entries.filter((e) => e.category === cat).sort((a, b) => a.name.localeCompare(b.name));
  if (!inCat.length) continue;
  lines.push("", `## ${cat}`, "");
  for (const e of inCat) {
    lines.push(`- **${e.name}** — ${e.summary}`);
    const facts = [];
    const selfOnly = e.parts.length === 1 && e.parts[0] === e.name;
    if (!out[e.name]) facts.push("compound");
    if (e.parts.length && !selfOnly) facts.push(`parts (props.json): ${e.parts.join(", ")}`);
    else if (selfOnly) facts.push(`props.json: ${e.name}`);
    if (themingKeys.has(e.name)) facts.push(`knobs: theming.json → ${e.name}`);
    if (e.hooks.length) facts.push(`hooks: ${e.hooks.join(", ")}`);
    if (facts.length) lines.push(`  ${facts.join(" · ")}`);
  }
}
lines.push("");

writeFileSync(join(dest, "components.md"), lines.join("\n"));
console.log(`docgen: catalogue — ${entries.length} entries across ${byDir.size} directories`);
