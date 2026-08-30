"use client";

import { Menu } from "@dofortech/forte-ui";

export default function MenuLinks() {
  return (
    <Menu.Root>
      <Menu.Trigger>Docs</Menu.Trigger>
      <Menu.Popup>
        {/* A real <a>, so middle-click, ⌘-click and "copy link address" all
          * work — none of which they do on an item whose onClick calls
          * router.push. `closeOnClick` is off by default because a link that
          * opens in a new tab leaves this page, and its menu, standing. */}
        <Menu.LinkItem href="/components/button" closeOnClick>
          Button
        </Menu.LinkItem>
        <Menu.LinkItem href="/components/select" closeOnClick>
          Select
        </Menu.LinkItem>
        <Menu.Separator />
        <Menu.LinkItem
          href="https://base-ui.com/react/components/menu"
          target="_blank"
          rel="noreferrer"
        >
          Base UI Menu ↗
        </Menu.LinkItem>
      </Menu.Popup>
    </Menu.Root>
  );
}
