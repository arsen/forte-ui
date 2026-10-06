"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Reorderable } from "@forte-ui/react";

const STEPS = [
  { id: "trigger", name: "When a form is submitted", locked: true },
  { id: "enrich", name: "Look up the company", locked: false },
  { id: "score", name: "Score the lead", locked: false },
  { id: "notify", name: "Post to #sales", locked: false },
  { id: "log", name: "Add a row to the sheet", locked: false },
];

export default function ReorderableDisabled() {
  const [steps, setSteps] = React.useState(STEPS);

  return (
    <Reorderable.Root
      aria-label="Workflow steps"
      value={steps.map((step) => step.id)}
      onValueChange={(order, { id, to }) => {
        /* `disabled` stops an item being picked up, not passed over. The
         * trigger has to stay first, so the move that would put something
         * above it is refused here — and refused, it animates back. */
        if (to === 0 && id !== "trigger") return;
        const byId = new Map(steps.map((step) => [step.id, step]));
        setSteps(order.map((stepId) => byId.get(stepId)!));
      }}
      // Only the grip drags, even with a mouse: the rows are for reading.
      handleOnly
      className="w-full max-w-xs divide-y divide-border-muted rounded-surface border border-border bg-panel"
    >
      {steps.map((step) => (
        <Reorderable.Item
          key={step.id}
          value={step.id}
          label={step.name}
          disabled={step.locked}
          className="flex items-center gap-2 py-1 ps-1 pe-3 text-2 data-disabled:text-foreground-muted"
        >
          <Reorderable.Handle />
          <span className="flex-1">{step.name}</span>
          {step.locked ? (
            <>
              <Lock aria-hidden="true" className="size-4 shrink-0" />
              <span className="forte-visually-hidden">Locked</span>
            </>
          ) : null}
        </Reorderable.Item>
      ))}
    </Reorderable.Root>
  );
}
