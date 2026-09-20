"use client";

import { AnimatedBorder, Card } from "@forte-ui/react";

export default function AnimatedBorderBasic() {
  return (
    <Card.Root className="w-full max-w-sm">
      <AnimatedBorder />
      <Card.Header>
        <Card.Title>Pro</Card.Title>
        <Card.Description>Everything in Starter, plus unlimited projects.</Card.Description>
      </Card.Header>
    </Card.Root>
  );
}
