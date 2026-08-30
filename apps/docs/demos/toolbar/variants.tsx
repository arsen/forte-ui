"use client";

import { Redo2, Undo2 } from "lucide-react";
import { Toolbar } from "@dofortech/forte-ui";

const ICON = "size-4 shrink-0";

function Items() {
  return (
    <>
      <Toolbar.Button iconOnly aria-label="Undo">
        <Undo2 className={ICON} />
      </Toolbar.Button>
      <Toolbar.Button iconOnly aria-label="Redo">
        <Redo2 className={ICON} />
      </Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Button>Save draft</Toolbar.Button>
    </>
  );
}

export default function ToolbarVariants() {
  return (
    <div className="grid gap-4">
      {/* `plain` also drops the padding to zero, and that is the point of it:
        * with no surface to sit on, padding would push the first control away
        * from whatever the bar is aligned with. */}
      <Toolbar.Root variant="plain" aria-label="Document (plain)">
        <Items />
      </Toolbar.Root>

      <Toolbar.Root variant="panel" aria-label="Document (panel)">
        <Items />
      </Toolbar.Root>

      <Toolbar.Root variant="outline" aria-label="Document (outline)">
        <Items />
      </Toolbar.Root>
    </div>
  );
}
