/**
 * Color maths for the Theme Studio and the create-forte-ui CLI. This is the
 * module of record — the docs' `lib/color.ts` re-exports it from here.
 *
 * Mirrors the model the library's CSS uses, so what the studio reports is what
 * the browser will actually paint:
 *  - sRGB is naive-CLIPPED, not gamut-mapped, because that is what browsers do
 *    today. Reporting a gamut-mapped color here would understate how far an
 *    out-of-range seed drifts.
 *  - Contrast is WCAG 2.x relative luminance, the ratio the success criteria
 *    are actually written against.
 */

export type Oklch = { l: number; c: number; h: number };
type Rgb = [number, number, number];

/** OKLCH -> linear sRGB, plus whether sRGB could represent it at all. */
export function oklchToLinear(o: Oklch): { rgb: Rgb; outOfGamut: boolean } {
  const hr = (o.h * Math.PI) / 180;
  const a = o.c * Math.cos(hr);
  const b = o.c * Math.sin(hr);
  const l3 = (o.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (o.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (o.l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const raw: Rgb = [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ];
  return {
    rgb: raw.map((v) => Math.min(1, Math.max(0, v))) as Rgb,
    outOfGamut: raw.some((v) => v < -1e-4 || v > 1 + 1e-4),
  };
}

const encode = (v: number) =>
  Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);

export function oklchToHex(o: Oklch): string {
  const { rgb } = oklchToLinear(o);
  return "#" + rgb.map((v) => encode(v).toString(16).padStart(2, "0")).join("");
}

function srgbToLinear(v: number) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string): Oklch | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let s = m[1]!;
  if (s.length === 3) s = s.split("").map((ch) => ch + ch).join("");
  const [r, g, b] = [0, 2, 4].map((i) => srgbToLinear(parseInt(s.slice(i, i + 2), 16) / 255)) as Rgb;

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: Rgb = [1, 1, 1];
const BLACK: Rgb = [0, 0, 0];

/**
 * The exact readable text color for a solid fill, chosen by measuring both
 * candidates rather than by the CSS fallback's fitted lightness threshold.
 * Emitting this as a literal is what makes the studio's output correct in
 * every browser, including those without contrast-color().
 */
export function bestOnColor(seed: Oklch): { color: "white" | "black"; ratio: number } {
  const { rgb } = oklchToLinear(seed);
  const w = contrast(WHITE, rgb);
  const b = contrast(BLACK, rgb);
  return w >= b ? { color: "white", ratio: w } : { color: "black", ratio: b };
}

/** The envelope the library's contrast guarantees were verified across. */
export const ENVELOPE = { lMin: 0.45, lMax: 0.9, cMin: 0.02, cMax: 0.3 };

export type SeedWarning = { level: "warn" | "info"; message: string };

export function validateSeed(seed: Oklch): SeedWarning[] {
  const out: SeedWarning[] = [];
  const { outOfGamut } = oklchToLinear(seed);

  if (outOfGamut) {
    out.push({
      level: "warn",
      message:
        "Outside the sRGB gamut. Browsers clip rather than gamut-map, which shifts the painted lightness — the 9/10 hover step can visually collapse, and the color will differ between sRGB and P3 displays.",
    });
  }
  if (seed.l < ENVELOPE.lMin) {
    out.push({ level: "warn", message: `Very dark (L ${seed.l.toFixed(2)}). Steps 9 and 12 converge, so solid fills and high-contrast text stop being distinguishable.` });
  }
  if (seed.l > ENVELOPE.lMax) {
    out.push({ level: "warn", message: `Very light (L ${seed.l.toFixed(2)}). The subtle background steps have nowhere left to go and flatten against the page.` });
  }
  if (seed.c < ENVELOPE.cMin) {
    out.push({ level: "info", message: "Nearly achromatic — the accent ramp will be hard to tell apart from the neutrals." });
  }
  return out;
}
