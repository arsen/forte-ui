"use client";

import * as React from "react";
import { Menu } from "@dofortech/pretty-ui";

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
            "--pui-menu-radius": "var(--pui-radius-5)",
            "--pui-menu-min-width": "15rem",
            "--pui-menu-padding-y": "var(--pui-space-2)",
            "--pui-menu-item-px": "var(--pui-space-4)",
            "--pui-menu-border-color": "var(--pui-color-primary-border)",
          } as React.CSSProperties
        }
      >
        <Menu.Item
          style={
            {
              "--pui-menu-item-bg-highlighted":
                "var(--pui-color-secondary-soft)",
              "--pui-menu-item-fg-highlighted":
                "var(--pui-color-secondary-text)",
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
