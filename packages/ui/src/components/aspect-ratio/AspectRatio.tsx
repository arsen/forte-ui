"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./AspectRatio.module.css";

export type AspectRatioPreset =
  | "square"
  | "video"
  | "wide"
  | "photo"
  | "portrait"
  | "story"
  | "golden";
export type AspectRatioFit = "cover" | "contain" | "fill" | "scale-down" | "none";
/**
 * Everything `ratio` accepts.
 *
 * The `(string & {})` arm is what keeps the seven names as autocomplete
 * suggestions while still allowing any CSS ratio: a bare `string` in the union
 * would absorb the literals and the editor would offer nothing.
 */
export type AspectRatioValue = number | AspectRatioPreset | (string & {});
export type AspectRatioVariant = "plain" | "outlined" | "filled";
export type AspectRatioBasis = "inline" | "block";

/**
 * The shapes worth having a name for.
 *
 * Named ratios are not sugar: `ratio="story"` says what the box is for, while
 * `ratio={9 / 16}` says `0.5625` and leaves the next reader to recognise it.
 * The values stay RATIONAL strings rather than being divided out, because
 * `aspect-ratio: 16 / 9` is exact where `1.7777777777777777` is a rounding
 * that shows up in devtools and in nothing else.
 */
const PRESETS: Record<AspectRatioPreset, string> = {
  square: "1 / 1",
  video: "16 / 9",
  wide: "21 / 9",
  photo: "4 / 3",
  portrait: "3 / 4",
  story: "9 / 16",
  golden: "1.618 / 1",
};

/**
 * Turns everything `ratio` accepts into a CSS `aspect-ratio` value.
 *
 * The `:` form is the one people say out loud ("sixteen by nine") and the one
 * every design tool prints, so it is accepted and rewritten; CSS itself only
 * understands the solidus. Anything else — `"16 / 9"`, `"auto"`, a `calc()` —
 * is passed through untouched, which is what keeps the prop from becoming a
 * smaller language than the property it feeds.
 *
 * A non-finite or non-positive number falls back to `1` rather than reaching
 * the stylesheet: `aspect-ratio: 0` collapses the box to nothing and
 * `aspect-ratio: NaN` is invalid at computed-value time, so the declaration
 * would be dropped and the box would silently size itself from its content —
 * the one failure that looks like the component is not installed.
 */
function toCssRatio(ratio: number | string): string {
  if (typeof ratio === "number") {
    return Number.isFinite(ratio) && ratio > 0 ? String(ratio) : "1";
  }
  const preset = PRESETS[ratio as AspectRatioPreset];
  if (preset) return preset;
  return ratio.includes(":") ? ratio.replace(":", " / ") : ratio;
}

export interface AspectRatioProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * The shape to hold. Takes a number (`16 / 9`), a CSS ratio string
   * (`"16 / 9"`), the spoken form (`"16:9"`), or one of seven names:
   * `square`, `video` (16:9), `wide` (21:9), `photo` (4:3), `portrait` (3:4),
   * `story` (9:16), `golden` (1.618:1).
   *
   * Prefer the name where one fits — it says what the box is for, where
   * `0.5625` says only what it measures.
   * @default 1
   */
  ratio?: AspectRatioValue;
  /**
   * How direct media children — `img`, `video`, `canvas`, `iframe`, `embed`,
   * `object`, and the `img` inside a `picture` — fill the box. It is an
   * `object-fit` value, applied for you: media is stretched to the frame on
   * both axes first, so without it an image is either letterboxed or
   * overflowing, and every caller ends up writing the same three declarations
   * on the child by hand.
   *
   * `cover` crops to fill and is what a media slot almost always wants;
   * `contain` fits the whole image inside and leaves bars, which is right when
   * the subject must not be cut — a logo, a diagram, a product shot on white.
   *
   * To keep an image from being cropped in the wrong place, set
   * `--pui-aspect-position`.
   * @default "cover"
   */
  fit?: AspectRatioFit;
  /**
   * How much chrome the box carries. `plain` is a pure layout box: no
   * background, no border, no radius. `outlined` adds a hairline frame and a
   * surface radius, which gives light-on-light media an edge. `filled` adds a
   * recessed panel instead — and because that panel is visible while the box
   * is still empty, it doubles as the loading placeholder for the image that
   * is about to arrive.
   * @default "plain"
   */
  variant?: AspectRatioVariant;
  /**
   * Which axis the box measures itself on. `inline` takes the container's
   * width and derives the height — the usual case, and the only one the
   * padding-bottom technique can express. `block` does the reverse: it takes a
   * definite height and derives the width, which is what a media tile in a
   * fixed-height row or a full-bleed hero needs.
   *
   * `block` requires the parent to actually supply a height — a grid row, a
   * stretched flex cross size, an explicit `height`. Given an indefinite one,
   * `100%` has nothing to resolve against and the box falls back to sizing
   * from its content.
   * @default "inline"
   */
  basis?: AspectRatioBasis;
  /**
   * Clips content to the box, and to its corner radius.
   *
   * On by default, because media that overflows its own frame is a bug rather
   * than a feature. Turn it off for the overlay that is *meant* to break out —
   * a badge hanging off a corner, a focus ring on a child, a tooltip anchored
   * inside.
   * @default true
   */
  clip?: boolean;
  /**
   * Replaces the rendered `<div>` with another element or component. This is
   * how the box becomes a `<figure>` around a caption, or the `<a>` that wraps
   * a whole thumbnail.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A box that holds its shape, whatever goes in it.
 *
 * ```tsx
 * <AspectRatio ratio="video">
 *   <img src="/cover.jpg" alt="" />
 * </AspectRatio>
 * ```
 *
 * The reason to reach for it is layout shift: the box occupies its final size
 * from the first paint, so an image that arrives half a second later drops
 * into space that was already reserved instead of shoving the page down.
 *
 * Base UI has no aspect-ratio primitive — there is no interaction to model —
 * so this is built on the CSS property directly rather than on the
 * `padding-bottom: 56.25%` trick the property replaced. Two things follow from
 * that, and both are the point:
 *
 * - **Children stack.** The box is a one-cell grid and every direct child is
 *   placed in that cell, in source order, without leaving flow. A caption over
 *   a photo is two elements and no `position: absolute`:
 *
 *   ```tsx
 *   <AspectRatio ratio="photo" variant="filled">
 *     <img src="/cover.jpg" alt="" />
 *     <figcaption style={{ placeSelf: "end start" }}>Lisbon, 2019</figcaption>
 *   </AspectRatio>
 *   ```
 *
 * - **Either axis can be the measured one.** `basis="block"` takes a definite
 *   height and derives the width, which a percentage padding cannot do at all.
 *
 * Media children are sized and `object-fit` for you — see `fit`. Everything
 * visual is a `--pui-aspect-*` custom property, and the state is on
 * `data-variant`, `data-fit` and `data-basis`, so a box can be re-skinned from
 * plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[variant=filled]:...`) without wrapping it.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio(
    {
      ratio = 1,
      fit = "cover",
      variant = "plain",
      basis = "inline",
      clip = true,
      render,
      className,
      style,
      ...props
    },
    ref,
  ) {
    /* The SEED, not the knob. `--pui-aspect-ratio-seed` is what the prop
     * writes; the stylesheet reads it into `--pui-aspect-ratio` with a
     * fallback. Writing the knob directly here would make an inline style the
     * final word on the ratio, and a consumer could then never move it from a
     * media or container query — the one prop in this library that plain CSS
     * could not reach. The stylesheet's header explains the rest.
     *
     * `fit`, `variant` and `basis` need none of this: their values are
     * enumerable, so they travel as data attributes and their knobs are set by
     * ordinary rules that a consumer can outrank.
     *
     * The caller's `style` is spread last so an explicit `aspectRatio` (or
     * their own seed) still wins over the prop rather than being ignored. */
    const mergedStyle = {
      "--pui-aspect-ratio-seed": toCssRatio(ratio),
      ...style,
    } as React.CSSProperties;

    return useRender({
      render,
      ref,
      defaultTagName: "div",
      props: {
        /* `.pui-focus-ring` costs a plain `<div>` nothing — the class only
         * paints on `:focus-visible`, which a non-focusable element never
         * matches. It is here for the box that IS focusable: `render={<a />}`
         * around a whole thumbnail is a documented use, and without this it
         * would fall back to the UA's own outline, which is the one ring in
         * the library that cannot promise 3:1 against an arbitrary photo.
         *
         * Not `data-focus-inset`: `overflow: clip` clips this element's
         * DESCENDANTS, not its own outline, so the ring draws outside the
         * frame as intended. */
        className: clsx(styles.root, "pui-focus-ring", className),
        style: mergedStyle,
        "data-pui": "aspect-ratio",
        "data-variant": variant,
        "data-fit": fit,
        "data-basis": basis,
        "data-clip": clip ? "" : undefined,
        ...props,
      },
    });
  },
);
