"use client";

import { Button, Popover } from "@dofortech/forte-ui";

const SIZES = ["sm", "md", "lg"] as const;

const COPY =
  "A width cap, not a width. The popup shrinks to fit its content and only " +
  "grows this wide when the content asks for it — and it is clamped again " +
  "to whatever room the positioner reports.";

export default function PopoverSizes() {
  return (
    <>
      {SIZES.map((size) => (
        <Popover.Root key={size}>
          <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
            {size}
          </Popover.Trigger>
          <Popover.Popup size={size}>
            <Popover.Arrow />
            <Popover.Description>{COPY}</Popover.Description>
          </Popover.Popup>
        </Popover.Root>
      ))}
    </>
  );
}
