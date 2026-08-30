"use client";

import { EllipsisVertical } from "lucide-react";
import { Button, ContextMenu, Menu } from "@forte-ui/react";

/**
 * The commands, written once. `ContextMenu.Item` and `Menu.Item` are the same
 * component — Base UI re-exports the Menu parts under both namespaces, and so
 * does this library — so one list of rows can be dropped into either popup
 * without a `type` prop deciding which parts to render.
 */
function Actions() {
  return (
    <>
      <Menu.Item>Preview</Menu.Item>
      <Menu.Item>Download</Menu.Item>
      <Menu.Item>Copy link</Menu.Item>
      <Menu.Item>Rename…</Menu.Item>
      <Menu.Separator />
      <Menu.Item tone="danger">Delete</Menu.Item>
    </>
  );
}

export default function ContextMenuWithMenu() {
  return (
    <div className="relative w-full max-w-2xs">
      <ContextMenu.Root>
        <ContextMenu.Trigger className="block overflow-hidden rounded-surface border border-border bg-panel text-start select-none">
          <div className="flex aspect-video items-center justify-center bg-primary-soft text-2 text-primary-text">
            station-hofplein.jpg
          </div>
          <div className="p-3">
            <p className="text-2 leading-tight">Station Hofplein</p>
            <p className="text-1 text-foreground-muted">JPG · 2.4 MB</p>
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Popup>
          <Actions />
        </ContextMenu.Popup>
      </ContextMenu.Root>

      {/* The same commands behind a visible control. This is the part that
        * makes the context menu legitimate: nothing announces that a region
        * has one, and no keyboard reaches it. */}
      <Menu.Root>
        <Menu.Trigger
          render={<Button variant="ghost" tone="neutral" size="sm" iconOnly />}
          aria-label="Image actions"
          className="absolute end-2 top-2"
        >
          <EllipsisVertical aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Popup align="end">
          <Actions />
        </Menu.Popup>
      </Menu.Root>
    </div>
  );
}
