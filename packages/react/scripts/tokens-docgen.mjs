/**
 * Extracts the GLOBAL design tokens from src/styles/*.css into
 * docs-data/tokens.json — the styles-directory sibling of theming-docgen.mjs,
 * which does the same for per-component knobs.
 *
 * The two differ on purpose in what they publish. theming.json is a curated
 * docs table: a knob appears only when someone wrote a doc comment for it.
 * tokens.json is an INVENTORY: every `--forte-*` declaration in the styles
 * directory appears, doc comment or not, because its consumers — a theme
 * editor rendering controls, drift checks against the CONTRIBUTING.md list —
 * need the complete set, and a token silently missing from the manifest is
 * the exact failure this file exists to end. A `/** … *\/` doc comment
 * directly above a declaration still becomes its `description`, same
 * contract as theming-docgen; plain comments stay private.
 *
 * Each token records:
 *   value          the base default: the first declaration carrying no
 *                  media/supports condition, in scan order — or, when every
 *                  declaration is conditional, the registration's
 *                  initial-value, then the first declaration outright.
 *                  Scan order puts tokens.css and the two generated files
 *                  first so a cross-file tie can only be won by the file
 *                  that defines the family, not the one that retunes it.
 *   family         the segment after `--forte-`, mechanically. Grouping only;
 *                  carries no semantics.
 *   declarations   every declaration of the property across the directory,
 *                  in scan order, with its selector, file, and any `media` /
 *                  `supports` condition — the `data-forte-radius` presets, the
 *                  dark-mode ramp, the forced-colors rewrites in a11y.css.
 *                  Order within the array is CSS source order, which is
 *                  meaningful: tokens.css layers ordered fallbacks under
 *                  `@supports` upgrades, and reordering would lie about
 *                  which one wins.
 *   registration   the `@property` rule from properties.css, when one
 *                  exists — syntax, inherits, initial-value. This is the
 *                  only typed information in the system; an editor picking a
 *                  control per token starts here before falling back to
 *                  guessing from the default value.
 *   generated      whether the base declaration lives in a generated file
 *                  (detected by the "GENERATED FILE" header, not a
 *                  hard-coded name list) — an editor must send users to
 *                  ramp.mjs / motion.mjs for those, not to the CSS.
 *
 * Parsing is postcss, not regex, for the same reason as theming-docgen: the
 * extraction has to survive formatting the house style happens not to
 * produce, instead of silently dropping a declaration.
 *
 *   pnpm --filter @forte-ui/react docgen
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const root = fileURLToPath(new URL("..", import.meta.url));
const stylesDir = join(root, "src/styles");

/* tokens.css, then the generated families, then everything else — see the
 * `value` note in the header. The directory is scanned rather than listed
 * exhaustively so a new styles file is inventoried the day it is added; only
 * the ORDER is pinned. */
const PRIORITY = ["tokens.css", "tokens.color.css", "motion.css"];
const files = [
  ...PRIORITY,
  ...readdirSync(stylesDir)
    .filter((f) => f.endsWith(".css") && !PRIORITY.includes(f))
    .sort(),
];

/** Inside `@keyframes` a custom-property declaration is an animation frame,
 * not a default. */
function inKeyframes(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "atrule" && p.name.endsWith("keyframes")) return true;
  }
  return false;
}

/** The `@media` / `@supports` conditions a node sits under. `@layer` is
 * deliberately not recorded: every declaration here is in forte.tokens
 * (a11y.css included — it retunes tokens), so it would be constant noise. */
function conditions(node) {
  const out = {};
  for (let p = node.parent; p; p = p.parent) {
    if (p.type !== "atrule") continue;
    if (p.name === "media") out.media = p.params;
    if (p.name === "supports") out.supports = p.params;
  }
  return out;
}

/**
 * The doc comment for a declaration: the comment node directly above it —
 * postcss strips the comment markers, so `/** x *\/` arrives as text `* x` —
 * with nothing but its own indentation in between (a blank line breaks the
 * attachment, same as in theming-docgen).
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

/** @type {Map<string, any>} declaration lists, keyed by token, in scan order */
const tokens = new Map();
/** @type {Map<string, any>} `@property` registrations from any styles file */
const registrations = new Map();
const generatedFiles = new Set();

for (const file of files) {
  const path = join(stylesDir, file);
  const css = readFileSync(path, "utf8");
  if (css.includes("GENERATED FILE")) generatedFiles.add(file);
  const ast = postcss.parse(css, { from: path });

  ast.walkDecls(/^--forte-/, (decl) => {
    if (inKeyframes(decl) || decl.parent.type !== "rule") return;
    const entry = tokens.get(decl.prop) ?? { declarations: [], description: null };
    entry.declarations.push({
      value: decl.value.replace(/\s+/g, " ").trim(),
      selector: decl.parent.selector.replace(/\s+/g, " "),
      file,
      ...conditions(decl),
    });
    // First doc comment wins; the base declaration comes first in scan order,
    // and a description repeated on an override would be the same prose twice.
    entry.description ??= docComment(decl);
    tokens.set(decl.prop, entry);
  });

  ast.walkAtRules("property", (at) => {
    const name = at.params.trim();
    if (!name.startsWith("--forte-")) return;
    const reg = {};
    at.walkDecls((d) => {
      if (d.prop === "syntax") reg.syntax = d.value.replace(/^["']|["']$/g, "");
      if (d.prop === "inherits") reg.inherits = d.value === "true";
      if (d.prop === "initial-value") reg.initialValue = d.value.replace(/\s+/g, " ").trim();
    });
    registrations.set(name, reg);
  });
}

/* A registered property nobody declares still exists — registration IS its
 * declaration (that is `--forte-direction`'s whole safety net). Seed an entry
 * so it cannot fall out of the inventory. */
for (const name of registrations.keys()) {
  if (!tokens.has(name)) tokens.set(name, { declarations: [], description: null });
}

const out = {};
for (const name of [...tokens.keys()].sort()) {
  const { declarations, description } = tokens.get(name);
  const base =
    declarations.find((d) => !d.media && !d.supports) ??
    (registrations.has(name) ? null : declarations[0]);
  out[name] = {
    name,
    family: name.slice("--forte-".length).split("-")[0],
    value: base?.value ?? registrations.get(name)?.initialValue ?? declarations[0]?.value,
    ...(description ? { description } : {}),
    ...(base ? { file: base.file, generated: generatedFiles.has(base.file) } : {}),
    ...(registrations.has(name) ? { registration: registrations.get(name) } : {}),
    declarations,
  };
}

const dest = join(root, "docs-data");
if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "tokens.json"), JSON.stringify(out, null, 2));

const families = new Map();
for (const t of Object.values(out)) families.set(t.family, (families.get(t.family) ?? 0) + 1);
console.log(`tokens-docgen: ${Object.keys(out).length} tokens in ${families.size} families`);
console.log(
  `  ${[...families.entries()].sort().map(([f, n]) => `${f}:${n}`).join(" ")}`,
);
