"use client";

import { Card, Reveal } from "@forte-ui/react";

/* Nothing here says when to play, and that is the component: the card enters
 * the first time it reaches the screen, which on this page is the moment you
 * scrolled to it. The frame's Reset control below plays it again. */
export default function RevealBasic() {
  return (
    <Reveal className="w-full max-w-sm">
      <Card.Root>
        <Card.Header>
          <Card.Title>One less thing to wire up</Card.Title>
          <Card.Description>
            Wrap anything. It fades and rises into place when the reader gets
            to it, once, and then stays out of the way.
          </Card.Description>
        </Card.Header>
      </Card.Root>
    </Reveal>
  );
}
