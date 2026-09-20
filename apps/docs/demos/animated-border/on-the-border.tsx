"use client";

import * as React from "react";
import { AnimatedBorder, Card } from "@forte-ui/react";

/* An overlay's `inset` resolves against the host's PADDING box, so by default
 * the ring lands just inside the card's own 1px hairline and the two read as
 * a doubled edge. Two ways out, both shown: pull the ring outward by the
 * host's border width, or paint that border away and let the ring be it. */
export default function AnimatedBorderOnTheBorder() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card.Root>
        <AnimatedBorder />
        <Card.Header>
          <Card.Title className="text-2">default</Card.Title>
          <Card.Description className="text-1">Ring inside the hairline.</Card.Description>
        </Card.Header>
      </Card.Root>

      <Card.Root style={{ "--forte-animated-border-inset": "-1px" } as React.CSSProperties}>
        <AnimatedBorder />
        <Card.Header>
          <Card.Title className="text-2">inset -1px</Card.Title>
          <Card.Description className="text-1">Pulled onto the hairline.</Card.Description>
        </Card.Header>
      </Card.Root>

      <Card.Root style={{ "--forte-card-border-color": "transparent" } as React.CSSProperties}>
        <AnimatedBorder />
        <Card.Header>
          <Card.Title className="text-2">border removed</Card.Title>
          <Card.Description className="text-1">The ring is the edge.</Card.Description>
        </Card.Header>
      </Card.Root>
    </div>
  );
}
