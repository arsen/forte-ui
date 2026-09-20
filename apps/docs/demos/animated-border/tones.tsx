"use client";

import { AnimatedBorder, Card } from "@forte-ui/react";

const TONES = ["primary", "secondary", "danger", "neutral"] as const;

export default function AnimatedBorderTones() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TONES.map((tone) => (
        <Card.Root key={tone} className="items-center py-6">
          <AnimatedBorder tone={tone} />
          <span className="text-1 text-foreground-muted">{tone}</span>
        </Card.Root>
      ))}
    </div>
  );
}
