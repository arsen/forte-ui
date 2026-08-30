"use client";

import { ProgressCircle } from "@forte-ui/react";

const RINGS = [
  { value: 24, tone: "primary", label: "Downloading" },
  { value: 68, tone: "secondary", label: "Transcoding" },
  { value: 100, tone: "success", label: "Published" },
] as const;

export default function ProgressCircleBasic() {
  return (
    <div className="flex flex-wrap gap-7">
      {RINGS.map(({ value, tone, label }) => (
        // Track and Value share one grid cell, which is what centres the
        // readout inside the ring; Label is placed into a second row that only
        // exists because it is rendered.
        <ProgressCircle.Root key={label} value={value} tone={tone}>
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value />
          <ProgressCircle.Label>{label}</ProgressCircle.Label>
        </ProgressCircle.Root>
      ))}
    </div>
  );
}
