/**
 * Contrast harness for the generated ramps.
 *
 * Re-implements the CSS curve in JS and sweeps a grid of seeds, asserting the
 * pairs that carry real WCAG obligations. Run it after ANY edit to ramp.mjs —
 * the curve caps (notably accent-11's light cap of 0.490) were tuned against
 * this, and a plausible-looking tweak can quietly drop a hue below AA.
 *
 *   pnpm --filter @forte-ui/react check:contrast
 */
import { ACCENT_CURVE, GRAY_CURVE } from "./ramp.mjs";

/* ---- colour maths ------------------------------------------------------- */
function oklchToLinear(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l3 = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const raw = [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ];
  // Browsers naive-clip out-of-gamut values rather than gamut-mapping, so we do too.
  return raw.map((v) => Math.min(1, Math.max(0, v)));
}
/** True when sRGB cannot represent the colour, so the browser naive-clips it.
 *  Clipping distorts lightness badly, which is why out-of-gamut seeds are
 *  excluded below rather than silently dragging the worst case down. */
function outOfGamut(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l3 = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ].some((v) => v < -1e-4 || v > 1 + 1e-4);
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const CR = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };

/* ---- evaluate a curve expression the way CSS would ---------------------- */
const CLAMP = (lo, v, hi) => Math.min(Math.max(lo, v), hi);
function evalExpr(src, L, C) {
  const js = src
    .replaceAll("calc(", "(")
    .replaceAll("clamp(", "CLAMP(")
    .replaceAll("min(", "Math.min(")
    .replace(/\bl\b/g, "L")
    .replace(/\bc\b/g, "C");
  return Function("L", "C", "CLAMP", `"use strict";return ${js};`)(L, C, CLAMP);
}
/** Split "L_expr C_expr" on the top-level space (both halves may contain spaces). */
function splitPair(src) {
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") depth--;
    else if (src[i] === " " && depth === 0) return [src.slice(0, i), src.slice(i + 1)];
  }
  throw new Error(`cannot split curve entry: ${src}`);
}

function buildRamp(mode, seedL, seedC, seedH) {
  const out = {};
  for (const entry of ACCENT_CURVE) {
    const [lExpr, cExpr] = splitPair(entry[mode]);
    out[entry.step] = oklchToLinear(evalExpr(lExpr, seedL, seedC), evalExpr(cExpr, seedL, seedC), seedH);
  }
  out[9] = oklchToLinear(seedL, seedC, seedH);
  return out;
}
function buildGray(mode, seedC, seedH, tint = 1) {
  const out = {};
  for (const g of GRAY_CURVE) {
    out[g.step] = oklchToLinear(Number(g.l[mode]), Math.min(g.t[mode] * tint, seedC * g.r[mode]), seedH);
  }
  return out;
}

/* ---- the assertions ----------------------------------------------------- */
const WHITE = [1, 1, 1], BLACK = [0, 0, 0];
/* --------------------------------------------------------------------------
 * on-primary is produced by three different mechanisms, and they do NOT all
 * agree. The harness measures each against its own realistic floor:
 *
 *  exact      what contrast-color() computes (it judges the actually-painted,
 *             gamut-mapped colour) and what the Theme Studio emits as a literal
 *             after computing real WCAG maths in JS. Must clear AA.
 *
 *  threshold  the pure-CSS fallback for engines without contrast-color().
 *             It can only see the *specified* OKLCH lightness, but the
 *             white/black crossover shifts with hue AND chroma — saturated
 *             pinks cross near L=0.60, saturated greens near L=0.52. A single
 *             constant cannot track that, so this path is held to a lower,
 *             documented floor rather than pretending it reaches AA.
 * ------------------------------------------------------------------------ */
/* The crossover is not a constant: it rises for pinks/purples and falls for
 * greens, because OKLCH lightness weights the channels differently from WCAG
 * relative luminance. A first-order hue term tracks it well enough that the
 * fallback clears AA on its own. Coefficients fitted over 119,108 in-gamut
 * seeds; keep them in sync with tokens.css. */
const ON_BASE = 0.5675, ON_K_COS = 0.13, ON_K_SIN = -0.03;
const onPrimaryThreshold = (L, C, H) => {
  const h = (H * Math.PI) / 180;
  const threshold = ON_BASE + C * (ON_K_COS * Math.cos(h) + ON_K_SIN * Math.sin(h));
  return L < threshold ? WHITE : BLACK;
};
const onPrimaryExact = (painted) => (CR(WHITE, painted) >= CR(BLACK, painted) ? WHITE : BLACK);

const CHECKS = [
  { id: "on-primary exact",    min: 4.5, pair: (r) => CR(onPrimaryExact(r[9]), r[9]) },
  { id: "on-primary fallback", min: 4.5, pair: (r, g, oc) => CR(oc, r[9]) },
  { id: "accent-11 vs 1",   min: 4.5, pair: (r) => CR(r[11], r[1]) },
  { id: "accent-11 vs 2",   min: 4.5, pair: (r) => CR(r[11], r[2]) },
  { id: "accent-11 vs 3",   min: 4.5, pair: (r) => CR(r[11], r[3]) },
  { id: "accent-12 vs 1",   min: 7.0, pair: (r) => CR(r[12], r[1]) },
  { id: "accent-7 vs 1",    min: 1.4, pair: (r) => CR(r[7], r[1]) },
  { id: "gray-11 vs gray-1", min: 4.5, pair: (r, g) => CR(g[11], g[1]) },
  { id: "gray-12 vs gray-1", min: 7.0, pair: (r, g) => CR(g[12], g[1]) },
  { id: "gray-7 vs gray-1",  min: 1.4, pair: (r, g) => CR(g[7], g[1]) },
  /* The neutral tone of any soft surface — Alert's `soft`/`neutral` card is
   * gray-3 with muted body copy on it, and gray-3 is a whole step darker than
   * the gray-1 the pair above measures against. */
  { id: "gray-11 vs gray-3", min: 4.5, pair: (r, g) => CR(g[11], g[3]) },
];

/* --------------------------------------------------------------------------
 * Fixed pairs — the status colours.
 *
 * These hues are pinned in tokens.css and do not move with the seed, so they
 * are checked once rather than swept: there is no grid to sweep. They are here
 * anyway because nothing else would catch them. `--forte-warning-9` is a light
 * amber, so its `on-` token is near-BLACK while the other three are near-white,
 * and a plausible-looking edit that made them uniform would ship a 1.8:1 label
 * with no test to say so.
 *
 * Two families of pair:
 *
 *   on-X vs X-9    text on a SOLID status fill. What a solid Badge, and any
 *                  future solid status control, actually paints.
 *   X-11 on X-3    text on the TINTED fill — a soft Alert, a soft Badge, the
 *                  soft danger Button, and every status surface that follows
 *                  them.
 *
 * Keep the literals in sync with tokens.css; they are duplicated for the same
 * reason the curve is — this file re-implements what the CSS declares.
 * ------------------------------------------------------------------------ */
const NEAR_WHITE = [0.995, 0, 0], NEAR_BLACK = [0.145, 0, 0];
const FIXED = [
  { id: "on-danger vs danger-9",   min: 4.5, fg: NEAR_WHITE, bg: [0.552, 0.211, 24] },
  { id: "on-success vs success-9", min: 4.5, fg: NEAR_WHITE, bg: [0.545, 0.148, 152] },
  { id: "on-warning vs warning-9", min: 4.5, fg: NEAR_BLACK, bg: [0.812, 0.163, 82] },
  { id: "on-info vs info-9",       min: 4.5, fg: NEAR_WHITE, bg: [0.550, 0.158, 250] },
  /* Step 11 on step 3 — the pair every tinted status surface is built from,
   * and the one an Alert with `variant="soft"` paints its whole message in.
   * `light-dark()` makes each of these two colours, so each is two checks;
   * writing them out is the same duplication the block header admits to, for
   * the same reason — this file re-implements what the CSS declares. */
  { id: "danger-11 on -3 light",  min: 4.5, fg: [0.485, 0.196, 24],  bg: [0.944, 0.033, 17] },
  { id: "danger-11 on -3 dark",   min: 4.5, fg: [0.760, 0.140, 20],  bg: [0.272, 0.061, 17] },
  { id: "success-11 on -3 light", min: 4.5, fg: [0.475, 0.128, 152], bg: [0.946, 0.042, 155] },
  { id: "success-11 on -3 dark",  min: 4.5, fg: [0.792, 0.135, 152], bg: [0.268, 0.054, 155] },
  { id: "warning-11 on -3 light", min: 4.5, fg: [0.520, 0.118, 60],  bg: [0.955, 0.058, 85] },
  { id: "warning-11 on -3 dark",  min: 4.5, fg: [0.840, 0.140, 85],  bg: [0.276, 0.056, 85] },
  { id: "info-11 on -3 light",    min: 4.5, fg: [0.500, 0.140, 250], bg: [0.945, 0.026, 250] },
  { id: "info-11 on -3 dark",     min: 4.5, fg: [0.790, 0.110, 250], bg: [0.272, 0.065, 250] },
];

const FINE = process.argv.includes("--fine");
const fineC = Array.from({ length: 29 }, (_, i) => 0.02 + i * 0.01);
const fineL = Array.from({ length: 46 }, (_, i) => 0.45 + i * 0.01);
let failures = 0;
for (const mode of ["light", "dark"]) {
  const worst = new Map(CHECKS.map((c) => [c.id, { cr: Infinity, seed: null }]));
  let n = 0, skipped = 0;
  for (let H = 0; H < 360; H += FINE ? 2 : 5) {
    for (const C of (FINE ? fineC : [0.03, 0.06, 0.10, 0.14, 0.18, 0.22, 0.26, 0.30])) {
      for (const L of (FINE ? fineL : [0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.80, 0.90])) {
        // The seed IS accent-9, painted as-is. If sRGB cannot represent it the
        // browser clips, lightness shifts, and the pure-CSS threshold (which
        // can only see the *specified* L) may pick the wrong text colour.
        // Such seeds are outside the supported envelope by definition.
        if (outOfGamut(L, C, H)) { skipped++; continue; }
        n++;
        const ramp = buildRamp(mode, L, C, H);
        const gray = buildGray(mode, C, H);
        const oc = onPrimaryThreshold(L, C, H);
        for (const chk of CHECKS) {
          const cr = chk.pair(ramp, gray, oc);
          const cur = worst.get(chk.id);
          if (cr < cur.cr) worst.set(chk.id, { cr, seed: `oklch(${L} ${C} ${H})` });
        }
      }
    }
  }
  console.log(`\n${mode.toUpperCase()} — ${n} in-gamut seeds (${skipped} out-of-gamut skipped)`);
  for (const chk of CHECKS) {
    const { cr, seed } = worst.get(chk.id);
    const ok = cr >= chk.min;
    if (!ok) failures++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${chk.id.padEnd(19)} min ${cr.toFixed(2).padStart(6)}  (need ${chk.min})   worst: ${seed}`);
  }
}
console.log("\nFIXED — status colours (seed-independent)");
for (const chk of FIXED) {
  const cr = CR(oklchToLinear(...chk.fg), oklchToLinear(...chk.bg));
  const ok = cr >= chk.min;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${chk.id.padEnd(29)} min ${cr.toFixed(2).padStart(6)}  (need ${chk.min})`);
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll contrast checks passed.");
process.exit(failures ? 1 : 0);
