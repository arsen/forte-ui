"use client";

import { PreviewCard } from "@dofortech/forte-ui";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function PreviewCardPlacement() {
  return (
    <>
      {SIDES.map((side) => (
        <PreviewCard.Root key={side}>
          <PreviewCard.Trigger href="#">{side}</PreviewCard.Trigger>
          {/* Both `side` and `align` are hints. The card flips to the opposite
            * side when it would overflow the collision boundary, which is why
            * `left` and `right` may land elsewhere in a narrow frame — resize
            * the preview and watch the arrow follow. */}
          <PreviewCard.Popup side={side} size="sm">
            <PreviewCard.Arrow />
            <p className="text-2 text-foreground-muted">
              Opens on the {side}, and flips when there is no room.
            </p>
          </PreviewCard.Popup>
        </PreviewCard.Root>
      ))}
    </>
  );
}
