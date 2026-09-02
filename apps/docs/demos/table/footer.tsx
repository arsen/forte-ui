"use client";

import { Table } from "@forte-ui/react";

const LINES = [
  { item: "Scale plan", qty: 1, unit: 480, total: 480 },
  { item: "Additional seats", qty: 6, unit: 24, total: 144 },
  { item: "Priority support", qty: 1, unit: 120, total: 120 },
];

const money = (n: number) => `$${n.toFixed(2)}`;
const SUM = LINES.reduce((acc, line) => acc + line.total, 0);

export default function TableFooter() {
  return (
    <Table.Root variant="outline" className="max-w-xl">
      <Table.Header>
        <Table.Row>
          <Table.Head>Item</Table.Head>
          <Table.Head numeric>Qty</Table.Head>
          <Table.Head numeric>Unit</Table.Head>
          <Table.Head numeric>Total</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {LINES.map((line) => (
          <Table.Row key={line.item}>
            {/* The item name is this row's header — the cell that names the
             * others. `scope="row"` is what lets a screen reader read
             * "Additional seats, Total, $144.00" instead of just the number. */}
            <Table.Head scope="row">{line.item}</Table.Head>
            <Table.Cell numeric>{line.qty}</Table.Cell>
            <Table.Cell numeric>{money(line.unit)}</Table.Cell>
            <Table.Cell numeric>{money(line.total)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={3}>Total due</Table.Cell>
          <Table.Cell numeric>{money(SUM)}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}
