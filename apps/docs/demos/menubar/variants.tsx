"use client";

import { Menu, Menubar } from "@forte-ui/react";

function Menus() {
  return (
    <>
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
      <Menu.Root>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Zoom in</Menu.Item>
          <Menu.Item>Zoom out</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </>
  );
}

export default function MenubarVariants() {
  return (
    <div className="grid justify-items-start gap-5">
      {/* The default. Nothing is drawn around the menus, which is what an
        * application menu bar under a title bar looks like. */}
      <Menubar>
        <Menus />
      </Menubar>

      {/* A panel and a hairline, for a page busy enough that a bare row of
        * words would not read as a bar. The hover fill steps one further along
        * the gray ramp here, because the strip has already taken the first
        * step. */}
      <Menubar variant="contained">
        <Menus />
      </Menubar>
    </div>
  );
}
