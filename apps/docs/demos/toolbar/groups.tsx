"use client";

import { Copy, Scissors, ClipboardPaste, Redo2, Undo2 } from "lucide-react";
import { Toolbar } from "@dofortech/forte-ui";

const ICON = "size-4 shrink-0";

export default function ToolbarGroups() {
  return (
    <Toolbar.Root aria-label="Editing" wrap>
      {/* A group is a visual and semantic cluster, not a keyboard one: the
        * arrow keys still run the length of the whole bar. What changes is the
        * gap — tighter inside a group than between them — so the eye groups
        * the items before it reads them. */}
      <Toolbar.Group aria-label="History">
        <Toolbar.Button iconOnly aria-label="Undo">
          <Undo2 className={ICON} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Redo">
          <Redo2 className={ICON} />
        </Toolbar.Button>
      </Toolbar.Group>

      {/* Reach for a separator between groups that answer DIFFERENT questions,
        * and let the group gap carry the rest. It is not a stop: the arrow
        * keys pass straight over it. */}
      <Toolbar.Separator />

      <Toolbar.Group aria-label="Clipboard">
        <Toolbar.Button iconOnly aria-label="Cut">
          <Scissors className={ICON} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Copy">
          <Copy className={ICON} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Paste">
          <ClipboardPaste className={ICON} />
        </Toolbar.Button>
      </Toolbar.Group>

      {/* There is no prop for pushing a cluster to the far end, because there
        * is nothing for one to do that a margin does not: the bar is a flex
        * container. */}
      <Toolbar.Group aria-label="Review" className="ms-auto">
        <Toolbar.Button>Reject</Toolbar.Button>
        <Toolbar.Button variant="solid" tone="primary">
          Approve
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  );
}
