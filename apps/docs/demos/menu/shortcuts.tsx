"use client";

import { Copy, Pencil, Scissors, Trash2 } from "lucide-react";
import { Menu } from "@dofortech/forte-ui";

export default function MenuShortcuts() {
  return (
    <Menu.Root>
      <Menu.Trigger>Edit</Menu.Trigger>
      <Menu.Popup>
        {/* The glyphs are `aria-hidden` — a screen reader would read ⌘C as
          * "place of interest sign C". `aria-keyshortcuts` is where the same
          * information belongs, spelled in words the platform understands. */}
        <Menu.Item aria-keyshortcuts="Meta+X">
          <Scissors aria-hidden="true" />
          Cut
          <Menu.Shortcut>⌘X</Menu.Shortcut>
        </Menu.Item>
        <Menu.Item aria-keyshortcuts="Meta+C">
          <Copy aria-hidden="true" />
          Copy
          <Menu.Shortcut>⌘C</Menu.Shortcut>
        </Menu.Item>
        <Menu.Item aria-keyshortcuts="F2">
          <Pencil aria-hidden="true" />
          Rename
          <Menu.Shortcut>F2</Menu.Shortcut>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item tone="danger" aria-keyshortcuts="Meta+Backspace">
          <Trash2 aria-hidden="true" />
          Delete
          <Menu.Shortcut>⌘⌫</Menu.Shortcut>
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
