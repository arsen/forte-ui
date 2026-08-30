"use client";

import { Button, Tooltip } from "@dofortech/forte-ui";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function TooltipPlacement() {
  return (
    <>
      {SIDES.map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger render={<Button variant="outline" tone="neutral" />}>
            {side}
          </Tooltip.Trigger>
          <Tooltip.Popup side={side}>
            <Tooltip.Arrow />
            Opens on the {side}
          </Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </>
  );
}
