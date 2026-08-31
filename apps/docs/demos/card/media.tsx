"use client";

import { AspectRatio, Badge, Button, Card } from "@forte-ui/react";

export default function CardMedia() {
  return (
    <Card.Root className="w-full max-w-[24rem]">
      {/* First child, so the media pulls the padding off its top and sides
        * and clips itself to the card's own corners. AspectRatio holds the
        * 16:9 box before the image arrives, so the text below never moves. */}
      <Card.Media>
        <AspectRatio ratio="video" variant="filled">
          <img src="/media/harbour.svg" alt="A harbour at dusk, seen from the water" />
        </AspectRatio>
      </Card.Media>
      <Card.Header>
        <Card.Title>Harbour at dusk</Card.Title>
        <Card.Description>Cais do Sodré · Lisbon</Card.Description>
        <Card.Action>
          <Badge variant="soft">New</Badge>
        </Card.Action>
      </Card.Header>
      <Card.Footer align="between">
        <span className="text-1 text-foreground-muted">Added yesterday</span>
        <Button size="sm" variant="outline">
          View gallery
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
