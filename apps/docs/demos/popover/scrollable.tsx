"use client";

import { Button, Popover, ScrollArea } from "@dofortech/pretty-ui";

const ACTIVITY = [
  ["09:41", "Deploy eu-central-1 finished in 3.4s"],
  ["09:38", "Contrast harness swept 119,108 seeds"],
  ["09:31", "tokens.color.css regenerated from ramp.mjs"],
  ["09:12", "Branch scroll-area merged into main"],
  ["08:57", "Preview environment eu-west-1 refused an upload"],
  ["08:55", "Nightly backup completed"],
  ["08:20", "Usage rollup completed"],
  ["07:44", "Invoice sweep completed"],
];

export default function PopoverScrollable() {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
        Recent activity
      </Popover.Trigger>
      <Popover.Popup>
        <Popover.Arrow />
        <Popover.Title>Recent activity</Popover.Title>
        {/* The popup itself never scrolls — it cannot, because the arrow sits
          * outside its box and any overflow would crop the wedge. Put the
          * scroll on something inside instead, and cap it with
          * `--available-height`: the positioner publishes the room it
          * measured between the anchor and the viewport edge, and the popup
          * passes it down by inheritance. The subtraction is the popup's own
          * padding, its title, and its gaps. */}
        <ScrollArea.Root className="max-h-[min(14rem,calc(var(--available-height)-8rem))]">
          <ScrollArea.Viewport aria-label="Recent activity">
            <ScrollArea.Content className="pe-4">
              <div className="grid gap-2">
                {ACTIVITY.map(([time, note]) => (
                  <div key={time} className="flex gap-3">
                    <span className="font-mono text-1 text-foreground-subtle">
                      {time}
                    </span>
                    <span className="text-foreground-muted">{note}</span>
                  </div>
                ))}
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}
