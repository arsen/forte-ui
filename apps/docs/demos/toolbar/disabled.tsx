"use client";

import { Redo2, Undo2 } from "lucide-react";
import { Toolbar } from "@dofortech/pretty-ui";

const ICON = "size-4 shrink-0";

export default function ToolbarDisabled() {
  return (
    <div className="grid gap-4">
      {/* One item. It keeps its place in the arrow-key order rather than
        * disappearing from it — the ARIA authoring practice for a toolbar, and
        * the reason `focusableWhenDisabled` defaults to true here. Arrow onto
        * it and a screen reader still announces the button, and that it is
        * dimmed. */}
      <Toolbar.Root aria-label="History">
        <Toolbar.Button iconOnly disabled aria-label="Undo">
          <Undo2 className={ICON} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Redo">
          <Redo2 className={ICON} />
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Button disabled>Save draft</Toolbar.Button>
        <Toolbar.Button variant="solid" tone="primary">
          Publish
        </Toolbar.Button>
      </Toolbar.Root>

      {/* One group. Composes with the root's own `disabled` — either being
        * true disables the item. */}
      <Toolbar.Root aria-label="Editing">
        <Toolbar.Group disabled aria-label="History">
          <Toolbar.Button iconOnly aria-label="Undo">
            <Undo2 className={ICON} />
          </Toolbar.Button>
          <Toolbar.Button iconOnly aria-label="Redo">
            <Redo2 className={ICON} />
          </Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Button>Save draft</Toolbar.Button>
      </Toolbar.Root>

      {/* The whole bar. A link is the one thing it cannot reach: HTML has no
        * disabled state for an <a>, so it stays live and focusable. Render it
        * conditionally if it must go away. */}
      <Toolbar.Root disabled aria-label="Review">
        <Toolbar.Button>Reject</Toolbar.Button>
        <Toolbar.Button variant="solid" tone="primary">
          Approve
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Link href="#toolbar-disabled">Version history</Toolbar.Link>
      </Toolbar.Root>
    </div>
  );
}
