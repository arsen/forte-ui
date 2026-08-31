/**
 * Extracts prop documentation from the TypeScript source into docs-data/props.json.
 *
 * Generated at build time in THIS package (not in the docs app) so the docs
 * build never pays the cost of constructing a TypeScript program, and so turbo
 * can cache the result.
 *
 *   pnpm --filter @forte-ui/react docgen
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync } from "node:fs";
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
