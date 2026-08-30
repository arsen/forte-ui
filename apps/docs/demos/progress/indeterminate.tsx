"use client";

import { Progress, ProgressCircle } from "@forte-ui/react";

export default function ProgressIndeterminate() {
  return (
    <div className="grid justify-items-start gap-6">
      {/* `value={null}` is the whole switch. The markup is identical to the
        * determinate bar above it — which is the point: a task that starts out
        * not knowing its total can start reporting one without remounting. */}
      <Progress.Root value={null} className="max-w-sm">
        <Progress.Label>Preparing export</Progress.Label>
        {/* Value renders nothing while indeterminate. A function child is how
          * you put something else in its place, rather than a "0%" that never
          * moves. */}
        <Progress.Value>
          {(_formatted, value) => (value == null ? "Working…" : _formatted)}
        </Progress.Value>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <ProgressCircle.Root value={null}>
        <ProgressCircle.Track>
          <ProgressCircle.Indicator />
        </ProgressCircle.Track>
        <ProgressCircle.Label>Preparing export</ProgressCircle.Label>
      </ProgressCircle.Root>
    </div>
  );
}
