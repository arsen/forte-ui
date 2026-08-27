"use client";

import * as React from "react";
import { Menu, Menubar } from "@dofortech/pretty-ui";

export default function MenubarTheming() {
  return (
    /* Every knob is declared on the bar, including the ones the triggers read
      * — they reach the triggers by inheritance. They stay in a `style` object
      * rather than becoming utility classes because a class cannot set an
      * arbitrary custom property. */
    <Menubar
      variant="contained"
      style={
        {
          "--pui-menubar-gap": "var(--pui-space-2)",
          "--pui-menubar-padding": "var(--pui-space-2)",
          "--pui-menubar-radius": "var(--pui-radius-pill)",
          "--pui-menubar-trigger-radius": "var(--pui-radius-pill)",
          "--pui-menubar-trigger-px": "var(--pui-control-px-md)",
          "--pui-menubar-trigger-font-weight": "var(--pui-font-weight-semibold)",
          "--pui-menubar-trigger-bg-open": "var(--pui-color-secondary-soft)",
          "--pui-menubar-trigger-fg-open": "var(--pui-color-secondary-text)",
        } as React.CSSProperties
      }
    >
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

      {/* A trigger's own declaration beats the one it would inherit from the
        * bar, so a single menu can step out of the shared look. */}
      <Menu.Root>
        <Menu.Trigger
          style={
            {
              "--pui-menubar-trigger-bg-open": "var(--pui-color-danger-soft)",
              "--pui-menubar-trigger-fg-open": "var(--pui-color-danger-text)",
            } as React.CSSProperties
          }
        >
          Danger zone
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item tone="danger">Delete project</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Menubar>
  );
}
