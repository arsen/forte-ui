"use client";

import { Resizable } from "@forte-ui/react";

/* The three-pane editor shape: one horizontal group, with a vertical group
 * living inside its middle panel. Nothing coordinates the two — the inner
 * panels register with the inner group, so each split is independent. */
export default function ResizableNested() {
  return (
    <Resizable.Group
      orientation="horizontal"
      className="h-64 w-full max-w-3xl overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={22} minSize="120px">
        <div className="h-full p-3 text-2 text-foreground-muted">Files</div>
      </Resizable.Panel>

      <Resizable.Handle />

      <Resizable.Panel defaultSize={53}>
        <Resizable.Group orientation="vertical" className="h-full">
          <Resizable.Panel defaultSize={70} minSize={20}>
            <div className="h-full p-3 text-2 text-foreground-muted">Editor</div>
          </Resizable.Panel>
          <Resizable.Handle grip />
          <Resizable.Panel minSize={15}>
            <div className="h-full p-3 font-mono text-1 text-foreground-muted">Terminal</div>
          </Resizable.Panel>
        </Resizable.Group>
      </Resizable.Panel>

      <Resizable.Handle />

      <Resizable.Panel minSize="140px">
        <div className="h-full p-3 text-2 text-foreground-muted">Inspector</div>
      </Resizable.Panel>
    </Resizable.Group>
  );
}
