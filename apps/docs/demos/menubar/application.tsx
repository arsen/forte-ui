"use client";

import * as React from "react";
import { Menu, Menubar, Separator } from "@forte-ui/react";

export default function MenubarApplication() {
  const [wrap, setWrap] = React.useState(true);
  const [minimap, setMinimap] = React.useState(false);
  const [zoom, setZoom] = React.useState("100");

  return (
    /* Everything a Menu can do is available here unchanged — shortcuts,
      * checkable rows, submenus, danger rows — because the menus in a bar are
      * the same `Menu` components as anywhere else. */
    <Menubar variant="contained">
      <Menu.Root>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item aria-keyshortcuts="Meta+N">
            New document
            <Menu.Shortcut>⌘N</Menu.Shortcut>
          </Menu.Item>
          <Menu.Item aria-keyshortcuts="Meta+O">
            Open…
            <Menu.Shortcut>⌘O</Menu.Shortcut>
          </Menu.Item>

          {/* A submenu inside a bar's menu opens sideways off its row, exactly
            * as it does under a standalone trigger. */}
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>Open recent</Menu.SubmenuTrigger>
            <Menu.Popup>
              <Menu.Item>Q3 roadmap.md</Menu.Item>
              <Menu.Item>Release notes.md</Menu.Item>
              <Menu.Item>Onboarding.md</Menu.Item>
            </Menu.Popup>
          </Menu.SubmenuRoot>

          <Menu.Separator />
          <Menu.Item aria-keyshortcuts="Meta+S">
            Save
            <Menu.Shortcut>⌘S</Menu.Shortcut>
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item tone="danger">Move to trash</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item aria-keyshortcuts="Meta+Z">
            Undo
            <Menu.Shortcut>⌘Z</Menu.Shortcut>
          </Menu.Item>
          <Menu.Item aria-keyshortcuts="Shift+Meta+Z">
            Redo
            <Menu.Shortcut>⇧⌘Z</Menu.Shortcut>
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item aria-keyshortcuts="Meta+F">
            Find…
            <Menu.Shortcut>⌘F</Menu.Shortcut>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Popup>
          {/* Checkable rows keep `closeOnClick={false}`, so a run of view
            * settings can be set in one visit. */}
          <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>
            Wrap long lines
          </Menu.CheckboxItem>
          <Menu.CheckboxItem checked={minimap} onCheckedChange={setMinimap}>
            Show minimap
          </Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.RadioGroup value={zoom} onValueChange={setZoom}>
            <Menu.GroupLabel>Zoom</Menu.GroupLabel>
            <Menu.RadioItem value="80">80%</Menu.RadioItem>
            <Menu.RadioItem value="100">100%</Menu.RadioItem>
            <Menu.RadioItem value="125">125%</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>

      {/* A rule between runs of menus. The standalone `Separator` rather than
        * `Menu.Separator`, which is a part of the popup and reads its inline
        * margin from a token only the popup declares. `role="separator"` is
        * valid inside a `role="menubar"`, and the arrow keys skip it because
        * it is not focusable. */}
      <Separator orientation="vertical" />

      <Menu.Root>
        <Menu.Trigger>Help</Menu.Trigger>
        <Menu.Popup>
          <Menu.LinkItem href="https://base-ui.com/react/components/menubar" target="_blank" rel="noreferrer">
            Base UI Menubar
          </Menu.LinkItem>
          <Menu.Item>Keyboard shortcuts</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Menubar>
  );
}
