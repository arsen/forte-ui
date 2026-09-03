"use client";

import { Button, Card } from "@forte-ui/react";

export default function CardBasic() {
  return (
    /* A width, because the demo frame centers its children and a card
      * shrink-wrapped to its text is not the block-level surface under
      * discussion. */
    <Card.Root className="w-full max-w-[24rem]">
      <Card.Header>
        <Card.Title>Weekly digest</Card.Title>
        <Card.Description>
          A summary of your workspace, every Monday morning.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        Twelve issues closed, three opened, and the build got 14 seconds
        faster. Quietest week since March.
      </Card.Content>
      <Card.Footer align="end">
        <Button variant="ghost">Unsubscribe</Button>
        <Button variant="outline">Open report</Button>
      </Card.Footer>
    </Card.Root>
  );
}
