"use client";

import { Collapsible } from "@forte-ui/react";

const width = "w-full max-w-lg";

export default function CollapsibleContained() {
  return (
    <Collapsible.Root variant="contained" defaultOpen className={width}>
      <Collapsible.Trigger>Delivery estimate</Collapsible.Trigger>
      <Collapsible.Panel>
        Between 3 and 5 working days to mainland addresses, and up to 8 to the
        islands. Orders over £60 ship free.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
