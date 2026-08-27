"use client";

import { Menu, Menubar } from "@dofortech/pretty-ui";

export default function MenubarDisabled() {
  return (
    <div className="grid justify-items-start gap-5">
      {/* One menu out of action. The trigger stays in the bar and stays
        * reachable by the arrow keys, so the command is still discoverable —
        * which is why the label has to say why it is unavailable. */}
      <Menubar variant="contained">
        <Menu.Root>
          <Menu.Trigger>File</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>New document</Menu.Item>
            <Menu.Item>Open…</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger disabled>Edit (read-only file)</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Undo</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger>View</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Zoom in</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Menubar>

      {/* The whole bar. Base UI hands `disabled` down to every trigger, so
        * none of them needs the prop. */}
      <Menubar variant="contained" disabled>
        <Menu.Root>
          <Menu.Trigger>File</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>New document</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger>Edit</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Undo</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger>View</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Zoom in</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Menubar>
    </div>
  );
}
