"use client";

import { Table } from "@forte-ui/react";

const COLUMNS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ROWS = [
  { metric: "Signups", values: [312, 340, 398, 421, 466, 512, 548, 601, 655, 702, 740, 812] },
  { metric: "Active", values: [1204, 1260, 1310, 1402, 1488, 1560, 1633, 1701, 1790, 1856, 1922, 2010] },
  { metric: "Churned", values: [24, 19, 31, 27, 22, 30, 26, 21, 28, 25, 23, 19] },
];

export default function TableScroll() {
  return (
    /* Thirteen columns do not fit a phone, or this frame. Inside the
     * container the TABLE scrolls and the page stays put; without it the
     * table would push the whole layout sideways. */
    <Table.Container className="max-w-xl">
      <Table.Root variant="grid" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.Head>Metric</Table.Head>
            {COLUMNS.map((month) => (
              <Table.Head key={month} numeric>
                {month}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ROWS.map((row) => (
            <Table.Row key={row.metric}>
              <Table.Head scope="row">{row.metric}</Table.Head>
              {row.values.map((value, i) => (
                <Table.Cell key={COLUMNS[i]} numeric>
                  {value.toLocaleString()}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  );
}
