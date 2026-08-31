"use client";

import { Badge, Button, Card, Menu } from "@forte-ui/react";

export default function CardAction() {
  return (
    <div className="grid w-full max-w-[24rem] gap-4">
      {/* A status pinned to the corner. With both a title and a description
        * the action sits at the top, beside the title, where a reader looks
        * for it. */}
      <Card.Root>
        <Card.Header>
          <Card.Title>Production deploy</Card.Title>
          <Card.Description>main @ 4be9165 · 2 minutes ago</Card.Description>
          <Card.Action>
            <Badge tone="success" variant="soft">
              Live
            </Badge>
          </Card.Action>
        </Card.Header>
        <Card.Content>
          Rolled out to all regions. No errors in the first five minutes.
        </Card.Content>
      </Card.Root>

      {/* A control instead of a status. The slot composes — a Menu trigger
        * keeps its own props, states and popup without the card wrapping
        * any of it. */}
      <Card.Root>
        <Card.Header>
          <Card.Title>API keys</Card.Title>
          <Card.Description>Two active keys.</Card.Description>
          <Card.Action>
            <Menu.Root>
              <Menu.Trigger
                render={
                  <Button variant="ghost" size="sm" iconOnly aria-label="Key actions" />
                }
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="3" cy="8" r="1.4" />
                  <circle cx="8" cy="8" r="1.4" />
                  <circle cx="13" cy="8" r="1.4" />
                </svg>
              </Menu.Trigger>
              <Menu.Popup>
                <Menu.Item>Create key</Menu.Item>
                <Menu.Item>Rotate all</Menu.Item>
                <Menu.Item tone="danger">Revoke all</Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </Card.Action>
        </Card.Header>
      </Card.Root>
    </div>
  );
}
