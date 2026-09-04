"use client";

import * as React from "react";
import { Button, Shimmer } from "@forte-ui/react";

/* The same element in both states. `active` is what changes, not the
 * component, so nothing around the label moves when the work finishes — the
 * text keeps its color, its size and its place on the line. */
export default function ShimmerActive() {
  const [pending, setPending] = React.useState(true);

  React.useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 3000);
    return () => clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" onClick={() => setPending(true)} disabled={pending}>
        Run again
      </Button>
      <Shimmer active={pending} className="text-foreground-muted">
        {pending ? "Summarizing thread…" : "Summary ready"}
      </Shimmer>
    </div>
  );
}
