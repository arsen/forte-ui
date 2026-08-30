"use client";

import { Menu, Menubar, Separator } from "@dofortech/forte-ui";

export default function MenubarOrientation() {
  return (
    /* A column of menus: the arrow keys swap axis with it, and the triggers
     * stretch to the bar's width so their labels line up on the reading edge.
     * The popups have to be told where to go — the default is still below the
     * trigger, which in a column would land on the next one. */
    <Menubar orientation="vertical" variant="contained" className="w-44">
      <Menu.Root>
        <Menu.Trigger>Project</Menu.Trigger>
        {/* `inline-end` follows writing direction only when the app mounts
          * Base UI's DirectionProvider; these docs do not, so it resolves to
          * the right in both directions of the toggle above. */}
        <Menu.Popup side="inline-end" sideOffset={4}>
          <Menu.Item>Overview</Menu.Item>
          <Menu.Item>Settings…</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Team</Menu.Trigger>
        <Menu.Popup side="inline-end" sideOffset={4}>
          <Menu.Item>Members</Menu.Item>
          <Menu.Item>Invite…</Menu.Item>
          <Menu.Item>Permissions</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Separator />

      <Menu.Root>
        <Menu.Trigger>Billing</Menu.Trigger>
        <Menu.Popup side="inline-end" sideOffset={4}>
          <Menu.Item>Plan</Menu.Item>
          <Menu.Item>Invoices</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Menubar>
  );
}
