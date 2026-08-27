"use client";

import { Copy, FileText, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { ContextMenu } from "@dofortech/pretty-ui";

const FILES = ["Q3 report.pdf", "budget.xlsx", "team offsite.md"];

export default function ContextMenuRows() {
  return (
    <ul className="w-full max-w-xs divide-y divide-border-muted overflow-hidden rounded-surface border border-border">
      {FILES.map((name) => (
        /* One `ContextMenu.Root` per row, so each row's menu can act on that
          * row. A single root around the list would open the same menu
          * wherever the pointer was, and nothing would say which file it
          * meant. `render={<li />}` keeps the trigger inside the list's
          * content model — a bare <div> child of a <ul> is invalid. */
        <ContextMenu.Root key={name}>
          <ContextMenu.Trigger
            render={<li />}
            className="flex items-center gap-3 bg-panel px-3 py-2 text-2 select-none"
          >
            <FileText aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
            {name}
          </ContextMenu.Trigger>

          <ContextMenu.Popup>
            {/* The label names the file the commands will act on — worth the
              * row here, because the menu opens at the pointer and covers the
              * row that produced it. It has to be inside a `Group`: that is
              * what makes it a heading announced with its members rather than
              * a stray line of text. */}
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>{name}</ContextMenu.GroupLabel>
              <ContextMenu.Item>
                <FolderOpen aria-hidden="true" />
                Open
              </ContextMenu.Item>
              <ContextMenu.Item aria-keyshortcuts="Meta+D">
                <Copy aria-hidden="true" />
                Duplicate
                <ContextMenu.Shortcut>⌘D</ContextMenu.Shortcut>
              </ContextMenu.Item>
              <ContextMenu.Item aria-keyshortcuts="F2">
                <Pencil aria-hidden="true" />
                Rename
                <ContextMenu.Shortcut>F2</ContextMenu.Shortcut>
              </ContextMenu.Item>
            </ContextMenu.Group>
            <ContextMenu.Separator />
            <ContextMenu.Item tone="danger" aria-keyshortcuts="Meta+Backspace">
              <Trash2 aria-hidden="true" />
              Delete
              <ContextMenu.Shortcut>⌘⌫</ContextMenu.Shortcut>
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Root>
      ))}
    </ul>
  );
}
