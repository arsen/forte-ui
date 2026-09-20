"use client";

import * as React from "react";
import { AnimatedBorder, Card } from "@forte-ui/react";

/* Every knob is a custom property on the component's own root, so it is set
 * in a `style` object the way every component's knobs are. */
export default function AnimatedBorderTheming() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card.Root
        style={{ "--forte-animated-border-width": "4px" } as React.CSSProperties}
      >
        <AnimatedBorder />
        <span className="text-1 text-foreground-muted">width 4px</span>
      </Card.Root>

      <Card.Root
        style={{ "--forte-animated-border-duration": "2s" } as React.CSSProperties}
      >
        <AnimatedBorder />
        <span className="text-1 text-foreground-muted">duration 2s</span>
      </Card.Root>

      <Card.Root
        style={{ "--forte-animated-border-beam-size": "3rem" } as React.CSSProperties}
      >
        <AnimatedBorder />
        <span className="text-1 text-foreground-muted">beam-size 3rem</span>
      </Card.Root>
    </div>
  );
}
