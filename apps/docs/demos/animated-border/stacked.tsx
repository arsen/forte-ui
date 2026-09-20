"use client";

import * as React from "react";
import { AnimatedBorder, Card } from "@forte-ui/react";

/* Two lights on one ring. Nothing special is needed — each AnimatedBorder is
 * its own overlay, and a NEGATIVE delay starts the second one already half a
 * lap along instead of making it wait. `reverse` sends it the other way. */
export default function AnimatedBorderStacked() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card.Root className="items-center py-8">
        <AnimatedBorder />
        <AnimatedBorder
          tone="secondary"
          style={{ "--forte-animated-border-delay": "-3s" } as React.CSSProperties}
        />
        <span className="text-1 text-foreground-muted">two, half a lap apart</span>
      </Card.Root>

      <Card.Root className="items-center py-8">
        <AnimatedBorder />
        <AnimatedBorder tone="secondary" reverse />
        <span className="text-1 text-foreground-muted">two, counter-rotating</span>
      </Card.Root>
    </div>
  );
}
