"use client";

import { Menu } from "@dofortech/pretty-ui";

export default function MenuSubmenu() {
  return (
    <Menu.Root>
      <Menu.Trigger>File</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>New document</Menu.Item>
        <Menu.Item>Open…</Menu.Item>
        <Menu.Separator />

        {/* `Menu.SubmenuRoot` goes inside the parent popup, and its own
          * `Menu.Popup` needs no positioning props: it reads the nesting from
          * the SubmenuRoot above it and opens off the inline end of the row
          * instead of below the trigger. */}
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
          <Menu.Popup>
            <Menu.Item>Copy link</Menu.Item>
            <Menu.Item>Email…</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>Publish to</Menu.SubmenuTrigger>
              <Menu.Popup>
                <Menu.Item>Web</Menu.Item>
                <Menu.Item>Internal wiki</Menu.Item>
              </Menu.Popup>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.SubmenuRoot>

        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>Export as</Menu.SubmenuTrigger>
          <Menu.Popup>
            <Menu.Item>PDF</Menu.Item>
            <Menu.Item>Markdown</Menu.Item>
            <Menu.Item>HTML</Menu.Item>
          </Menu.Popup>
        </Menu.SubmenuRoot>

        <Menu.Separator />
        <Menu.Item>Print…</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
