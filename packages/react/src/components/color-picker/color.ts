/*
 * Color maths for ColorPicker.
 *
 * No React, no DOM: this file is pure functions, so it can be unit-reasoned
 * about and so the component never has to think in more than one color space
 * at a time.
 *
 * HSVA is the INTERNAL model, and that choice is load-bearing rather than
 * traditional. A color string cannot carry hue once saturation or value
 * reaches zero — `#000000` is every hue at once — so a picker that kept only
 * the string would snap its hue slider back to red the moment the user dragged
 * the area into the black corner, and lose the hue again on the way out. HSV
 * keeps the three axes independent, which is exactly what a canvas plus a hue
 * rail is a direct manipulation of.
 *
 * sRGB is the gamut. Every color the picker can produce is expressible as
 * eight-bit RGB, which is what makes `hex` an honest output format and what
 * lets the area's two gradients be a complete picture of the space. An
 * `oklch()` input outside that gamut is mapped INTO it (see `oklchToRgba`)
 * rather than clipped per channel, so the hue the author asked for survives.
 *
 * Ranges, which are the easiest thing here to get wrong silently:
 *   h  0-360   (degrees, wrapped)
 *   s  0-1     v 0-1     a 0-1
 *   r  0-255   g 0-255   b 0-255   — kept as floats, rounded only on output
 *   L  0-1     C  0-0.4-ish        — OKLCH, the CSS Color 4 ranges, NOT lch()'s
 */

/** The notations `ColorPicker` can read back and write out. */
export type ColorPickerFormat = "hex" | "rgb" | "hsl" | "oklch";

/** The picker's internal model. `h` is degrees; `s`, `v` and `a` are 0-1. */
export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

/** Eight-bit sRGB with an alpha channel. Channels are floats until output. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min: number, max: number) =>
  n < min ? min : n > max ? max : n;

/* `%` alone keeps the sign of a negative operand, so `-30 % 360` is -30 and a
 * hue dragged below zero would land outside every gradient stop. */
const wrapHue = (h: number) => ((h % 360) + 360) % 360;

/** Trailing zeros make a readout jitter as it updates; `+n.toFixed()` drops them. */
const round = (n: number, digits: number) => Number(n.toFixed(digits));

/* -------------------------------------------------------------------------
 * HSV <-> RGB
 * ---------------------------------------------------------------------- */

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const c = v * s;
  const sector = wrapHue(h) / 60;
  const x = c * (1 - Math.abs((sector % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (sector < 1) [r, g, b] = [c, x, 0];
  else if (sector < 2) [r, g, b] = [x, c, 0];
  else if (sector < 3) [r, g, b] = [0, c, x];
  else if (sector < 4) [r, g, b] = [0, x, c];
  else if (sector < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}

export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }

  return { h: wrapHue(h), s: max === 0 ? 0 : d / max, v: max, a };
}

/* -------------------------------------------------------------------------
 * HSV <-> HSL
 *
 * Direct, rather than by way of RGB. The two share a hue axis and the
 * conversion is two lines, so routing it through eight-bit RGB would only add
 * a quantisation step between the picker's state and its own readout.
 * ---------------------------------------------------------------------- */

export function hsvaToHsl({ h, s, v }: Hsva): { h: number; s: number; l: number } {
  const l = v * (1 - s / 2);
  /* At pure black or pure white the denominator is zero and saturation is
   * genuinely undefined; CSS spells that 0%. */
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l };
}

export function hslToHsv(h: number, s: number, l: number, a: number): Hsva {
  const v = l + s * Math.min(l, 1 - l);
  return { h, s: v === 0 ? 0 : 2 * (1 - l / v), v, a };
}

/* -------------------------------------------------------------------------
 * sRGB <-> OKLCH
 *
 * The matrices are Björn Ottosson's original OKLab derivation. Two traps:
 *
 *   1. The transfer function is the sRGB one, not a plain 2.2 gamma. Using
 *      gamma alone shifts every dark color by a visible amount that looks
 *      like a rounding bug rather than a wrong formula.
 *   2. Inside CSS's `oklch()`, `l` is 0-1 and `c` is roughly 0-0.4 — NOT the
 *      0-100 of `lch()`. The same warning is in `scripts/ramp.mjs`, and it is
 *      here for the same reason: the wrong range clamps to white without
 *      erroring.
 * ---------------------------------------------------------------------- */

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const toGamma = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;

function linearSrgbToOklab(r: number, g: number, b: number) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinearSrgb(L: number, A: number, B: number) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

export function rgbaToOklch({ r, g, b, a }: Rgba): {
  l: number;
  c: number;
  h: number;
  a: number;
} {
  const { L, a: A, b: B } = linearSrgbToOklab(
    toLinear(r / 255),
    toLinear(g / 255),
    toLinear(b / 255),
  );
  const c = Math.hypot(A, B);
  /* Below this the hue is numerical noise — two grays a rounding error apart
   * would print hues 180° apart. CSS says `none` for an undefined hue; 0 is
   * the value `none` computes to and the one that round-trips. */
  const h = c < 1e-6 ? 0 : wrapHue((Math.atan2(B, A) * 180) / Math.PI);
  return { l: L, c, h, a };
}

const EPSILON = 1e-5;

function inSrgbGamut(L: number, C: number, H: number) {
  const rad = (H * Math.PI) / 180;
  const { r, g, b } = oklabToLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
  return (
    r >= -EPSILON &&
    r <= 1 + EPSILON &&
    g >= -EPSILON &&
    g <= 1 + EPSILON &&
    b >= -EPSILON &&
    b <= 1 + EPSILON
  );
}

/**
 * OKLCH to sRGB, gamut-mapped rather than clipped.
 *
 * `oklch(0.7 0.4 30)` names a color no screen in this gamut can show. Clipping
 * each channel at 0 and 1 — the obvious one-liner — changes the hue as well as
 * the chroma, so an author's out-of-gamut orange arrives as a different color
 * family. Reducing chroma toward the achromatic axis at constant L and H keeps
 * the hue the author asked for and gives up only the saturation the display
 * could not have shown anyway. Sixteen bisection steps put the answer within
 * ~6e-6 of the gamut boundary, well under an eight-bit step.
 */
export function oklchToRgba(l: number, c: number, h: number, a: number): Rgba {
  const L = clamp(l, 0, 1);
  let C = Math.max(c, 0);

  if (!inSrgbGamut(L, C, h)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 16; i += 1) {
      const mid = (lo + hi) / 2;
      if (inSrgbGamut(L, mid, h)) lo = mid;
      else hi = mid;
    }
    C = lo;
  }

  const rad = (h * Math.PI) / 180;
  const linear = oklabToLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));

  /* The bisection lands just inside the boundary, so this clamp is only
   * mopping up float error — never a color decision. */
  return {
    r: clamp(toGamma(linear.r), 0, 1) * 255,
    g: clamp(toGamma(linear.g), 0, 1) * 255,
    b: clamp(toGamma(linear.b), 0, 1) * 255,
    a,
  };
}

/* -------------------------------------------------------------------------
 * Contrast
 * ---------------------------------------------------------------------- */

/**
 * Whether black or white reads better ON this color — for the tick drawn
 * inside a selected swatch and the ring around the area's thumb, both of which
 * sit on color the user chose and nothing else can be known about.
 *
 * Alpha is ignored on purpose: what a translucent swatch is composited over is
 * whatever the checkerboard and the panel happen to be, which is not something
 * this function can see, and the answer only changes near the middle of the
 * ramp where either choice is legible.
 */
export function onColor({ r, g, b }: Rgba): "black" | "white" {
  const L =
    0.2126 * toLinear(r / 255) +
    0.7152 * toLinear(g / 255) +
    0.0722 * toLinear(b / 255);
  /* The crossover for a 4.5:1 target against both ends, not 0.5: white text
   * needs a darker background than black text needs a light one. */
  return L > 0.36 ? "black" : "white";
}

/* -------------------------------------------------------------------------
 * Parsing
 * ---------------------------------------------------------------------- */

/**
 * One numeric component. Percentages resolve against `full`; `none` is CSS
 * Color 4's "this channel is missing", which computes to zero everywhere the
 * picker uses it.
 */
function component(token: string, full: number): number | null {
  if (token === "none") return 0;
  if (token.endsWith("%")) {
    const n = Number(token.slice(0, -1));
    return Number.isFinite(n) ? (n / 100) * full : null;
  }
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
}

/** A hue, in any of CSS's four angle units. Bare numbers are degrees. */
function angle(token: string): number | null {
  if (token === "none") return 0;
  const match = /^(-?[\d.]+(?:e-?\d+)?)(deg|rad|grad|turn)?$/i.exec(token);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  switch (match[2]?.toLowerCase()) {
    case "rad":
      return (n * 180) / Math.PI;
    case "grad":
      return n * 0.9;
    case "turn":
      return n * 360;
    default:
      return n;
  }
}

function hexToRgba(hex: string): Rgba | null {
  const h = hex.slice(1);
  const short = h.length === 3 || h.length === 4;
  const long = h.length === 6 || h.length === 8;
  if ((!short && !long) || !/^[\da-f]+$/i.test(h)) return null;

  const size = short ? 1 : 2;
  const at = (i: number) => {
    const part = h.slice(i * size, i * size + size);
    /* `#abc` is `#aabbcc`, not `#0a0b0c` — doubling the digit is what keeps
     * `#fff` white instead of very nearly black. */
    return parseInt(short ? part + part : part, 16);
  };

  const alphaIndex = short ? 4 : 8;
  return {
    r: at(0),
    g: at(1),
    b: at(2),
    a: h.length === alphaIndex ? at(3) / 255 : 1,
  };
}

/**
 * Reads a CSS color string into the picker's model.
 *
 * Accepts `#hex` (3, 4, 6 or 8 digits), `rgb()`/`rgba()`, `hsl()`/`hsla()`,
 * `oklch()`, `oklab()` and the keyword `transparent`, in both the legacy
 * comma-separated and the modern space-separated forms. Returns `null` for
 * anything else — including named colors, which would need the full 148-entry
 * CSS table to be shipped in every bundle that touches the picker, for input
 * the picker itself never produces.
 *
 * `null` is a normal outcome, not an error: it is what the text field's
 * `data-invalid` state is driven by while a value is half-typed.
 */
export function parseColor(input: string): Hsva | null {
  const text = input.trim().toLowerCase();
  if (text === "") return null;

  /* Not a color so much as the absence of one, but it is what an author
   * writes for a cleared swatch, and it round-trips to `#00000000`. */
  if (text === "transparent") return { h: 0, s: 0, v: 0, a: 0 };

  if (text.startsWith("#")) {
    const rgba = hexToRgba(text);
    return rgba ? rgbaToHsva(rgba) : null;
  }

  const fn = /^([a-z]+)\(([^()]*)\)$/.exec(text);
  if (!fn) return null;

  const name = fn[1] ?? "";
  /* The slash form separates alpha from the channels; the legacy form uses a
   * fourth comma instead, which falls out of the comma-to-space normalization
   * below as a fourth token. */
  const slash = (fn[2] ?? "").split("/");
  if (slash.length > 2) return null;
  const tokens = (slash[0] ?? "")
    .trim()
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const alphaToken = slash[1]?.trim() ?? (tokens.length === 4 ? tokens[3] : null);

  const alpha = alphaToken == null ? 1 : component(alphaToken, 1);
  if (alpha === null) return null;
  const a = clamp(alpha, 0, 1);

  /* Three channels, always. Checking the tokens rather than the length is what
   * satisfies `noUncheckedIndexedAccess` without an assertion. */
  const [t0, t1, t2] = tokens;
  if (t0 === undefined || t1 === undefined || t2 === undefined) return null;

  switch (name) {
    case "rgb":
    case "rgba": {
      /* `rgb(50% 0% 0%)` and `rgb(128 0 0)` are both legal and mean different
       * things per token, so the scale is decided per token rather than per
       * function. */
      const r = component(t0, 255);
      const g = component(t1, 255);
      const b = component(t2, 255);
      if (r === null || g === null || b === null) return null;
      return rgbaToHsva({
        r: clamp(r, 0, 255),
        g: clamp(g, 0, 255),
        b: clamp(b, 0, 255),
        a,
      });
    }
    case "hsl":
    case "hsla": {
      const h = angle(t0);
      const s = component(t1, 1);
      const l = component(t2, 1);
      if (h === null || s === null || l === null) return null;
      return hslToHsv(wrapHue(h), clamp(s, 0, 1), clamp(l, 0, 1), a);
    }
    case "oklch": {
      const l = component(t0, 1);
      const c = component(t1, 0.4);
      const h = angle(t2);
      if (l === null || c === null || h === null) return null;
      return rgbaToHsva(oklchToRgba(l, c, wrapHue(h), a));
    }
    case "oklab": {
      const l = component(t0, 1);
      const A = component(t1, 0.4);
      const B = component(t2, 0.4);
      if (l === null || A === null || B === null) return null;
      const c = Math.hypot(A, B);
      const h = c < 1e-6 ? 0 : wrapHue((Math.atan2(B, A) * 180) / Math.PI);
      return rgbaToHsva(oklchToRgba(l, c, h, a));
    }
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------
 * Serialising
 * ---------------------------------------------------------------------- */

const hexPair = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, "0");

/**
 * The picker's model as a CSS color string.
 *
 * Alpha is omitted when the color is fully opaque, in every format. That is
 * the one rule worth stating out loud: it means a picker whose alpha rail was
 * never touched — or never rendered — emits `#7c3aed` and not `#7c3aedff`, so
 * an author who does not want alpha simply never gets any, without a prop
 * saying so. `rgb()` also stays `rgb()` rather than becoming `rgba()`, which
 * CSS Color 4 made an alias of it.
 *
 * Precision is set by what each notation can hold, not by taste: `hex` is
 * eight-bit and exact, while `hsl` and `oklch` are rounded to the point where
 * re-parsing lands on the same eight-bit color. It is not what makes the
 * picker's own round trip stable, though — see the note on `emittedRef` in
 * ColorPicker.tsx.
 */
export function formatColor(hsva: Hsva, format: ColorPickerFormat): string {
  const rgba = hsvaToRgba(hsva);
  const a = round(hsva.a, 3);
  const opaque = a >= 1;

  switch (format) {
    case "hex":
      return `#${hexPair(rgba.r)}${hexPair(rgba.g)}${hexPair(rgba.b)}${
        opaque ? "" : hexPair(a * 255)
      }`;
    case "rgb": {
      const body = `${Math.round(rgba.r)} ${Math.round(rgba.g)} ${Math.round(rgba.b)}`;
      return `rgb(${body}${opaque ? "" : ` / ${a}`})`;
    }
    case "hsl": {
      const { h, s, l } = hsvaToHsl(hsva);
      const body = `${round(h, 1)} ${round(s * 100, 1)}% ${round(l * 100, 1)}%`;
      return `hsl(${body}${opaque ? "" : ` / ${a}`})`;
    }
    case "oklch": {
      const { l, c, h } = rgbaToOklch(rgba);
      /* Matching the ramp's own notation in `tokens.color.css`: lightness as a
       * 0-1 number rather than a percentage, so a value copied out of the
       * picker sits next to a generated token without reformatting. */
      const body = `${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`;
      return `oklch(${body}${opaque ? "" : ` / ${a}`})`;
    }
  }
}

/** `rgb()` with alpha — what the CSS custom properties carry, since a gradient
 * stop and a preview swatch both need one string that is always valid. */
export function toCssColor(hsva: Hsva): string {
  const { r, g, b } = hsvaToRgba(hsva);
  const a = round(hsva.a, 3);
  const body = `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
  return a >= 1 ? `rgb(${body})` : `rgb(${body} / ${a})`;
}

/** Two colors are the same swatch when they are the same eight-bit color.
 * Comparing the model instead would call `#000` and `hsl(200 0% 0%)` different,
 * and neither the eye nor the output string can tell them apart. */
export function sameColor(a: Rgba, b: Rgba): boolean {
  return (
    Math.round(a.r) === Math.round(b.r) &&
    Math.round(a.g) === Math.round(b.g) &&
    Math.round(a.b) === Math.round(b.b) &&
    round(a.a, 3) === round(b.a, 3)
  );
}

/**
 * The palette `ColorPicker.Swatches` falls back to: eight neutrals, eight warm
 * hues and eight cool ones, in three rows of eight.
 *
 * Deliberately NOT built from the forte-ui ramp. Those tokens are `var()`
 * references that resolve differently per theme scope and per light/dark, and a
 * picker has to hand back a concrete color the consumer can store — a swatch
 * that means one thing in dark mode and another in light is not a color, it is
 * a variable. An app with a brand palette passes its own `colors`.
 */
export const DEFAULT_SWATCHES: readonly string[] = [
  "#ffffff", "#f4f4f5", "#d4d4d8", "#a1a1aa", "#71717a", "#3f3f46", "#18181b", "#000000",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];
