"use client";

import * as React from "react";
import { Reorderable } from "@forte-ui/react";

const TASKS = [
  { id: "brief", name: "Write the brief" },
  { id: "moodboard", name: "Collect references" },
  { id: "sketch", name: "Sketch three directions" },
  { id: "review", name: "Review with the team" },
  { id: "ship", name: "Ship the first draft" },
];

export default function ReorderableBasic() {
  const [tasks, setTasks] = React.useState(TASKS);

  return (
    <Reorderable.Root
      // The order on screen, as ids. The component never reorders anything
      // itself: it reports the move, and this state is what changes.
      value={tasks.map((task) => task.id)}
      onValueChange={(order) => {
        const byId = new Map(tasks.map((task) => [task.id, task]));
        setTasks(order.map((id) => byId.get(id)!));
      }}
      className="w-full max-w-xs divide-y divide-border-muted rounded-surface border border-border bg-panel"
    >
      {tasks.map((task) => (
        <Reorderable.Item
          key={task.id}
          value={task.id}
          // What a screen reader hears: "Picked up Write the brief. Position
          // 1 of 5." Without it the row's text is used.
          label={task.name}
          className="flex items-center gap-2 py-1 ps-1 pe-3 text-2"
        >
          <Reorderable.Handle />
          {task.name}
        </Reorderable.Item>
      ))}
    </Reorderable.Root>
  );
}
