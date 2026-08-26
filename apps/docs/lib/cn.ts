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
 * Why the config, and why it is not optional
 * ---------------------------------------------------------------------------
 * tailwind-merge ships knowing Tailwind's DEFAULT theme. `app/tailwind.css`
 * deletes that theme and rebuilds it from the pretty-ui tokens, so the stock
 * config is describing a scale this site does not have — and it does not fail
 * loudly when it guesses wrong, it drops a class.
 *
 * The concrete break: tailwind-merge's default colour scale matches ANY value,
 * so `text-2` (font size 0.875rem) parses as a text COLOUR. Pair it with a real
 * colour and one of them silently disappears:
 *
 *   cn("text-2", "text-foreground-muted")   // -> "text-foreground-muted"
 *
 * The font size is gone, nothing warns, and the bug only shows up as slightly
 * wrong type somewhere down the page. Narrowing the scales below to the names
 * this site actually defines makes `text-2` resolve as a size again, and keeps
 * every other value that is not in the list from being merged by accident.
 *
 * Keep this in sync with the `@theme` block in `app/tailwind.css` — that file
 * decides what compiles, this one decides what survives a merge. A name added
 * there and missed here does not error; it just stops overriding its own
 * family, which is the same quiet failure in the other direction.
 */

/** The twelve raw steps of a ramp, e.g. `accent-1` … `accent-12`. */
const ramp = (name: string) => Array.from({ length: 12 }, (_, i) => `${name}-${i + 1}`);

/** Every `--color-*` key defined in `app/tailwind.css`. */
const COLORS = [
  "background",
  "foreground",
  "foreground-muted",
  "foreground-subtle",
  "panel",
  "panel-hover",
  "panel-active",
  "overlay",
  "border",
  "border-muted",
  "border-strong",
  "primary",
  "primary-hover",
  "primary-active",
  "primary-soft",
  "primary-soft-hover",
  "primary-soft-active",
  "primary-border",
  "primary-text",
  "secondary",
  "secondary-hover",
  "secondary-active",
  "secondary-soft",
  "secondary-soft-hover",
  "secondary-soft-active",
  "secondary-border",
  "secondary-text",
  "danger",
  "danger-hover",
  "danger-soft",
  "danger-border",
  "danger-text",
  "success",
  "success-text",
  "warning",
  "warning-text",
  "on-primary",
  "on-secondary",
  "on-danger",
  ...ramp("accent"),
  ...ramp("secondary"),
  ...ramp("gray"),
];

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: COLORS,
      // The eight pretty-ui steps, plus the density-aware surface padding and
      // the docs' own layout measures. `0` is here because `p-0` / `inset-0`
      // route through the spacing scale like any other step.
      spacing: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "surface", "header", "anchor"],
      text: ["1", "2", "3", "4", "5", "6"],
      radius: ["1", "2", "3", "4", "5", "6", "control", "surface", "pill"],
      shadow: ["1", "2", "3", "4"],
      font: ["sans", "mono"],
      "font-weight": ["normal", "medium", "semibold", "bold"],
      leading: ["tight", "normal"],
      tracking: ["tight", "normal"],
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
      // added back, so this is the whole list.
      animate: ["reveal"],
    },
    classGroups: {
      // `duration-*` reads `--transition-duration-*`, which is not one of
      // tailwind-merge's theme keys — so the group has to be restated by hand.
      // Without this the stock `isNumber` validator matches nothing we write
      // and two competing durations both survive.
      duration: [
        {
          duration: [
            "instant",
            "fast",
            "normal",
            "slow",
            "move",
            "spring-gentle",
            "spring-snappy",
            "spring-precise",
            "spring-bouncy",
            "initial",
          ],
        },
      ],
    },
  },
  extend: {
    theme: {
      // Added to Tailwind's stock container scale rather than replacing it —
      // `max-w-lg` and friends are untouched and still useful.
      container: ["shell", "measure", "hero"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
