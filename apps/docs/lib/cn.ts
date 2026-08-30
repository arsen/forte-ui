import { createCn } from "@dofortech/forte-ui/cn";

/**
 * `cn` — merge class lists, last writer wins.
 * ---------------------------------------------------------------------------
 * The package's `createCn` already knows every scale the Tailwind bridge
 * renames — see the header of `@dofortech/forte-ui/cn` for why tailwind-merge
 * needs configuring at all (short version: the bridge renamed most of the
 * theme, and an unrecognised class is silently never merged; `text-2` even
 * parses as a COLOUR without it). Listed here is only what the DOCS added to
 * the theme in `app/tailwind.css`: the site's chrome measures and its one
 * animation. The extension APPENDS to the library's scales, so `spacing`
 * gains `header`/`anchor` beside `surface` rather than replacing it.
 *
 * A key added to `app/tailwind.css` gets added here; a key added to the
 * library's bridge gets added to the package config instead — this file
 * should never restate a library scale. Either way a missed name does not
 * error, it just stops overriding its own family.
 */
export const cn = createCn({
  extend: {
    theme: {
      spacing: ["header", "anchor"],
      // `--animate-*` is deleted in the bridge and exactly one animation is
      // added back by the docs.
      animate: ["reveal"],
      // Added to Tailwind's stock container scale rather than replacing it —
      // `max-w-lg` and friends are untouched and still useful.
      container: ["hero"],
    },
  },
});
