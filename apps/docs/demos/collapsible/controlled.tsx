"use client";

import * as React from "react";
import { Button, Collapsible } from "@dofortech/forte-ui";

const stack = "flex w-full max-w-lg flex-col gap-3";

export default function CollapsibleControlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={stack}>
      <Button variant="soft" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide the log" : "Show the log"}
      </Button>

      <Collapsible.Root variant="contained" open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger>Build log</Collapsible.Trigger>
        <Collapsible.Panel>
          <pre className="m-0 font-mono">
            {"resolved 248 modules\ncompiled in 1.12s\nno warnings"}
          </pre>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
