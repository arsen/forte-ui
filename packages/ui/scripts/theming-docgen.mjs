/**
 * Extracts each component's theming tokens from its .module.css into
 * docs-data/theming.json — the CSS twin of docgen.mjs.
 *
 * The contract mirrors JSDoc on props: a `/** … *\/` doc comment directly
 * above a custom-property declaration publishes that declaration. The name
 * and the default value are read from the declaration itself, so a renamed
 * knob or a changed default updates the docs table automatically — only the
 * prose can go stale, and it lives next to the declaration it describes.
 * Plain `/* … *\/` comments stay what they have always been here: private
 * notes on why, invisible to the docs.
 *
 * Each published token also records:
 *   part       the CSS Modules class of the rule that declares it ("root",
 *              "group", "label" …), so a page can render tokens per part or
 *              print a "Declared on" column.
 *   overrides  every OTHER declaration of the same property in the file,
 *              with its selector — how `[data-size]` / `[data-variant]`
 *              reassignments reach the docs without being hand-copied.
 *
 *   pnpm --filter @dofortech/pretty-ui docgen
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "src/components");

/**
 * Scans one stylesheet for custom-property declarations.
 *
 * A real CSS parser is overkill: the files are house-styled CSS Modules, and
 * all the scanner must not be fooled by is comments, quoted strings, and
 * nesting (declarations inside `@keyframes` are animation frames, not
 * defaults). Returns every declaration with its enclosing selector and, when
 * one directly precedes it, its doc comment.
 */
function scan(css) {
  const decls = [];
  /** Selector text for each open block, innermost last. */
  const stack = [];
  let pending = ""; // text since the last structural boundary
  let doc = null; // a `/**` comment with only whitespace seen since
  let i = 0;

  while (i < css.length) {
    const ch = css[i];

    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const body = css.slice(i + 2, end === -1 ? css.length : end);
      // `/**` marks a doc comment — but only the declaration directly under
      // it may claim it, so any body text is thrown away.
      doc = body.startsWith("*")
        ? body
            .slice(1)
            .split("\n")
            .map((l) => l.replace(/^\s*\*?\s?/, ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
        : null;
      i = end === -1 ? css.length : end + 2;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const close = css.indexOf(ch, i + 1);
      pending += css.slice(i, close === -1 ? css.length : close + 1);
      i = close === -1 ? css.length : close + 1;
      continue;
    }

    if (ch === "{") {
      stack.push(pending.trim());
      pending = "";
      doc = null;
      i++;
      continue;
    }

    if (ch === "}" ) {
      stack.pop();
      pending = "";
      doc = null;
      i++;
      continue;
    }

    if (ch === ";") {
      const m = pending.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
      const inKeyframes = stack.some((s) => s.startsWith("@keyframes"));
      if (m && stack.length && !inKeyframes) {
        decls.push({
          name: m[1],
          value: m[2].replace(/\s+/g, " ").trim(),
          selector: stack[stack.length - 1],
          doc,
        });
      }
      pending = "";
      doc = null;
      i++;
      continue;
    }

    // Something other than a declaration directly under the doc comment (a
    // selector, an at-rule, a normal property): the comment documents
    // nothing. `-` is exempt because `--pui-…` is what we hope comes next.
    if (doc !== null && !/\s/.test(ch) && pending.trim() === "" && ch !== "-") {
      doc = null;
    }
    pending += ch;
    i++;
  }

  return decls;
}

/** @type {Record<string, {name:string, tokens:any[]}>} */
const out = {};

for (const dir of readdirSync(componentsDir).sort()) {
  const full = join(componentsDir, dir);
  for (const f of readdirSync(full).sort()) {
    if (!f.endsWith(".module.css")) continue;
    const component = basename(f, ".module.css");
    const decls = scan(readFileSync(join(full, f), "utf8"));

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
