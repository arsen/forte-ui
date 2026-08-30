"use client";

import { Search } from "lucide-react";
import { Toolbar } from "@dofortech/forte-ui";

const ICON = "size-4 shrink-0";

export default function ToolbarInput() {
  return (
    <Toolbar.Root aria-label="Find in document" wrap>
      {/* Try it with the keyboard: Left and Right move the CARET while it has
        * somewhere to go, and only hand the key back to the toolbar at either
        * end of the text. Home and End are never taken — a toolbar does not
        * bind them. That is Base UI's own handling, and it is the reason to
        * reach for `Toolbar.Input` rather than dropping a bare `Input` into
        * the bar — a bare one is not in the roving order at all, so Tab is the
        * only way past it. */}
      <Toolbar.Input
        aria-label="Search term"
        placeholder="Find…"
        defaultValue="toolbar"
      />
      <Toolbar.Input aria-label="Replace with" placeholder="Replace with…" />
      <Toolbar.Button iconOnly aria-label="Find next">
        <Search className={ICON} />
      </Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Button variant="solid" tone="primary">
        Replace all
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
