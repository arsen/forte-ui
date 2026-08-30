/**
 * The forte-ui colour curve — the single source of truth for every ramp.
 *
 * Step semantics follow the Radix Colors convention:
 *   1-2   app / subtle background
 *   3-5   component background: normal / hover / active
 *   6-8   borders: subtle / normal / strong
 *   9-10  solid fill: normal / hover      (9 IS the seed, untouched)
 *   11    low-contrast text (AA on steps 1-3)
 *   12    high-contrast text
 *
 * Two rules that are easy to get wrong and fail *silently*:
 *
 *   1. Inside `oklch(from ...)`, `l` is 0-1 and `c` is 0-0.4 — NOT the 0-100
 *      range of `lch()`. MDN teaches relative-colour maths with `lch()`
 *      examples; copying those numbers here yields values ~100x too large,
 *      which clamp to L=1 and produce an all-white ramp with no error.
 *
 *   2. Hue arithmetic must be UNITLESS: `calc(h + 150)`, never
 *      `calc(h + 150deg)`. The `deg` form is rejected outright, which makes
 *      the declaration invalid at computed-value time and the element falls
 *      back to inheriting `color`.
 *
 * Chroma is expressed as `min(<absolute cap>, calc(c * <ratio>))` so that a
 * neon seed cannot blow out the subtle steps, while a nearly-grey seed still
 * degrades to a clean grey ramp instead of a muddy one.
 */

/** @type {{step:number, light:string, dark:string}[]} */
export const ACCENT_CURVE = [
  { step: 1,  light: "0.993 min(0.010, calc(c * 0.04))", dark: "0.178 min(0.018, calc(c * 0.10))" },
  { step: 2,  light: "0.978 min(0.022, calc(c * 0.09))", dark: "0.213 min(0.028, calc(c * 0.14))" },
  { step: 3,  light: "0.954 min(0.043, calc(c * 0.17))", dark: "0.271 min(0.060, calc(c * 0.32))" },
  { step: 4,  light: "0.930 min(0.062, calc(c * 0.25))", dark: "0.313 min(0.084, calc(c * 0.45))" },
  { step: 5,  light: "0.899 min(0.078, calc(c * 0.33))", dark: "0.363 min(0.098, calc(c * 0.53))" },
  { step: 6,  light: "0.860 min(0.092, calc(c * 0.42))", dark: "0.424 min(0.104, calc(c * 0.56))" },
  { step: 7,  light: "0.810 min(0.110, calc(c * 0.52))", dark: "0.503 min(0.112, calc(c * 0.60))" },
  { step: 8,  light: "0.745 min(0.140, calc(c * 0.66))", dark: "0.606 min(0.130, calc(c * 0.70))" },
  // 9 is the seed itself — handled separately so the brand colour is exact.
  { step: 10, light: "clamp(0.30, calc(l - 0.035), 0.95) c",
              dark:  "clamp(0.30, calc(l + 0.05), 0.93) min(0.17, calc(c * 0.90))" },
  // The light cap of 0.490 is tuned, not guessed: at 0.53 the worst case
  // (saturated cyan / teal / lime seeds) measured 4.01:1 and failed AA.
  { step: 11, light: "clamp(0.32, calc(l - 0.09), 0.490) min(0.15, calc(c * 0.80))",
              dark:  "clamp(0.76, calc(l + 0.16), 0.92) min(0.14, calc(c * 0.72))" },
  { step: 12, light: "clamp(0.20, calc(l * 0.5), 0.34) min(0.09, calc(c * 0.50))",
              dark:  "clamp(0.88, calc(l + 0.28), 0.96) min(0.065, calc(c * 0.34))" },
];

/**
 * Neutral curve. Lightness values are the existing, measured forte-ui greys —
 * only a hue-matched sliver of chroma is added, scaled by --forte-neutral-tint.
 * The tint cap rises through the mid steps and falls again at the text tiers so
 * body copy never reads as coloured. ChromaΔ is small enough that lightness —
 * and therefore the measured contrast of every neutral pair — is unchanged.
 */
export const GRAY_CURVE = [
  { step: 1,  l: { light: "0.994", dark: "0.178" }, t: { light: 0.002, dark: 0.004 }, r: { light: 0.02, dark: 0.03 } },
  { step: 2,  l: { light: "0.982", dark: "0.213" }, t: { light: 0.004, dark: 0.006 }, r: { light: 0.03, dark: 0.04 } },
  { step: 3,  l: { light: "0.957", dark: "0.252" }, t: { light: 0.006, dark: 0.009 }, r: { light: 0.04, dark: 0.05 } },
  { step: 4,  l: { light: "0.935", dark: "0.284" }, t: { light: 0.008, dark: 0.011 }, r: { light: 0.05, dark: 0.06 } },
  { step: 5,  l: { light: "0.914", dark: "0.314" }, t: { light: 0.009, dark: 0.012 }, r: { light: 0.05, dark: 0.06 } },
  { step: 6,  l: { light: "0.891", dark: "0.350" }, t: { light: 0.010, dark: 0.013 }, r: { light: 0.06, dark: 0.07 } },
  { step: 7,  l: { light: "0.858", dark: "0.401" }, t: { light: 0.011, dark: 0.014 }, r: { light: 0.06, dark: 0.07 } },
  { step: 8,  l: { light: "0.797", dark: "0.487" }, t: { light: 0.012, dark: 0.014 }, r: { light: 0.07, dark: 0.07 } },
  { step: 9,  l: { light: "0.646", dark: "0.537" }, t: { light: 0.010, dark: 0.012 }, r: { light: 0.06, dark: 0.06 } },
  { step: 10, l: { light: "0.610", dark: "0.585" }, t: { light: 0.008, dark: 0.010 }, r: { light: 0.05, dark: 0.05 } },
  { step: 11, l: { light: "0.503", dark: "0.770" }, t: { light: 0.006, dark: 0.007 }, r: { light: 0.04, dark: 0.04 } },
  { step: 12, l: { light: "0.242", dark: "0.949" }, t: { light: 0.004, dark: 0.005 }, r: { light: 0.03, dark: 0.03 } },
];

/** Percentages for the no-relative-colour fallback ramp (mix toward white/black). */
export const FALLBACK_MIX = [
  { step: 1,  light: 3,  dark: 8  }, { step: 2,  light: 6,  dark: 12 },
  { step: 3,  light: 12, dark: 22 }, { step: 4,  light: 18, dark: 30 },
  { step: 5,  light: 25, dark: 38 }, { step: 6,  light: 33, dark: 48 },
  { step: 7,  light: 45, dark: 62 }, { step: 8,  light: 62, dark: 80 },
];
