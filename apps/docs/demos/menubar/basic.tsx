"use client";

import { Menu, Menubar } from "@dofortech/pretty-ui";

export default function MenubarBasic() {
  return (
    /* The bar has no parts of its own — its children are ordinary
     * `Menu.Root`s, which is Base UI's anatomy. A `Menu.Root` renders no
     * element, so the triggers are the bar's own flex items. */
    <Menubar>
      <Menu.Root>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>New document</Menu.Item>
          <Menu.Item>Open…</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Save</Menu.Item>
          <Menu.Item>Save as…</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Undo</Menu.Item>
          <Menu.Item>Redo</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Cut</Menu.Item>
          <Menu.Item>Copy</Menu.Item>
          <Menu.Item>Paste</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Zoom in</Menu.Item>
          <Menu.Item>Zoom out</Menu.Item>
          <Menu.Item>Actual size</Menu.Item>
        </Menu.Popup>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Help</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Documentation</Menu.Item>
          <Menu.Item>Keyboard shortcuts</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Menubar>
  );
}
