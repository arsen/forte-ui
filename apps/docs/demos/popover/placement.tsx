"use client";

import { Button, Popover } from "@forte-ui/react";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function PopoverPlacement() {
  return (
    <>
      {SIDES.map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
            {side}
          </Popover.Trigger>
          {/* Both `side` and `align` are hints. The popup flips to the
            * opposite side when it would overflow the collision boundary,
            * which is why `left` and `right` may land elsewhere in a narrow
            * frame — resize the preview and watch the arrow follow. */}
          <Popover.Popup side={side} size="sm">
            <Popover.Arrow />
            <Popover.Description>
              Opens on the {side}, and flips when there is no room.
            </Popover.Description>
          </Popover.Popup>
        </Popover.Root>
      ))}
    </>
  );
}
