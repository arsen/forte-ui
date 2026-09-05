"use client";

import * as React from "react";
import { Button, Resizable } from "@forte-ui/react";

/* A `defaultSize` in px anchors the panel. The sidebar below is 260px of a
 * wide window and 260px of a narrow one, whatever the reader drags it to is
 * remembered as a length, and only the content pane — a percentage, since it
 * declares nothing — gives way. Narrow the browser and watch the divider hold
 * still. The `56px` rail it shuts to is a length as well, so it stays a rail
 * at every width instead of the share of one width it happened to shut at. */
export default function ResizableAnchored() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Show sidebar" : "Hide sidebar"}
        </Button>
        <span className="text-1 text-foreground-subtle">
          Then narrow the window: the sidebar keeps its width.
        </span>
      </div>

      <Resizable.Group
        orientation="horizontal"
        className="h-48 overflow-hidden rounded-surface border border-border-muted"
      >
        <Resizable.Panel
          defaultSize="260px"
          minSize="200px"
          maxSize="420px"
          collapsible
          collapsedSize="56px"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        >
          <nav className="h-full p-3 text-2 text-foreground-muted">
            <p className="m-0 font-medium text-foreground">260px, always</p>
            <p className="m-0">min 200px · max 420px</p>
          </nav>
        </Resizable.Panel>
        <Resizable.Handle grip />
        <Resizable.Panel>
          <div className="h-full p-4 text-2 text-foreground-muted">
            This pane is the one that grows and shrinks with the window.
          </div>
        </Resizable.Panel>
      </Resizable.Group>
    </div>
  );
}
