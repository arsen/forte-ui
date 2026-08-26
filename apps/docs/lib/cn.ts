import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { tailwindMergeConfig } from "@dofortech/pretty-ui/tailwind-merge";

/**
 * `cn` — merge class lists, last writer wins.
 * ---------------------------------------------------------------------------
 * `clsx` flattens conditionals; `tailwind-merge` resolves conflicts, so a
 * component can take a `className` prop and have it actually beat the default
 * (`cn("p-4", className)` with `className="p-6"` yields `p-6`, not both).
 *
 * The library half of the configuration ships with the package — see the
 * header of `@dofortech/pretty-ui/tailwind-merge` for why tailwind-merge
 * needs one at all (short version: the bridge renamed most of the theme, and
 * an unrecognised class is silently never merged; `text-2` even parses as a
 * COLOUR without it). What is added here is only what the DOCS added to the
 * theme in `tailwind.css`: the site's chrome measures and its one animation.
 *
 * A key added to `app/tailwind.css` gets added here; a key added to the
 * library's bridge gets added to the package config instead — this file
 * should never restate a library scale. Either way a missed name does not
 * error, it just stops overriding its own family.
 */

const { theme, classGroups } = tailwindMergeConfig.extend;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      ...theme,
      // `spacing` extends the library's list rather than replacing it, or
      // `p-surface` would stop merging against `p-4`.
      spacing: [...theme.spacing, "header", "anchor"],
      // `--animate-*` is deleted in the bridge and exactly one animation is
      // added back by the docs.
      animate: ["reveal"],
      // Added to Tailwind's stock container scale rather than replacing it —
      // `max-w-lg` and friends are untouched and still useful.
      container: ["shell", "measure", "hero"],
    },
    classGroups,
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
