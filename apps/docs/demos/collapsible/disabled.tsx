"use client";

import type { CSSProperties } from "react";
import { Collapsible } from "@dofortech/pretty-ui";

const stack: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-4)",
  inlineSize: "min(32rem, 100%)",
};

export default function CollapsibleDisabled() {
  return (
    <div style={stack}>
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
