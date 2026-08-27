"use client";

import { Button, Popover } from "@dofortech/pretty-ui";

type Metric = { id: string; name: string; value: string; note: string };

const METRICS: Metric[] = [
  {
    id: "mau",
    name: "Monthly active users",
    value: "18,402",
    note: "Anyone who signed in at least once in the last 30 days.",
  },
  {
    id: "retention",
    name: "30-day retention",
    value: "62%",
    note: "Of the cohort that signed up two months ago and came back.",
  },
  {
    id: "latency",
    name: "p95 latency",
    value: "184 ms",
    note: "Measured at the edge, excluding client render time.",
  },
];

export default function PopoverMultipleTriggers() {
  return (
    // One Root, one popup, three triggers. Each trigger hands the popup a
    // `payload`, and the popup reads it from the render-function form of
    // Root's children — so the content is written once instead of three
    // times, and only one popup element is ever mounted.
    <Popover.Root<Metric>>
      {({ payload }) => (
        <>
          {METRICS.map((metric) => (
            <Popover.Trigger
              key={metric.id}
              payload={metric}
              render={<Button variant="outline" tone="neutral" />}
            >
              {metric.name}
            </Popover.Trigger>
          ))}

          <Popover.Popup size="sm">
            <Popover.Arrow />
            {/* `payload` is undefined on the frames before the first open, and
              * again while the popup is animating out — Base UI keeps the
              * popup mounted until the exit finishes. Guard it, or the title
              * empties in full view of the closing gesture. */}
            {payload ? (
              <>
                <Popover.Title>{payload.value}</Popover.Title>
                <Popover.Description>{payload.note}</Popover.Description>
              </>
            ) : null}
          </Popover.Popup>
        </>
      )}
    </Popover.Root>
  );
}
