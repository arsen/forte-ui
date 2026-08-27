"use client";

import * as React from "react";
import { ContextMenu } from "@dofortech/pretty-ui";

export default function ContextMenuTheming() {
  return (
    <div className="flex w-full max-w-sm flex-wrap items-stretch justify-center gap-4">
      <ContextMenu.Root>
        {/* The trigger's own knobs. They stay in a `style` object because a
          * utility class cannot set an arbitrary custom property. */}
        <ContextMenu.Trigger
          className="grid aspect-5/3 flex-1 place-items-center rounded-surface border border-border bg-panel px-3 text-center text-2 text-foreground-muted select-none"
          style={
            {
              "--pui-context-menu-trigger-ring-color":
                "var(--pui-color-secondary)",
              "--pui-context-menu-trigger-ring-width": "3px",
            } as React.CSSProperties
          }
        >
          A louder ring
        </ContextMenu.Trigger>
        <ContextMenu.Popup>
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
          <ContextMenu.Item>Rename…</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>

      <ContextMenu.Root>
        <ContextMenu.Trigger
          className="grid aspect-5/3 flex-1 place-items-center rounded-surface border border-border bg-panel px-3 text-center text-2 text-foreground-muted select-none"
          style={
            { "--pui-context-menu-trigger-ring-width": "0" } as React.CSSProperties
          }
        >
          No ring at all
        </ContextMenu.Trigger>
        {/* The popup is `Menu.Popup`, so it is themed with the `--pui-menu-*`
          * knobs — there is no separate context-menu surface to re-skin. */}
        <ContextMenu.Popup
          style={
            {
              "--pui-menu-radius": "var(--pui-radius-6)",
              "--pui-menu-border-color": "var(--pui-color-secondary-border)",
              "--pui-menu-item-px": "var(--pui-space-4)",
            } as React.CSSProperties
          }
        >
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
          <ContextMenu.Item>Rename…</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>
    </div>
  );
}
