"use client";

import { ContextMenu } from "@forte-ui/react";

export default function ContextMenuDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-wrap items-stretch justify-center gap-3">
      {/* `disabled` on the root turns the whole region off: the browser's own
        * context menu comes back, because the trigger stops calling
        * preventDefault. */}
      <ContextMenu.Root disabled>
        <ContextMenu.Trigger className="grid aspect-5/3 flex-1 place-items-center rounded-surface border border-border bg-panel px-3 text-center text-2 text-foreground-subtle select-none">
          Disabled region
        </ContextMenu.Trigger>
        <ContextMenu.Popup>
          <ContextMenu.Item>Never reached</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>

      <ContextMenu.Root>
        <ContextMenu.Trigger className="grid aspect-5/3 flex-1 place-items-center rounded-surface border border-dashed border-border-strong bg-panel px-3 text-center text-2 text-foreground-muted select-none">
          Enabled, with a disabled row
        </ContextMenu.Trigger>
        <ContextMenu.Popup>
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
          {/* A disabled row stays in the list, stays announced, and is still
            * reached by the arrow keys — so it says in its own text why it
            * cannot run, rather than relying on being grey. */}
          <ContextMenu.Item disabled>Publish (needs review)</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item tone="danger" disabled>
            Delete (locked by admin)
          </ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>
    </div>
  );
}
