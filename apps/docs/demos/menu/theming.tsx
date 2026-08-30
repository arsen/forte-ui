"use client";

import * as React from "react";
import { Menu } from "@dofortech/forte-ui";

export default function MenuTheming() {
  return (
    <Menu.Root>
      <Menu.Trigger>Themed</Menu.Trigger>
      {/* Every knob the popup declares is set on the popup itself. They stay in
        * a `style` object rather than becoming utility classes because a class
        * cannot set an arbitrary custom property — and setting them on an
        * ancestor would do nothing, since the popup is portalled to <body>. */}
      <Menu.Popup
        style={
          {
            "--forte-menu-radius": "var(--forte-radius-5)",
            "--forte-menu-min-width": "15rem",
            "--forte-menu-padding-y": "var(--forte-space-2)",
            "--forte-menu-item-px": "var(--forte-space-4)",
            "--forte-menu-border-color": "var(--forte-color-primary-border)",
          } as React.CSSProperties
        }
      >
        <Menu.Item
          style={
            {
              "--forte-menu-item-bg-highlighted":
                "var(--forte-color-secondary-soft)",
              "--forte-menu-item-fg-highlighted":
                "var(--forte-color-secondary-text)",
            } as React.CSSProperties
          }
        >
          A row with its own highlight
        </Menu.Item>
        <Menu.Item>An ordinary row</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Roomier padding all round</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
