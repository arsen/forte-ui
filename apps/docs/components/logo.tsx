import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * The Forte UI logo — the mark alone, and the mark with its wordmark.
 *
 * Inline SVG rather than an `<img>`, for one reason: the gradient. Its two
 * stops are the `--forte-accent-9` / `--forte-secondary-9` tokens — the same
 * pair the old header swatch painted with `linear-gradient(135deg, …)` — so
 * the mark follows the Theme Studio's seed and every scope it sits in, which
 * a file on disk cannot. The wordmark runs from `currentColor` — whatever
 * text colour the parent has, the way the plain "Forte UI" text was — to
 * the secondary text colour, so it too follows the theme.
 *
 * Under forced colours the page's tokens go away, so both gradients fall
 * back to `currentColor` and the two dots to `Canvas`: a flat,
 * system-coloured F that still reads as the first letter of the name. The old swatch was decorative
 * and could simply hide; this one IS the F, and hiding it would leave the
 * link reading "orte UI".
 *
 * The geometry lives here as path data and nowhere else that is edited:
 * `app/icon.svg` (the favicon) and `public/brand/forte-ui.svg` are the same
 * drawing with the seed DEFAULTS baked in, because a favicon and an `<img>`
 * have no tokens to read. Change the drawing here and re-bake both.
 *
 * The wordmark is "orte UI" set in Poppins Bold (SIL OFL) and outlined to a
 * path, so it renders identically everywhere and pulls no font in. The mark
 * stands in for the F, a fifth taller than the caps, its top arm reaching
 * out to the "o" across a gap of half a bar, which is what makes it a logo
 * rather than an icon beside a word. Taller
 * than that and the F reads as a separate glyph looming over the name — it
 * also drags the box's centre above the text's, so the wordmark sits high
 * next to the bar's icons.
 */

/** The F: a stem and two arms, every end fully rounded. 36 wide, 48 tall. */
const MARK =
  "M6 0a6 6 0 0 1 6 6v36a6 6 0 0 1 -6 6a6 6 0 0 1 -6 -6v-36a6 6 0 0 1 6 -6zM6 0h24a6 6 0 0 1 6 6a6 6 0 0 1 -6 6h-24a6 6 0 0 1 -6 -6a6 6 0 0 1 6 -6zM6 16h15a6 6 0 0 1 6 6a6 6 0 0 1 -6 6h-15a6 6 0 0 1 -6 -6a6 6 0 0 1 6 -6z";

/** The two highlight dots, one per arm. */
const DOTS =
  "M29.25 6a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0zM20.25 22a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0z";

/** "orte UI", baseline at 48, cap height 40 — five sixths of the mark. */
const WORD =
  "M50.93 48.45Q46.28 48.45 42.56 46.47Q38.84 44.48 36.72 40.79Q34.59 37.11 34.59 32.17L34.59 32.17Q34.59 27.29 36.74 23.57Q38.90 19.86 42.65 17.87Q46.39 15.89 51.04 15.89L51.04 15.89Q55.70 15.89 59.44 17.87Q63.18 19.86 65.34 23.57Q67.50 27.29 67.50 32.17L67.50 32.17Q67.50 37.05 65.31 40.77Q63.13 44.48 59.35 46.47Q55.58 48.45 50.93 48.45L50.93 48.45ZM50.93 40.06Q53.71 40.06 55.67 38.01Q57.62 35.97 57.62 32.17L57.62 32.17Q57.62 28.37 55.72 26.33Q53.82 24.28 51.04 24.28L51.04 24.28Q48.21 24.28 46.33 26.30Q44.46 28.31 44.46 32.17L44.46 32.17Q44.46 35.97 46.30 38.01Q48.15 40.06 50.93 40.06L50.93 40.06ZM82.36 21.62Q84.06 19.01 86.62 17.50Q89.17 16 92.29 16L92.29 16L92.29 26.27L89.62 26.27Q85.99 26.27 84.18 27.83Q82.36 29.39 82.36 33.30L82.36 33.30L82.36 48L72.66 48L72.66 16.34L82.36 16.34L82.36 21.62ZM111.13 39.77L114.59 39.77L114.59 48L109.65 48Q104.38 48 101.43 45.42Q98.48 42.84 98.48 36.99L98.48 36.99L98.48 24.40L94.62 24.40L94.62 16.34L98.48 16.34L98.48 8.62L108.18 8.62L108.18 16.34L114.53 16.34L114.53 24.40L108.18 24.40L108.18 37.11Q108.18 38.52 108.86 39.15Q109.54 39.77 111.13 39.77L111.13 39.77ZM149.82 31.66Q149.82 33.02 149.65 34.50L149.65 34.50L127.70 34.50Q127.92 37.45 129.60 39.01Q131.27 40.57 133.71 40.57L133.71 40.57Q137.34 40.57 138.76 37.50L138.76 37.50L149.09 37.50Q148.29 40.62 146.22 43.12Q144.15 45.62 141.03 47.04Q137.91 48.45 134.05 48.45L134.05 48.45Q129.40 48.45 125.77 46.47Q122.13 44.48 120.09 40.79Q118.05 37.11 118.05 32.17L118.05 32.17Q118.05 27.23 120.06 23.55Q122.08 19.86 125.71 17.87Q129.34 15.89 134.05 15.89L134.05 15.89Q138.65 15.89 142.22 17.82Q145.79 19.74 147.81 23.32Q149.82 26.89 149.82 31.66L149.82 31.66ZM127.75 29.11L139.89 29.11Q139.89 26.61 138.19 25.13Q136.49 23.66 133.94 23.66L133.94 23.66Q131.50 23.66 129.82 25.08Q128.15 26.50 127.75 29.11L127.75 29.11ZM166.79 8.17L176.49 8.17L176.49 32Q176.49 35.57 178.25 37.50Q180.01 39.43 183.41 39.43L183.41 39.43Q186.82 39.43 188.63 37.50Q190.45 35.57 190.45 32L190.45 32L190.45 8.17L200.15 8.17L200.15 31.94Q200.15 37.28 197.88 40.96Q195.61 44.65 191.78 46.52Q187.95 48.40 183.24 48.40L183.24 48.40Q178.53 48.40 174.82 46.55Q171.10 44.71 168.94 40.99Q166.79 37.28 166.79 31.94L166.79 31.94L166.79 8.17ZM206.96 8.17L216.66 8.17L216.66 48L206.96 48L206.96 8.17Z";

/** The wordmark's right edge, and half a unit for the round letters' overshoot below the baseline. */
const WIDTH = 216.66;
const HEIGHT = 48.5;

/**
 * The gradient and the mark, shared by both exports. The gradient is in user
 * space over the mark's own box, corner to corner, which is what CSS's
 * `135deg` means on a square swatch — so the header keeps the diagonal it had.
 */
function Mark({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" className="[stop-color:var(--forte-accent-9)]" />
          <stop offset="1" className="[stop-color:var(--forte-secondary-9)]" />
        </linearGradient>
      </defs>
      <path d={MARK} fill={`url("#${id}")`} className="forced-colors:fill-current" />
      {/* White, not a token: the dots are the mark's highlight, and the one
        * colour that reads on both ends of any in-envelope gradient. */}
      <path d={DOTS} fill="#fff" className="forced-colors:fill-[Canvas]" />
    </>
  );
}

type LogoProps = Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "children">;

/**
 * The full logo: mark and wordmark. Sized by height; the width follows. The
 * default is a TYPE step rather than a space step because the wordmark is
 * text: at 1.25rem its caps land near the bar's own title size, and the
 * mark comes out the size the old swatch was.
 */
export function Logo({ className, ...props }: LogoProps) {
  // Unique per instance: two logos on one page (the header and, say, a footer)
  // would otherwise both point at the first one's gradient, and the second
  // would paint with whichever `<defs>` the browser found first.
  const id = React.useId();
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Forte UI"
      className={cn("h-(--forte-font-size-5) w-auto", className)}
      {...props}
    >
      <Mark id={id} />
      <defs>
        {/* Left to right across the word, in the text's own box: it starts as
          * the plain text colour and ends on the SECONDARY TEXT colour — the
          * ramp's step 11, the hue the mark's gradient ends on, at the
          * lightness the ramp already guarantees readable as text on the
          * background. That last part is why it is a ramp step and not a
          * `color-mix()` of the text colour and the seed: a fixed share of a
          * mid-lightness seed is a visible tint on near-white text and a
          * barely-there one on near-black, so a single ratio cannot look the
          * same in both themes, while step 11 is defined per theme to sit
          * the same distance from the foreground in each. `currentColor` in
          * a stop is the `<stop>` element's inherited `color`, i.e. the
          * link's, so the start follows the theme the way the flat fill did. */}
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="[stop-color:currentColor]" />
          <stop offset="1" className="[stop-color:var(--forte-color-secondary-text)]" />
        </linearGradient>
      </defs>
      <path d={WORD} fill={`url("#${id}w")`} className="forced-colors:fill-current" />
    </svg>
  );
}

/** The mark alone. Decorative by default; pass an `aria-label` to name it. */
export function LogoMark({ className, ...props }: LogoProps) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 36 48" aria-hidden="true" className={cn("h-5 w-auto", className)} {...props}>
      <Mark id={id} />
    </svg>
  );
}
