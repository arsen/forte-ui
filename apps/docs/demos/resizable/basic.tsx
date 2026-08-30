"use client";

import { Resizable } from "@dofortech/forte-ui";

/* A pane's content is its own business: the panel clips and the group never
 * measures it, so anything can go in. These two are plain boxes so the demo is
 * about the divider. */
function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-center gap-1 p-4">
      <p className="m-0 text-1 font-semibold uppercase tracking-[0.06em] text-foreground-subtle">
        {title}
      </p>
      <p className="m-0 text-2 text-foreground-muted">{children}</p>
    </div>
  );
}

export default function ResizableBasic() {
  return (
    <Resizable.Group
      orientation="horizontal"
      className="h-48 w-full max-w-2xl overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={35} minSize={15}>
        <Pane title="Sidebar">Drag the divider, or focus it and use the arrow keys.</Pane>
      </Resizable.Panel>
      <Resizable.Handle grip />
      <Resizable.Panel>
        <Pane title="Content">Double-click the divider to snap back to the default split.</Pane>
      </Resizable.Panel>
    </Resizable.Group>
  );
}
