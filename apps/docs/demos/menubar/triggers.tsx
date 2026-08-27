"use client";

import { EllipsisVertical } from "lucide-react";
import { Button, Menu, Menubar } from "@dofortech/pretty-ui";

export default function MenubarTriggers() {
  return (
    <Menubar>
      {/* The bar's own trigger look: the standalone `Menu.Trigger` button
        * chrome comes off and a flat strip item takes its place. */}
      <Menu.Root>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>New document</Menu.Item>
          <Menu.Item>Open…</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Undo</Menu.Item>
          <Menu.Item>Redo</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      {/* A trigger given `render` keeps whatever it was rendered as — the bar
        * only restyles the trigger that is still wearing its own chrome, so
        * this Button is untouched. An overflow menu at the end of a bar is the
        * usual reason to reach for it, and an icon-only trigger needs a name
        * of its own however it is styled. */}
      <Menu.Root>
        <Menu.Trigger
          render={<Button variant="outline" tone="neutral" iconOnly />}
          aria-label="More"
        >
          <EllipsisVertical aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Popup align="end">
          <Menu.Item>Import…</Menu.Item>
          <Menu.Item>Export as CSV</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Settings</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Menubar>
  );
}
