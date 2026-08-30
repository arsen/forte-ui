"use client";

import { EllipsisVertical } from "lucide-react";
import { Button, Menu } from "@forte-ui/react";

function Items() {
  return (
    <Menu.Popup>
      <Menu.Item>Share</Menu.Item>
      <Menu.Item>Export as CSV</Menu.Item>
      <Menu.Item>Print</Menu.Item>
    </Menu.Popup>
  );
}

export default function MenuTrigger() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* The built-in trigger: a neutral button, so an unstyled menu is not
        * UA chrome. */}
      <Menu.Root>
        <Menu.Trigger>Export</Menu.Trigger>
        <Items />
      </Menu.Root>

      {/* `render` hands the element over to another component — the library's
        * own Button here. The trigger's neutral styling steps aside when it is
        * present, so the two never fight over the cascade. */}
      <Menu.Root>
        <Menu.Trigger render={<Button variant="solid" tone="primary" />}>
          Export
        </Menu.Trigger>
        <Items />
      </Menu.Root>

      {/* An icon-only trigger needs a name of its own, exactly as any
        * icon-only button does. Base UI supplies `aria-haspopup` and
        * `aria-expanded`; what it cannot supply is what this button is for. */}
      <Menu.Root>
        <Menu.Trigger
          render={<Button variant="ghost" tone="neutral" iconOnly />}
          aria-label="Row actions"
        >
          <EllipsisVertical aria-hidden="true" />
        </Menu.Trigger>
        <Items />
      </Menu.Root>
    </div>
  );
}
