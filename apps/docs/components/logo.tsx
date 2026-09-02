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
 * The wordmark is "orte UI" set in Poppins Bold (SIL OFL), outlined to a
 * path, and then had every corner filleted — so it renders identically
 * everywhere, pulls no font in, and carries the mark's roundness into the
 * name, a pill-ended F beside six square letters reading as two logos that
 * happen to be adjacent. Outer corners took a radius of 2.5 and inner ones
 * 1.5; half a stem is 4.85, which matches the mark exactly and costs the
 * lowercase its skeleton — the "r" valley opens into a notch and the "e"
 * terminal droops into a hook.
 *
 * The mark stands in for the F, a fifth taller than the caps, its top arm
 * reaching out to the "o" across a gap of half a bar, which is what makes it
 * a logo rather than an icon beside a word. Taller than that and the F reads
 * as a separate glyph looming over the name — it also drags the box's centre
 * above the text's, so the wordmark sits high next to the bar's icons.
 */

/** The F: a stem and two arms, every end fully rounded. 36 wide, 48 tall. */
const MARK =
  "M6 0a6 6 0 0 1 6 6v36a6 6 0 0 1 -6 6a6 6 0 0 1 -6 -6v-36a6 6 0 0 1 6 -6zM6 0h24a6 6 0 0 1 6 6a6 6 0 0 1 -6 6h-24a6 6 0 0 1 -6 -6a6 6 0 0 1 6 -6zM6 16h15a6 6 0 0 1 6 6a6 6 0 0 1 -6 6h-15a6 6 0 0 1 -6 -6a6 6 0 0 1 6 -6z";

/** The two highlight dots, one per arm. */
const DOTS =
  "M29.25 6a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0zM20.25 22a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0z";

/** "orte UI", baseline at 48, cap height 40 — five sixths of the mark. Already
  * filleted, so re-rounding this would melt it: a change starts from Poppins. */
const WORD =
  "M50.93 48.45Q46.28 48.45 42.56 46.47Q38.84 44.48 36.72 40.79Q34.59 37.11 34.59 32.17Q34.59 27.29 36.74 23.57Q38.9 19.86 42.65 17.87Q46.39 15.89 51.04 15.89Q55.7 15.89 59.44 17.87Q63.18 19.86 65.34 23.57Q67.5 27.29 67.5 32.17Q67.5 37.05 65.31 40.77Q63.13 44.48 59.35 46.47Q55.58 48.45 50.93 48.45ZM50.93 40.06Q53.71 40.06 55.67 38.01Q57.62 35.97 57.62 32.17Q57.62 28.37 55.72 26.33Q53.82 24.28 51.04 24.28Q48.21 24.28 46.33 26.3Q44.46 28.31 44.46 32.17Q44.46 35.97 46.3 38.01Q48.15 40.06 50.93 40.06ZM82.36 20.12Q82.36 21.49 83.24 20.41Q84.69 18.64 86.62 17.5Q88.12 16.62 89.81 16.26Q92.29 15.72 92.29 18.5L92.29 23.77Q92.29 26.27 89.79 26.27L89.62 26.27Q85.99 26.27 84.18 27.83Q82.36 29.39 82.36 33.3L82.36 45.5Q82.36 48 79.86 48L75.16 48Q72.66 48 72.66 45.5L72.66 18.84Q72.66 16.34 75.16 16.34L79.86 16.34Q82.36 16.34 82.36 18.84L82.36 20.12ZM111.13 39.77L112.09 39.77Q114.59 39.77 114.59 42.27L114.59 45.5Q114.59 48 112.09 48L109.65 48Q104.38 48 101.43 45.42Q98.48 42.84 98.48 36.99L98.48 25.85Q98.48 24.4 97.03 24.4L97.03 24.4Q94.62 24.4 94.62 21.99L94.62 18.75Q94.62 16.34 97.03 16.34L97.03 16.34Q98.48 16.34 98.48 14.89L98.48 11.12Q98.48 8.62 100.98 8.62L105.68 8.62Q108.18 8.62 108.18 11.12L108.18 14.84Q108.18 16.34 109.68 16.34L112.03 16.34Q114.53 16.34 114.53 18.84L114.53 21.9Q114.53 24.4 112.03 24.4L109.68 24.4Q108.18 24.4 108.18 25.9L108.18 37.11Q108.18 38.52 108.86 39.15Q109.54 39.77 111.13 39.77ZM149.82 31.66Q149.82 31.97 149.81 32.28Q149.75 34.5 147.42 34.5L129.2 34.5Q127.57 34.5 127.92 35.98Q128.37 37.87 129.6 39.01Q131.27 40.57 133.71 40.57Q136.43 40.57 137.91 38.85Q139.06 37.5 140.36 37.5L146.59 37.5Q149.33 37.5 148.27 39.86Q147.48 41.6 146.22 43.12Q144.15 45.62 141.03 47.04Q137.91 48.45 134.05 48.45Q129.4 48.45 125.77 46.47Q122.13 44.48 120.09 40.79Q118.05 37.11 118.05 32.17Q118.05 27.23 120.06 23.55Q122.08 19.86 125.71 17.87Q129.34 15.89 134.05 15.89Q138.65 15.89 142.22 17.82Q145.79 19.74 147.81 23.32Q149.82 26.89 149.82 31.66ZM128.1 27.65Q127.6 29.11 129.25 29.11L138.39 29.11Q140.09 29.11 139.72 27.62Q139.35 26.14 138.19 25.13Q136.49 23.66 133.94 23.66Q131.5 23.66 129.82 25.08Q128.65 26.07 128.1 27.65ZM166.79 10.67Q166.79 8.17 169.29 8.17L173.99 8.17Q176.49 8.17 176.49 10.67L176.49 32Q176.49 35.57 178.25 37.5Q180.01 39.43 183.41 39.43Q186.82 39.43 188.63 37.5Q190.45 35.57 190.45 32L190.45 10.67Q190.45 8.17 192.95 8.17L197.65 8.17Q200.15 8.17 200.15 10.67L200.15 31.94Q200.15 37.28 197.88 40.96Q195.61 44.65 191.78 46.52Q187.95 48.4 183.24 48.4Q178.53 48.4 174.82 46.55Q171.1 44.71 168.94 40.99Q166.79 37.28 166.79 31.94L166.79 10.67ZM206.96 10.67Q206.96 8.17 209.46 8.17L214.16 8.17Q216.66 8.17 216.66 10.67L216.66 45.5Q216.66 48 214.16 48L209.46 48Q206.96 48 206.96 45.5L206.96 10.67Z";

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
