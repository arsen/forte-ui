"use client";

import { Progress } from "@dofortech/pretty-ui";

export default function ProgressBasic() {
  return (
    // The whole anatomy: Label and Value share the first row of the root's
    // grid, Track spans both columns underneath. Drop either one and the row
    // goes with it — a bar rendered with only a Track is a one-row grid, and
    // the gap disappears along with the row that was using it.
    <Progress.Root value={62} className="max-w-sm">
      <Progress.Label>Uploading footage</Progress.Label>
      <Progress.Value />
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}
