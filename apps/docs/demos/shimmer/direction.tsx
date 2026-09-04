"use client";

import { Shimmer } from "@forte-ui/react";

/* The default sweep follows the reading direction — flip the demo frame to
 * RTL and the top line reverses on its own. `reverse` runs against it, in
 * either direction. */
export default function ShimmerDirection() {
  return (
    <div className="grid gap-3">
      <Shimmer className="text-foreground-muted">Follows the reading direction</Shimmer>
      <Shimmer reverse className="text-foreground-muted">
        Runs against it
      </Shimmer>
    </div>
  );
}
