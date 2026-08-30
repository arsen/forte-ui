"use client";

import { AspectRatio } from "@forte-ui/react";

/**
 * `render` swaps the `<div>` for whatever the box actually is — here, the
 * `<a>` wrapping a whole thumbnail.
 *
 * Two things follow, and both are the component doing less rather than more:
 *
 *   - It rings. `AspectRatio` carries `.forte-focus-ring`, which costs a plain
 *     `<div>` nothing — the class only paints on `:focus-visible`, which a
 *     non-focusable element never matches — and gives a linked frame the
 *     library's two-tone ring instead of the UA's outline. Tab to it and see.
 *   - The pointer is the anchor's own. The component declares no `cursor` at
 *     all, precisely so that it cannot take one away.
 *
 * The title is a second child rather than a caption underneath, so it is
 * inside the link and becomes its accessible name — which is why the image can
 * take `alt=""`.
 */
export default function AspectRatioLink() {
  return (
    <AspectRatio
      ratio="video"
      variant="filled"
      render={<a href="#link" />}
      className="w-full max-w-xs no-underline"
    >
      <img src="/media/harbour.svg" alt="" />
      <span className="self-end bg-panel/85 px-3 py-2 text-2 font-medium text-foreground">
        Sunset from the ferry
      </span>
    </AspectRatio>
  );
}
