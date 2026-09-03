"use client";

import * as React from "react";
import { Button, Popover, Switch } from "@forte-ui/react";

const STEPS = [
  {
    id: "step-connect",
    name: "Connect",
    body: "Point the CLI at your workspace and sign in once.",
  },
  {
    id: "step-configure",
    name: "Configure",
    body: "Pick a seed color; the rest of the palette derives from it.",
  },
  {
    id: "step-ship",
    name: "Ship",
    body: "Build, and the contrast harness gates the release.",
  },
];

export default function PopoverControlled() {
  // Two pieces of state, because a multi-trigger popover has two questions:
  // whether it is open, and which trigger it is attached to. `triggerId` is
  // what anchors the popup, so it has to be set before `open` is honored.
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(
    STEPS[0].id,
  );

  const step = STEPS.find((item) => item.id === triggerId) ?? STEPS[0];
  const index = STEPS.indexOf(step);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Popover.Root
        open={open}
        triggerId={triggerId}
        // Every route out reports here — Escape, an outside press and
        // Popover.Close alike. There is no separate onTriggerIdChange: the
        // trigger that caused the change arrives on the event details, so
        // both pieces of state are updated from this one handler.
        onOpenChange={(nextOpen, eventDetails) => {
          if (nextOpen && eventDetails.trigger?.id) {
            setTriggerId(eventDetails.trigger.id);
          }
          setOpen(nextOpen);
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((item) => (
            <Popover.Trigger
              key={item.id}
              id={item.id}
              render={<Button variant="outline" tone="neutral" size="sm" />}
            >
              {item.name}
            </Popover.Trigger>
          ))}
        </div>

        <Popover.Popup size="sm">
          <Popover.Arrow />
          <Popover.Title>{step.name}</Popover.Title>
          <Popover.Description>{step.body}</Popover.Description>
          <Popover.Footer align="between">
            {/* Moving between steps is a state change, not a close: setting
              * triggerId alone re-anchors the same popup to the next button
              * without it ever leaving the screen. */}
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              disabled={index === STEPS.length - 1}
              onClick={() => setTriggerId(STEPS[index + 1]?.id ?? null)}
            >
              Next step
            </Button>
            <Popover.Close
              render={<Button variant="soft" tone="neutral" size="sm" />}
            >
              Done
            </Popover.Close>
          </Popover.Footer>
        </Popover.Popup>
      </Popover.Root>

      <label className="flex items-center gap-3">
        <Switch
          checked={open}
          onCheckedChange={setOpen}
          aria-label="Show the walkthrough"
        />
        Show the walkthrough
      </label>
    </div>
  );
}
