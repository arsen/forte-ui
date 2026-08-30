"use client";

import * as React from "react";
import { Menu } from "@forte-ui/react";

const ORDERS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A–Z)",
  size: "Largest first",
};

export default function MenuRadioItems() {
  const [order, setOrder] = React.useState("newest");

  // Centred, not start-aligned: the caption below is the widest thing in this
  // column and its width changes with the selection, so a start-aligned trigger
  // would slide sideways every time the demo frame re-centred the column.
  return (
    <div className="flex flex-col items-center gap-3">
      <Menu.Root>
        <Menu.Trigger>Sort</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup
            value={order}
            onValueChange={(value) => setOrder(value as string)}
          >
            <Menu.GroupLabel>Sort by</Menu.GroupLabel>
            {Object.entries(ORDERS).map(([value, label]) => (
              <Menu.RadioItem key={value} value={value}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>

      <p className="text-1 text-foreground-muted">
        Sorted by {ORDERS[order as keyof typeof ORDERS].toLowerCase()}.
      </p>
    </div>
  );
}
