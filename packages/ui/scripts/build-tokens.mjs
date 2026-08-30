/**
 * Generates src/styles/tokens.color.css from the curve table in ramp.mjs.
 *
 * Run via `pnpm --filter @forte-ui/react tokens`. The output is committed
 * so consumers never need this script — it exists so the curve stays auditable
 * data rather than 100 lines of hand-copied near-identical declarations, and so
 * accent and secondary provably share one curve.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ACCENT_CURVE, GRAY_CURVE, FALLBACK_MIX } from "./ramp.mjs";

const OUT = fileURLToPath(new URL("../src/styles/tokens.color.css", import.meta.url));
const SCOPE = ":root,\n.forte-theme,\n[data-forte-theme]";

/** Ramps must be declared on the SAME selector that carries the scope hook.
 *  A `var()` inside an unregistered custom property is substituted at the
 *  element where the property is *declared* — so a descendant that only
 *  overrides `--forte-accent-seed` does not recompute a ramp declared on :root.
 *  Repeating the full ramp on `.forte-theme` / `[data-forte-theme]` is what makes
 *  per-subtree theming (and the docs' per-demo theme scopes) actually work. */
const rcs = (seed, body) => `oklch(from var(${seed}) ${body} h)`;

function fallbackRamp(name, seed) {
  const light = FALLBACK_MIX.map((s) =>
    `  --forte-${name}-${s.step}: color-mix(in oklab, var(${seed}) ${s.light}%, white);`);
  const solid = [
    `  --forte-${name}-9: var(${seed});`,
    `  --forte-${name}-10: color-mix(in oklab, var(${seed}) 92%, black);`,
    `  --forte-${name}-11: color-mix(in oklab, var(${seed}) 65%, black);`,
    `  --forte-${name}-12: color-mix(in oklab, var(${seed}) 30%, black);`,
  ];
  const dark = FALLBACK_MIX.map((s) =>
    `    --forte-${name}-${s.step}: color-mix(in oklab, var(${seed}) ${s.dark}%, #0a0a0b);`);
  const darkSolid = [
    `    --forte-${name}-10: color-mix(in oklab, var(${seed}) 88%, white);`,
    `    --forte-${name}-11: color-mix(in oklab, var(${seed}) 55%, white);`,
    `    --forte-${name}-12: color-mix(in oklab, var(${seed}) 22%, white);`,
  ];
  return `${SCOPE} {\n${[...light, ...solid].join("\n")}\n}\n\n` +
    `@media (prefers-color-scheme: dark) {\n  ${SCOPE.split("\n").join("\n  ")} {\n${[...dark, ...darkSolid].join("\n")}\n  }\n}\n`;
}

function realRamp(name, seed) {
  const lines = ACCENT_CURVE.map(({ step, light, dark }) =>
    `  --forte-${name}-${step}: light-dark(\n    ${rcs(seed, light)},\n    ${rcs(seed, dark)});`);
  lines.splice(8, 0, `  --forte-${name}-9: var(${seed});`);
  return `${SCOPE} {\n${lines.join("\n")}\n}\n`;
}

function grayRamp() {
  const plain = GRAY_CURVE.map(({ step, l }) =>
    `  --forte-gray-${step}: light-dark(oklch(${l.light} 0 0), oklch(${l.dark} 0 0));`);
  const tinted = GRAY_CURVE.map(({ step, l, t, r }) => {
    const c = (mode) => `min(calc(${t[mode]} * var(--forte-neutral-tint)), calc(c * ${r[mode]}))`;
    return `  --forte-gray-${step}: light-dark(\n    ${rcs("--forte-accent-seed", `${l.light} ${c("light")}`)},\n    ${rcs("--forte-accent-seed", `${l.dark} ${c("dark")}`)});`;
  });
  return { plain: `${SCOPE} {\n${plain.join("\n")}\n}\n`, tinted: `${SCOPE} {\n${tinted.join("\n")}\n}\n` };
}

const gray = grayRamp();
const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Source of truth: packages/ui/scripts/ramp.mjs
 * Regenerate with:  pnpm --filter @forte-ui/react tokens
 */\n`;

const css = `${banner}
@layer forte.tokens {
  /* -----------------------------------------------------------------------
   * Layer 0 — fallback for engines without relative colour syntax.
   * Hue cannot be extracted without it, so we mix toward white/black instead.
   * Degraded but coherent, and it keeps a brand seed recognisable.
   * --------------------------------------------------------------------- */
${indent(fallbackRamp("accent", "--forte-accent-seed"))}
${indent(fallbackRamp("secondary", "--forte-secondary-seed"))}
${indent(gray.plain)}

  /* -----------------------------------------------------------------------
   * Layer 1 — the real ramps.
   * The @supports test uses a LITERAL colour on purpose: a test containing
   * var() reports true unconditionally and would never guard anything.
   * light-dark() needs no separate guard — relative colour syntax shipped
   * later than light-dark() in every engine, so passing this test implies it.
   * --------------------------------------------------------------------- */
  @supports (color: oklch(from red l c h)) {
${indent(realRamp("accent", "--forte-accent-seed"), 4)}
${indent(realRamp("secondary", "--forte-secondary-seed"), 4)}
${indent(gray.tinted, 4)}
  }
}
`;

function indent(block, n = 2) {
  const pad = " ".repeat(n);
  return block.trimEnd().split("\n").map((l) => (l ? pad + l : l)).join("\n");
}

writeFileSync(OUT, css);
console.log(`wrote ${OUT} (${css.split("\n").length} lines)`);
