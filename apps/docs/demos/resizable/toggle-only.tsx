"use client";

import * as React from "react";
import { Button, Resizable } from "@forte-ui/react";

/* `collapseOnDrag={false}` reserves collapsing for the `collapsed` prop. The
 * drag stops at `minSize` the way a non-collapsible panel's does, Enter on the
 * divider does nothing, and while the sidebar is shut the divider leaves it
 * shut — the button is the one route in either direction. */
export default function ResizableToggleOnly() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Show sidebar" : "Hide sidebar"}
        </Button>
        <span className="text-1 text-foreground-subtle">
          Dragging stops at the minimum; only the button collapses it.
        </span>
      </div>

      <Resizable.Group
        orientation="horizontal"
        className="h-48 overflow-hidden rounded-surface border border-border-muted"
      >
        <Resizable.Panel
          defaultSize={30}
          minSize="160px"
          collapsible
          collapseOnDrag={false}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        >
          <nav className="h-full p-3 text-2 text-foreground-muted">
            <p className="m-0 font-medium text-foreground">Library</p>
            <p className="m-0">Playlists</p>
            <p className="m-0">Artists</p>
          </nav>
        </Resizable.Panel>
        <Resizable.Handle grip />
        <Resizable.Panel>
          <div className="h-full p-4 text-2 text-foreground-muted">
            Drag the divider as far left as it goes: the sidebar holds at 160px instead of
            snapping shut.
          </div>
        </Resizable.Panel>
      </Resizable.Group>
    </div>
  );
}
