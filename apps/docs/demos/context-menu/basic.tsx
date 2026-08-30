"use client";

import { ContextMenu } from "@forte-ui/react";

export default function ContextMenuBasic() {
  return (
    <ContextMenu.Root>
      {/* The trigger is a REGION, not a button: it wraps content the app was
        * rendering anyway and adds no look of its own — only the ring that
        * marks it while its menu is up. `select-none` is the demo's choice,
        * not the component's: a long press on touch would otherwise start a
        * text selection at the same moment the menu opens. */}
      <ContextMenu.Trigger className="flex aspect-5/3 w-full max-w-2xs items-center justify-center rounded-surface border border-dashed border-border-strong bg-panel text-2 text-foreground-muted select-none">
        Right click here
      </ContextMenu.Trigger>

      <ContextMenu.Popup>
        <ContextMenu.Item>Add to library</ContextMenu.Item>
        <ContextMenu.Item>Add to playlist…</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>Play next</ContextMenu.Item>
        <ContextMenu.Item>Play last</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item tone="danger">Remove</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  );
}
