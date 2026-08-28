"use client";

import { AspectRatio } from "@dofortech/pretty-ui";

/**
 * Two layers, no `position: absolute`.
 *
 * The box is a one-cell grid and every direct child is placed in that cell, so
 * stacking is what happens by default and each layer only has to say where it
 * sits — `self-end` here. Nothing leaves flow, so nothing needs a z-index and
 * the caption still contributes its own height to nothing at all.
 *
 * `render={<figure />}` makes the box the semantic element it already is
 * visually. The UA gives `<figure>` a margin, which `m-0` takes back.
 */
export default function AspectRatioOverlay() {
  return (
    <AspectRatio
      ratio="photo"
      variant="filled"
      render={<figure />}
      className="m-0 w-full max-w-md"
    >
      <img src="/media/harbour.svg" alt="A harbour at dusk, seen from the water" />
      <figcaption className="self-end bg-panel/85 px-4 py-3 text-2 text-foreground">
        Cais do Sodré, 19:40
      </figcaption>
    </AspectRatio>
  );
}
