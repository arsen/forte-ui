"use client";

import * as React from "react";
import { Button, Switch } from "@dofortech/forte-ui";

// The seed only works on an element carrying `data-forte-theme` (or the
// `.forte-theme` class) — the library re-derives its ramps on that selector.
// The same style on a plain <div> would change nothing.
const FOREST = {
  "--forte-accent-seed": "#0f7a52",
  "--forte-secondary-seed": "#a16207",
} as React.CSSProperties;

export default function ScopedTheme() {
  return (
    <>
      <Card title="Page theme" />
      <Card title="Scoped theme" scope={FOREST} />
    </>
  );
}

function Card({ title, scope }: { title: string; scope?: React.CSSProperties }) {
  return (
    <div
      data-forte-theme={scope ? "" : undefined}
      style={scope}
      className="grid gap-3 rounded-surface border border-border-muted bg-background p-5"
    >
      <p className="m-0 text-1 font-medium text-foreground-muted">{title}</p>
      <div className="flex items-center gap-3">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="soft" tone="secondary">
          Soft
        </Button>
        <Switch defaultChecked aria-label={`Example switch, ${title}`} />
      </div>
    </div>
  );
}
