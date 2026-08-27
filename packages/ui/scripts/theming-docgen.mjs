/**
 * Extracts each component's theming tokens from its .module.css into
 * docs-data/theming.json — the CSS twin of docgen.mjs.
 *
 * The contract mirrors JSDoc on props: a doc comment (block comment whose
 * body starts with a second `*`) directly above a custom-property
 * declaration publishes that declaration. The name and the default value are
 * read from the declaration itself, so a renamed knob or a changed default
 * updates the docs table automatically — only the prose can go stale, and it
 * lives next to the declaration it describes. Plain `/* … *\/` comments stay
 * what they have always been here: private notes on why, invisible to the
 * docs.
 *
 * Each published token also records:
 *   part       the CSS Modules class of the rule that declares it ("root",
 *              "group", "label" …), so a page can render tokens per part or
 *              print a "Declared on" column.
 *   overrides  every OTHER declaration of the same property in the file,
 *              with its selector — how `[data-size]` / `[data-variant]`
 *              reassignments reach the docs without being hand-copied.
 *
 * Parsing is postcss, not regex, so the extraction survives formatting the
 * house style happens not to produce — a missing final semicolon, unusual
 * whitespace — instead of silently dropping a declaration.
 *
 *   pnpm --filter @dofortech/pretty-ui docgen
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "src/components");

/** Inside `@keyframes` a custom-property declaration is an animation frame,
 * not a default. */
function inKeyframes(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "atrule" && p.name.endsWith("keyframes")) return true;
  }
  return false;
}

/**
 * The doc comment for a declaration: the comment node directly above it —
 * postcss strips the comment markers, so `/** x *\/` arrives as text `* x` —
 * with nothing but its own indentation in between (a blank line breaks the
 * attachment, same as a JSDoc separated from its prop would).
 */
function docComment(decl) {
  const prev = decl.prev();
  if (prev?.type !== "comment" || !prev.text.startsWith("*")) return null;
  if (/\n\s*\n/.test(decl.raws.before ?? "")) return null;
  return prev.text
    .slice(1)
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** @type {Record<string, {name:string, tokens:any[]}>} */
const out = {};

for (const dir of readdirSync(componentsDir).sort()) {
  const full = join(componentsDir, dir);
  for (const f of readdirSync(full).sort()) {
    if (!f.endsWith(".module.css")) continue;
    const component = basename(f, ".module.css");
    const ast = postcss.parse(readFileSync(join(full, f), "utf8"), { from: join(full, f) });

    const decls = [];
    ast.walkDecls(/^--/, (decl) => {
      if (inKeyframes(decl) || decl.parent.type !== "rule") return;
      decls.push({
        name: decl.prop,
        value: decl.value.replace(/\s+/g, " ").trim(),
        selector: decl.parent.selector.replace(/\s+/g, " "),
        doc: docComment(decl),
      });
    });

    const tokens = decls
      .filter((d) => d.doc)
      .map((d) => ({
        name: d.name,
        value: d.value,
        description: d.doc,
        // The first class in the selector is the CSS Modules part. A
        // documented declaration belongs in a part's bare base rule, so this
        // is normally the whole selector minus the dot.
        part: (d.selector.match(/\.([A-Za-z][\w-]*)/) ?? [null, ""])[1],
        overrides: decls
          .filter((o) => o.name === d.name && o !== d)
          .map((o) => ({ selector: o.selector, value: o.value })),
      }));

    if (!tokens.length) continue;

    // Two doc comments on one property would silently shadow each other in
    // the docs — refuse rather than pick one.
    const seen = new Set();
    for (const t of tokens) {
      if (seen.has(t.name)) {
        console.error(`theming-docgen: ${f} documents ${t.name} twice`);
        process.exit(1);
      }
      seen.add(t.name);
    }

    out[component] = { name: component, tokens };
  }
}

const dest = join(root, "docs-data");
if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "theming.json"), JSON.stringify(out, null, 2));

console.log(`theming-docgen: ${Object.keys(out).length} components`);
for (const [k, v] of Object.entries(out)) console.log(`  ${k}: ${v.tokens.length} tokens`);
