"use client";

import { Progress } from "@dofortech/pretty-ui";

const SIZES = [
  { size: "sm", thickness: "4px" },
  { size: "md", thickness: "6px" },
  { size: "lg", thickness: "10px" },
] as const;

export default function ProgressSizes() {
  return (
    <div className="grid max-w-sm gap-6">
      {SIZES.map(({ size, thickness }) => (
        // `size` is thickness, not length: the bar fills its container in
        // every size. Length belongs to the layout the bar sits in, which is
        // why it is `--pui-progress-length` rather than a fourth step here.
        <Progress.Root key={size} size={size} value={48}>
          <Progress.Label className="flex items-baseline gap-2">
            <code className="font-mono">{size}</code>
            <span className="font-normal text-foreground-muted">{thickness}</span>
          </Progress.Label>
          <Progress.Value />
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>
      ))}
    </div>
  );
}
