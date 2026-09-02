"use client";

import { Table, type TableSize } from "@forte-ui/react";

const SIZES: TableSize[] = ["sm", "md", "lg"];

const ROWS = [
  { name: "Ada Lovelace", role: "Owner", seats: "12" },
  { name: "Grace Hopper", role: "Admin", seats: "4" },
];

export default function TableSizes() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      {SIZES.map((size) => (
        <Table.Root key={size} size={size} variant="outline">
          <Table.Caption className="font-mono text-1">size="{size}"</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head>Member</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head numeric>Seats</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map((row) => (
              <Table.Row key={row.name}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.role}</Table.Cell>
                <Table.Cell numeric>{row.seats}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ))}
    </div>
  );
}
