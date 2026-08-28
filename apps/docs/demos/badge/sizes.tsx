"use client";

import { Badge } from "@dofortech/pretty-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function BadgeSizes() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {SIZES.map((size) => (
          <Badge key={size} size={size} tone="primary">
            {size}
          </Badge>
        ))}
      </div>
      {/* The point of the second row: a badge's height comes from its own
        * text, so it sits on the baseline of the sentence around it instead
        * of stretching the line. */}
      <p className="text-2 text-foreground-muted">
        Shipping <Badge size="sm" tone="success" variant="outline">v4.2.0</Badge> to the
        canary channel, with <Badge size="sm" tone="neutral">3 fixes</Badge> behind a flag.
      </p>
    </div>
  );
}
