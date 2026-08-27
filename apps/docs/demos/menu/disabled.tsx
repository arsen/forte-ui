"use client";

import { Menu } from "@dofortech/pretty-ui";

export default function MenuDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Menu.Root>
        <Menu.Trigger>Deploy</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Deploy to preview</Menu.Item>
          {/* A disabled row stays in the list and stays announced, so the
            * command remains discoverable. Say in the row's own text why it is
            * unavailable — greying alone tells the user nothing. */}
          <Menu.Item disabled>Deploy to production (needs review)</Menu.Item>
          <Menu.Separator />
          <Menu.Item disabled tone="danger">
            Roll back (nothing deployed yet)
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root disabled>
        <Menu.Trigger>Disabled menu</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Unreachable</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  );
}
