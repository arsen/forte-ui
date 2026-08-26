"use client";

import type { CSSProperties } from "react";
import { Collapsible } from "@dofortech/pretty-ui";

const width: CSSProperties = { inlineSize: "min(32rem, 100%)" };

export default function CollapsibleContained() {
  return (
    <Collapsible.Root variant="contained" defaultOpen style={width}>
      <Collapsible.Trigger>Delivery estimate</Collapsible.Trigger>
      <Collapsible.Panel>
        Between 3 and 5 working days to mainland addresses, and up to 8 to the
        islands. Orders over £60 ship free.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
