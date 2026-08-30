"use client";

import { Resizable } from "@forte-ui/react";

/* `autoSaveId` writes the layout to localStorage and reads it back on the next
 * mount. Drag the divider, reload the page, and the split is where you left
 * it. Restoration happens after mount — the server cannot read the store — so
 * the `defaultSize`s below are still what the first paint uses. */
export default function ResizablePersisted() {
  return (
    <Resizable.Group
      autoSaveId="forte-ui-docs-demo"
      orientation="horizontal"
      className="h-40 w-full max-w-2xl overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={50} minSize={20}>
        <div className="h-full p-4 text-2 text-foreground-muted">Drag me, then reload.</div>
      </Resizable.Panel>
      <Resizable.Handle grip />
      <Resizable.Panel minSize={20}>
        <div className="h-full p-4 text-2 text-foreground-muted">
          Stored under <code className="font-mono">forte-resizable:forte-ui-docs-demo</code>.
        </div>
      </Resizable.Panel>
    </Resizable.Group>
  );
}
