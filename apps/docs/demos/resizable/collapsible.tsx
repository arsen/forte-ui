"use client";

import * as React from "react";
import { Button, Resizable } from "@dofortech/forte-ui";

/* `collapsed` + `onCollapsedChange` is an ordinary controlled pair, so the
 * toggle button is an ordinary button holding ordinary state. Drag the sidebar
 * past half of its minimum and it shuts, and the button re-labels itself —
 * both routes write to the same piece of state. */
export default function ResizableCollapsible() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Show sidebar" : "Hide sidebar"}
        </Button>
        <span className="text-1 text-foreground-subtle">
          Or drag the divider left, or press Enter on it.
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
            A collapsed panel is <code className="font-mono">inert</code> as well as invisible, so
            the links above leave the tab order rather than becoming an unreachable trap.
          </div>
        </Resizable.Panel>
      </Resizable.Group>
    </div>
  );
}
