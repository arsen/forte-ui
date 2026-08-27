"use client";

import { Menu } from "@dofortech/pretty-ui";

export default function MenuGroups() {
  return (
    <Menu.Root>
      <Menu.Trigger>Workspace</Menu.Trigger>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>Account</Menu.GroupLabel>
          <Menu.Item>Profile</Menu.Item>
          <Menu.Item>Billing</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>Team</Menu.GroupLabel>
          <Menu.Item>Invite members…</Menu.Item>
          <Menu.Item>Permissions</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item>Sign out</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
