"use client";

import { Menu } from "@forte-ui/react";

export default function MenuBasic() {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item>Rename…</Menu.Item>
        <Menu.Item>Move to project…</Menu.Item>
        <Menu.Separator />
        <Menu.Item tone="danger">Delete</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
