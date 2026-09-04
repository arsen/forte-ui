"use client";

import { Shimmer } from "@forte-ui/react";

export default function ShimmerBasic() {
  return (
    <div className="grid gap-3">
      <Shimmer className="text-foreground-muted">Generating response…</Shimmer>
      <Shimmer className="text-4 font-medium text-foreground-muted">Thinking about your question</Shimmer>
    </div>
  );
}
