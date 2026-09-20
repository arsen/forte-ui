"use client";

import { AnimatedBorder, Card } from "@forte-ui/react";

const VARIANTS = [
  { variant: "beam", blurb: "One glow, constant speed." },
  { variant: "shine", blurb: "A drifting sheen, no leading edge." },
  { variant: "rotate", blurb: "A conic sweep about the center." },
] as const;

export default function AnimatedBorderVariants() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {VARIANTS.map(({ variant, blurb }) => (
        <Card.Root key={variant}>
          <AnimatedBorder variant={variant} />
          <Card.Header>
            <Card.Title className="text-2">{variant}</Card.Title>
            <Card.Description className="text-1">{blurb}</Card.Description>
          </Card.Header>
        </Card.Root>
      ))}
    </div>
  );
}
