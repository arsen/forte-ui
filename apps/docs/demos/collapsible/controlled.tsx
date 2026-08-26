"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Button, Collapsible } from "@dofortech/pretty-ui";

const stack: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-3)",
  inlineSize: "min(32rem, 100%)",
};

export default function CollapsibleControlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={stack}>
      <Button variant="soft" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide the log" : "Show the log"}
      </Button>

      <Collapsible.Root variant="contained" open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger>Build log</Collapsible.Trigger>
        <Collapsible.Panel>
          <pre style={{ margin: 0, fontFamily: "var(--pui-font-mono)" }}>
            {"resolved 248 modules\ncompiled in 1.12s\nno warnings"}
          </pre>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
