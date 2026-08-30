"use client";

import { Button, Tooltip } from "@forte-ui/react";

export default function TooltipDelay() {
  return (
    <Tooltip.Provider delay={700}>
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button variant="outline" tone="neutral" />}>
          Duplicate
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Arrow />
          Waits 700 ms
        </Tooltip.Popup>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger
          delay={0}
          render={<Button variant="outline" tone="danger" />}
        >
          Delete
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Arrow />
          Opens immediately
        </Tooltip.Popup>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
