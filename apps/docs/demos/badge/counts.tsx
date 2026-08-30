"use client";

import * as React from "react";
import { Badge, Button } from "@forte-ui/react";

export default function BadgeCounts() {
  const [count, setCount] = React.useState(9);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* One digit is a circle, more grow into a stadium, and anything past
          * `max` stops at "99+" so a runaway tally cannot widen the chip. */}
        <Badge variant="solid" tone="danger" shape="pill" count={1} />
        <Badge variant="solid" tone="danger" shape="pill" count={12} />
        <Badge variant="solid" tone="danger" shape="pill" count={480} />
        {/* `max={Infinity}` prints whatever it reaches. */}
        <Badge variant="soft" tone="neutral" shape="pill" count={480} max={Infinity} />
        {/* Children beat the rendered number, which is how your own
          * formatting keeps the count's geometry. */}
        <Badge variant="soft" tone="neutral" shape="pill" count={1240}>
          1.2k
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="soft" tone="primary" shape="pill" count={count} />
        <Button size="sm" variant="outline" tone="neutral" onClick={() => setCount((c) => c + 1)}>
          Add one
        </Button>
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          onClick={() => setCount(9)}
          disabled={count === 9}
        >
          Reset
        </Button>
        <span className="text-1 text-foreground-muted">
          Tabular figures, so 9 → 10 grows once and never jitters again.
        </span>
      </div>
    </div>
  );
}
