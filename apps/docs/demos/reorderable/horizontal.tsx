"use client";

import * as React from "react";
import { Reorderable } from "@forte-ui/react";

const VIEWS = [
  { id: "overview", name: "Overview" },
  { id: "board", name: "Board" },
  { id: "timeline", name: "Timeline" },
  { id: "calendar", name: "Calendar" },
  { id: "files", name: "Files" },
];

export default function ReorderableHorizontal() {
  const [views, setViews] = React.useState(VIEWS);

  return (
    /* One line, never wrapped — a wrapped row is a grid, and a grid is not
     * what this component reorders. On a narrow screen the strip scrolls
     * instead, and a drag held near its edge scrolls it along. */
    <div className="w-full overflow-x-auto p-2">
      {/* A row follows the document's direction: flip the frame to RTL and
        * the first view sits on the right, a drag to the left moves a view
        * toward the end, and so does the Left arrow key. */}
      <Reorderable.Root
        aria-label="Views"
        orientation="horizontal"
        value={views.map((view) => view.id)}
        onValueChange={(order) => {
          const byId = new Map(views.map((view) => [view.id, view]));
          setViews(order.map((id) => byId.get(id)!));
        }}
        className="mx-auto w-max gap-2"
      >
        {views.map((view) => (
          <Reorderable.Item
            key={view.id}
            value={view.id}
            label={view.name}
            className="flex items-center gap-1 rounded-pill border border-border bg-panel py-1 ps-1 pe-3 text-2 whitespace-nowrap"
          >
            <Reorderable.Handle className="rounded-pill" />
            {view.name}
          </Reorderable.Item>
        ))}
      </Reorderable.Root>
    </div>
  );
}
