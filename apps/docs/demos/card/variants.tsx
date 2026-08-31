"use client";

import { Card } from "@forte-ui/react";

const VARIANTS = ["outline", "soft", "elevated"] as const;

const BLURB: Record<(typeof VARIANTS)[number], string> = {
  outline: "A panel with a hairline. The default, and the one to reach for.",
  soft: "No edge; the fill goes one step deeper and does the separating.",
  elevated: "The hairline plus a shadow, for the card that leads a page.",
};

export default function CardVariants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {VARIANTS.map((variant) => (
        <Card.Root key={variant} variant={variant}>
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
          </Card.Header>
          <Card.Content>{BLURB[variant]}</Card.Content>
        </Card.Root>
      ))}
    </div>
  );
}
