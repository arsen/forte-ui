"use client";

import { Table } from "@forte-ui/react";

const ROWS = Array.from({ length: 24 }, (_, i) => ({
  id: `ORD-${(1200 + i).toString()}`,
  city: ["Lisbon", "Oslo", "Nairobi", "Kyoto", "Bogotá", "Toronto"][i % 6],
  items: (i % 5) + 1,
  total: ((i % 5) + 1) * 42.5,
}));

export default function TableStickyHeader() {
  return (
    /* The container is the scrollport, so the height cap, the frame and the
     * radius go on IT — a frame on the table would scroll away with the rows.
     * `stickyHeader` on the root then pins the header to the container's
     * top edge. */
    <Table.Container className="max-h-[18rem] max-w-xl rounded-surface border border-border-muted">
      <Table.Root stickyHeader>
        <Table.Header>
          <Table.Row>
            <Table.Head>Order</Table.Head>
            <Table.Head>Ship to</Table.Head>
            <Table.Head numeric>Items</Table.Head>
            <Table.Head numeric>Total</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ROWS.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell className="font-mono text-1">{row.id}</Table.Cell>
              <Table.Cell>{row.city}</Table.Cell>
              <Table.Cell numeric>{row.items}</Table.Cell>
              <Table.Cell numeric>${row.total.toFixed(2)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  );
}
