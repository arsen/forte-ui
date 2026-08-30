"use client";

import * as React from "react";
import { Menu, Menubar } from "@forte-ui/react";

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
          "--forte-menubar-gap": "var(--forte-space-2)",
          "--forte-menubar-padding": "var(--forte-space-2)",
          "--forte-menubar-radius": "var(--forte-radius-pill)",
          "--forte-menubar-trigger-radius": "var(--forte-radius-pill)",
          "--forte-menubar-trigger-px": "var(--forte-control-px-md)",
          "--forte-menubar-trigger-font-weight": "var(--forte-font-weight-semibold)",
          "--forte-menubar-trigger-bg-open": "var(--forte-color-secondary-soft)",
          "--forte-menubar-trigger-fg-open": "var(--forte-color-secondary-text)",
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
              "--forte-menubar-trigger-bg-open": "var(--forte-color-danger-soft)",
              "--forte-menubar-trigger-fg-open": "var(--forte-color-danger-text)",
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
