"use client";

import { Progress, ProgressCircle } from "@forte-ui/react";

export default function ProgressFormatting() {
  return (
    <div className="grid gap-7">
      {/* `format` is an Intl.NumberFormatOptions bag, and it formats the
        * CLAMPED value rather than the percentage — so the bar fills from
        * `min` to `max` while the readout, `aria-valuetext` and the visible
        * text all say the same thing in megabytes. */}
      <Progress.Root
        value={412}
        max={1024}
        format={{ style: "unit", unit: "megabyte", maximumFractionDigits: 0 }}
        className="max-w-sm"
      >
        <Progress.Label>Downloading update</Progress.Label>
        <Progress.Value />
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      {/* A function child gets `(formattedValue, value)` and can render
        * anything. Keep it short inside a ring: at `md` there is room for
        * about three characters. */}
      <div className="flex flex-wrap items-start gap-7">
        <ProgressCircle.Root value={3} max={5} size="lg" tone="secondary">
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value>{(_formatted, value) => `${value}/5`}</ProgressCircle.Value>
          <ProgressCircle.Label>Onboarding steps</ProgressCircle.Label>
        </ProgressCircle.Root>

        {/* `getAriaValueText` is the other half of the same idea, and the half
          * that matters more: it replaces what a screen reader says, so the
          * announcement is "3 of 5 steps done" rather than "60%". */}
        <ProgressCircle.Root
          value={3}
          max={5}
          size="lg"
          getAriaValueText={(_formatted, value) => `${value} of 5 steps done`}
        >
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value>{(_formatted, value) => `${value}/5`}</ProgressCircle.Value>
          <ProgressCircle.Label>Announced as steps</ProgressCircle.Label>
        </ProgressCircle.Root>
      </div>
    </div>
  );
}
