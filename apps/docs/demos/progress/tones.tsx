"use client";

import { Progress } from "@dofortech/forte-ui";

const TONES = [
  { tone: "primary", label: "Syncing", value: 40 },
  { tone: "secondary", label: "Indexing", value: 55 },
  { tone: "success", label: "Restore complete", value: 100 },
  { tone: "warning", label: "Storage used", value: 88 },
  { tone: "danger", label: "Quota exceeded", value: 97 },
  { tone: "neutral", label: "Background cleanup", value: 25 },
] as const;

export default function ProgressTones() {
  return (
    <div className="grid max-w-sm gap-6">
      {TONES.map(({ tone, label, value }) => (
        // `tone` swaps exactly one slot — the fill. The rail stays neutral in
        // every tone, because it is the part that has not happened yet and
        // tinting it would compete with the fill it exists to contrast
        // against.
        <Progress.Root key={tone} tone={tone} value={value}>
          <Progress.Label>{label}</Progress.Label>
          <Progress.Value />
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>
      ))}
    </div>
  );
}
