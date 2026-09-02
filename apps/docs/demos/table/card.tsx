"use client";

import { Badge, Button, Card, Table } from "@forte-ui/react";

const DEPLOYS = [
  { sha: "a1f9c2e", env: "Production", status: "Live", tone: "success", when: "4 min ago" },
  { sha: "7be03d1", env: "Preview", status: "Building", tone: "info", when: "12 min ago" },
  { sha: "c0d4e88", env: "Preview", status: "Failed", tone: "danger", when: "1 h ago" },
] as const;

export default function TableCard() {
  return (
    <Card.Root className="w-full max-w-xl">
      <Card.Header>
        <Card.Title>Recent deploys</Card.Title>
        <Card.Description>The last three builds across every environment.</Card.Description>
        <Card.Action>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </Card.Action>
      </Card.Header>
      {/* `line` inside a card: the card is already the frame, and a second
       * one an inch inside it would read as a box in a box. */}
      <Card.Content>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.Head>Commit</Table.Head>
              <Table.Head>Environment</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head align="end">When</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {DEPLOYS.map((deploy) => (
              <Table.Row key={deploy.sha}>
                <Table.Cell className="font-mono">{deploy.sha}</Table.Cell>
                <Table.Cell>{deploy.env}</Table.Cell>
                <Table.Cell>
                  <Badge tone={deploy.tone} size="sm" dot>
                    {deploy.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell align="end" className="text-foreground-muted">
                  {deploy.when}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  );
}
