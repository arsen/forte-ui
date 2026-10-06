"use client";

import * as React from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { ContextMenu, Reorderable } from "@forte-ui/react";

const NOTES = [
  { id: "groceries", name: "Groceries" },
  { id: "ideas", name: "Gift ideas" },
  { id: "trip", name: "Trip packing list" },
  { id: "books", name: "Books to read" },
];

export default function ReorderableContextMenu() {
  const [notes, setNotes] = React.useState(NOTES);

  return (
    <Reorderable.Root
      aria-label="Notes"
      value={notes.map((note) => note.id)}
      onValueChange={(order) => {
        const byId = new Map(notes.map((note) => [note.id, note]));
        setNotes(order.map((id) => byId.get(id)!));
      }}
      className="w-full max-w-xs divide-y divide-border-muted rounded-surface border border-border bg-panel"
    >
      {notes.map((note) => (
        <Reorderable.Item key={note.id} value={note.id} label={note.name}>
          <ContextMenu.Root>
            {/* On a touch screen the two long presses never meet: held on the
              * grip, the finger picks the row up and the menu stays shut; held
              * anywhere else on the row, it opens the menu, and the list does
              * not move. A right click opens the menu everywhere. */}
            <ContextMenu.Trigger className="flex items-center gap-2 py-1 ps-1 pe-3 text-2 select-none">
              <Reorderable.Handle />
              {note.name}
            </ContextMenu.Trigger>
            <ContextMenu.Popup>
              <ContextMenu.Item>
                <Pencil aria-hidden="true" />
                Rename
              </ContextMenu.Item>
              <ContextMenu.Item>
                <Copy aria-hidden="true" />
                Duplicate
              </ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item
                tone="danger"
                onClick={() => setNotes((list) => list.filter((n) => n.id !== note.id))}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Root>
        </Reorderable.Item>
      ))}
    </Reorderable.Root>
  );
}
