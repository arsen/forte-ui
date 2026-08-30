"use client";

import { ContextMenu } from "@dofortech/forte-ui";

export default function ContextMenuSubmenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="grid aspect-5/3 w-full max-w-2xs place-items-center rounded-surface border border-dashed border-border-strong bg-panel text-2 text-foreground-muted select-none">
        Right click here
      </ContextMenu.Trigger>

      <ContextMenu.Popup>
        <ContextMenu.Item>Cut</ContextMenu.Item>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Separator />

        {/* A submenu inside a context menu is the ordinary `Menu.SubmenuRoot`,
          * and its own popup still needs no positioning props: the nesting
          * wins over the context menu's anchor-to-the-pointer placement, so it
          * opens sideways off the row exactly as it would in a dropdown. */}
        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger>Paste special</ContextMenu.SubmenuTrigger>
          <ContextMenu.Popup>
            <ContextMenu.Item>Values only</ContextMenu.Item>
            <ContextMenu.Item>Formatting only</ContextMenu.Item>
            <ContextMenu.Item>Formulas</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.SubmenuRoot>

        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger>Transform</ContextMenu.SubmenuTrigger>
          <ContextMenu.Popup>
            <ContextMenu.Item>Rotate 90° left</ContextMenu.Item>
            <ContextMenu.Item>Rotate 90° right</ContextMenu.Item>
            <ContextMenu.SubmenuRoot>
              <ContextMenu.SubmenuTrigger>Flip</ContextMenu.SubmenuTrigger>
              <ContextMenu.Popup>
                <ContextMenu.Item>Horizontally</ContextMenu.Item>
                <ContextMenu.Item>Vertically</ContextMenu.Item>
              </ContextMenu.Popup>
            </ContextMenu.SubmenuRoot>
          </ContextMenu.Popup>
        </ContextMenu.SubmenuRoot>

        <ContextMenu.Separator />
        <ContextMenu.Item tone="danger">Delete</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  );
}
