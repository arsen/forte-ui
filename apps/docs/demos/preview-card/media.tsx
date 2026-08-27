"use client";

import * as React from "react";
import { PreviewCard } from "@dofortech/pretty-ui";

export default function PreviewCardMedia() {
  return (
    <p className="max-w-md text-2 leading-normal">
      The palette in this library is rebuilt from one seed colour using{" "}
      <PreviewCard.Root>
        <PreviewCard.Trigger href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value">
          CSS relative colour syntax
        </PreviewCard.Trigger>
        {/* The card is a flex column with padding and a gap; a full-bleed
          * banner just wants both off, and the padding put back on the text
          * below. `p-0` and `gap-0` are utilities, so they land in a later
          * layer than the component and win without !important.
          *
          * What it must NOT do is add `overflow: clip` to hold the banner
          * inside the corners — the Arrow is a child of this element and is
          * placed outside its box, so clipping would eat the wedge. The
          * banner rounds its own two corners instead. */}
        <PreviewCard.Popup className="gap-0 p-0" size="lg">
          {/* No Arrow. The wedge is filled with --pui-preview-card-bg, and the
            * top edge of this card is the banner rather than the surface — so
            * the arrow would read as a dark notch bitten out of the gradient.
            * A card that opens with media drops the arrow. */}
          <div
            aria-hidden="true"
            className="h-[6rem]"
            style={
              {
                background:
                  "linear-gradient(120deg, var(--pui-color-primary), var(--pui-color-secondary))",
                // One border-width smaller than the card's own radius: this
                // element sits inside the border, and matching the outer
                // radius would leave a sliver of background in each corner.
                borderStartStartRadius:
                  "calc(var(--pui-preview-card-radius) - var(--pui-preview-card-border-width))",
                borderStartEndRadius:
                  "calc(var(--pui-preview-card-radius) - var(--pui-preview-card-border-width))",
              } as React.CSSProperties
            }
          />
          <div className="flex flex-col gap-2 p-surface">
            <span className="text-3 font-semibold">Relative colour syntax</span>
            <p className="text-2 text-foreground-muted">
              One seed colour, one function, and the whole ramp derives in the
              browser — no build step and no runtime theming layer.
            </p>
          </div>
        </PreviewCard.Popup>
      </PreviewCard.Root>
      , so a theme is one variable.
    </p>
  );
}
