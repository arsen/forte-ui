"use client";

import * as React from "react";
import { Button, Shimmer } from "@forte-ui/react";

/* A single pass says "look here" where a loop would say "still waiting". The
 * `key` remounts the span so the animation restarts from its first frame —
 * a finished `once` sweep is holding its last frame, and toggling a prop
 * would not rewind it. */
export default function ShimmerOnce() {
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" onClick={() => setRun((n) => n + 1)}>
        Save
      </Button>
      <Shimmer key={run} once className="text-foreground-muted">
        Changes saved
      </Shimmer>
    </div>
  );
}
