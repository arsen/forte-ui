"use client";

import { Collapsible } from "@forte-ui/react";

const stack = "flex w-full max-w-lg flex-col gap-4";

export default function CollapsibleDisabled() {
  return (
    <div className={stack}>
      <Collapsible.Root variant="contained" disabled>
        <Collapsible.Trigger>Invoices</Collapsible.Trigger>
        <Collapsible.Panel>
          Only workspace owners can see invoices.
        </Collapsible.Panel>
      </Collapsible.Root>

      <Collapsible.Root variant="contained" disabled defaultOpen>
        <Collapsible.Trigger>Seats</Collapsible.Trigger>
        <Collapsible.Panel>
          Dimming the whole card, not just the header, is why an open panel
          cannot show fully-enabled body text under a greyed-out trigger.
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
