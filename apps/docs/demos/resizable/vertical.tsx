"use client";

import { Resizable } from "@forte-ui/react";

export default function ResizableVertical() {
  return (
    <Resizable.Group
      orientation="vertical"
      className="h-64 w-full max-w-md overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={65} minSize={20}>
        <div className="h-full p-4 text-2 text-foreground-muted">
          <p className="m-0 font-medium text-foreground">Editor</p>
          <p className="m-0">The handle between stacked panels runs across, and moves with the up and down arrows.</p>
        </div>
      </Resizable.Panel>
      <Resizable.Handle grip />
      <Resizable.Panel minSize={15}>
        <div className="h-full p-4 font-mono text-1 text-foreground-muted">
          <p className="m-0">$ pnpm build</p>
          <p className="m-0">✓ built in 412ms</p>
        </div>
      </Resizable.Panel>
    </Resizable.Group>
  );
}
