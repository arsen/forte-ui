"use client";

import { Table, type TableVariant } from "@forte-ui/react";

const VARIANTS: TableVariant[] = ["line", "outline", "grid"];

const ROWS = [
  { region: "Europe", q1: "3,204", q2: "3,610" },
  { region: "Americas", q1: "2,987", q2: "3,105" },
  { region: "Asia-Pacific", q1: "1,540", q2: "1,922" },
];

export default function TableVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      {VARIANTS.map((variant) => (
        <Table.Root key={variant} variant={variant}>
          <Table.Caption className="font-mono text-1">variant="{variant}"</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head>Region</Table.Head>
              <Table.Head numeric>Q1</Table.Head>
              <Table.Head numeric>Q2</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map((row) => (
              <Table.Row key={row.region}>
                <Table.Cell>{row.region}</Table.Cell>
                <Table.Cell numeric>{row.q1}</Table.Cell>
                <Table.Cell numeric>{row.q2}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ))}
    </div>
  );
}
