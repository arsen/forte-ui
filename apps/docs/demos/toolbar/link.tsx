"use client";

import { Toolbar } from "@forte-ui/react";

export default function ToolbarLink() {
  return (
    <Toolbar.Root variant="outline" aria-label="Pull request">
      <Toolbar.Button variant="solid" tone="primary">
        Merge
      </Toolbar.Button>
      <Toolbar.Button>Close</Toolbar.Button>

      <Toolbar.Separator />

      {/* Drawn as a link and not as a button on purpose: it navigates, and the
        * underline is the only cue that says so before it is clicked — colour
        * alone would fail SC 1.4.1 against the buttons beside it, which share
        * the bar's text colour. */}
      <Toolbar.Link href="#toolbar-link">Files changed</Toolbar.Link>
      <Toolbar.Link href="#toolbar-link">Checks</Toolbar.Link>
    </Toolbar.Root>
  );
}
