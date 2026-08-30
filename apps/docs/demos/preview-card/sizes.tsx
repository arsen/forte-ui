"use client";

import { PreviewCard } from "@forte-ui/react";

const SIZES = ["sm", "md", "lg"] as const;

export default function PreviewCardSizes() {
  return (
    <>
      {SIZES.map((size) => (
        <PreviewCard.Root key={size}>
          <PreviewCard.Trigger href="#">{size}</PreviewCard.Trigger>
          {/* A cap, not a width. The card shrinks to fit its content and only
            * grows this wide when the text asks for it — and it is clamped
            * again to the room the positioner reports, so the `lg` card
            * narrows rather than overflowing a small screen. */}
          <PreviewCard.Popup size={size}>
            <PreviewCard.Arrow />
            <span className="text-3 font-semibold">size=&quot;{size}&quot;</span>
            <p className="text-2 text-foreground-muted">
              The measure is a ceiling. This paragraph is long enough to reach
              it, so each card stops at its own cap and wraps from there.
            </p>
          </PreviewCard.Popup>
        </PreviewCard.Root>
      ))}
    </>
  );
}
