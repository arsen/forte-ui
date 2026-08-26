import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `cn` — merge class lists, last writer wins.
 * ---------------------------------------------------------------------------
 * `clsx` flattens conditionals; `tailwind-merge` resolves conflicts, so a
 * component can take a `className` prop and have it actually beat the default
 * (`cn("p-4", className)` with `className="p-6"` yields `p-6`, not both).
 *
 * ---------------------------------------------------------------------------
 * Why there is a config at all
 * ---------------------------------------------------------------------------
 * tailwind-merge ships knowing Tailwind's DEFAULT theme, and `tailwind.css`
 * replaced most of it. A class it does not recognise is not an error — it is
 * simply never merged, so two competing values both survive and the cascade
 * picks one at random. Hence one entry per scale whose NAMES it cannot guess:
 * its stock validators expect t-shirt sizes (`rounded-md`, `max-w-lg`) or bare
 * numbers (`p-4`), and this site says `rounded-control` and `p-surface`.
 *
 * Colours need no entry: the stock colour scale already matches any name, so
 * `bg-primary-soft` and the ramps merge for free. Neither do `font-*`,
 * `font-weight-*`, `leading-*` and `tracking-*` — the names in `tailwind.css`
 * are the ones Tailwind uses by default.
 *
 * `text` is the one that has to be here for a reason other than recognition.
 * The stock colour scale matching anything means `text-2` (a font SIZE) parses
 * as a text COLOUR, and pairing it with a real colour drops one of them:
 *
 *   cn("text-2", "text-foreground-muted")   // -> "text-foreground-muted"
 *
 * Listing the six steps makes them font sizes again. `shadow` is the same
 * shape — `shadow-1` would otherwise be read as a shadow colour.
 *
 * Adding a key to one of these scales in `tailwind.css` means adding it here
 * too; a name missed here does not error, it just stops overriding its own
 * family. Adding a colour needs nothing.
 */

/** `--pui-duration-*`, which is also the `--transition-duration-*` scale. */
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

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // The eight pretty-ui steps are numbers and already recognised; these
      // three are the named ones — density-aware surface padding and the docs'
      // own layout measures.
      spacing: ["surface", "header", "anchor"],
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
      // `--animate-*` is deleted in tailwind.css and exactly one animation is
      // added back.
      animate: ["reveal"],
      // Added to Tailwind's stock container scale rather than replacing it —
      // `max-w-lg` and friends are untouched and still useful.
      container: ["shell", "measure", "hero"],
    },
    classGroups: {
      // `duration-*` reads `--transition-duration-*`, which is not one of
      // tailwind-merge's theme keys, so the group is restated rather than the
      // scale. The stock `isNumber` validator stays alongside it.
      duration: [{ duration: DURATIONS }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
