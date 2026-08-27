"use client";

import { Toolbar } from "@dofortech/pretty-ui";

export default function ToolbarSizes() {
  return (
    <div className="grid gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        // `size` on the root is the default for every item inside it, so a bar
        // stays one height without repeating the prop per control. An item's
        // own `size` still wins.
        <Toolbar.Root key={size} size={size} aria-label={`Actions (${size})`}>
          <Toolbar.Button>Comment</Toolbar.Button>
          <Toolbar.Button>Share</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Link href="#toolbar-sizes">Version history</Toolbar.Link>
          <Toolbar.Button variant="solid" tone="primary">
            Approve
          </Toolbar.Button>
        </Toolbar.Root>
      ))}
    </div>
  );
}
