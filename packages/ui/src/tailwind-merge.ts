/**
 * forte-ui × tailwind-merge — the config the Tailwind bridge makes necessary.
 * ---------------------------------------------------------------------------
 * tailwind-merge ships knowing Tailwind's DEFAULT theme, and
 * `@dofortech/forte-ui/tailwind.css` replaced most of it. A class it does not
 * recognise is not an error — it is simply never merged, so two competing
 * values both survive and the cascade decides. Its stock validators expect
 * t-shirt sizes (`rounded-md`) or bare numbers (`p-4`), and the bridge says
 * `rounded-control` and `p-surface` — hence one entry per scale whose names it
 * cannot guess.
 *
 * `text` and `shadow` are here for a second reason: tailwind-merge's colour
 * scale matches ANY value, so `text-2` (a font size under the bridge) parses
 * as a text COLOUR, and `twMerge("text-2", "text-foreground-muted")` silently
 * returns only the colour. Listing the steps makes them sizes again. That
 * same match-anything colour scale is why colours need no entry at all —
 * `bg-primary-soft` and the ramps merge for free — and neither do `font-*`,
 * `font-weight-*`, `leading-*` or `tracking-*`, whose names are Tailwind's
 * own.
 *
 * Usage:
 *
 *   import { extendTailwindMerge } from "tailwind-merge";
 *   import { tailwindMergeConfig } from "@dofortech/forte-ui/tailwind-merge";
 *
 *   export const twMerge = extendTailwindMerge(tailwindMergeConfig);
 *
 * The object is plain data on purpose: this module imports nothing, so the
 * package takes no dependency on tailwind-merge and the config works with
 * whatever version the app already has. To add app-level keys, spread the
 * inner arrays into your own `extend` block — `spacing` in particular must be
 * extended rather than replaced, or `p-surface` stops merging.
 *
 * Keep in step with `tailwind.css`: a key added to a scale there and missed
 * here does not error — it just stops overriding its own family.
 */

/** `--forte-duration-*`, which is also the `--transition-duration-*` scale. */
const DURATIONS = [
  "instant",
  "fast",
  "normal",
  "slow",
  "move",
  "spring-gentle",
  "spring-snappy",
  "spring-precise",
  "spring-bouncy",
];

export const tailwindMergeConfig = {
  extend: {
    theme: {
      /* The eight numbered steps are already recognised (bare numbers); the
       * named, density-aware surface padding is not. */
      spacing: ["surface"],
      text: ["1", "2", "3", "4", "5", "6"],
      shadow: ["1", "2", "3", "4"],
      radius: ["1", "2", "3", "4", "5", "6", "control", "surface", "pill"],
      ease: [
        "standard",
        "emphasized",
        "exit",
        "spring-gentle",
        "spring-snappy",
        "spring-precise",
        "spring-bouncy",
      ],
    },
    classGroups: {
      /* `duration-*` reads `--transition-duration-*`, which is not one of
       * tailwind-merge's theme keys, so the group is restated rather than the
       * scale. The stock `isNumber` validator stays alongside it. */
      duration: [{ duration: DURATIONS }],
    },
  },
};
