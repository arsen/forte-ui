"use client";

import { Table } from "@forte-ui/react";

const ROWS = [
  { file: "index.html", size: "4.1 kB", modified: "2 minutes ago" },
  { file: "app.css", size: "18.7 kB", modified: "2 minutes ago" },
  { file: "main.js", size: "142.0 kB", modified: "1 hour ago" },
  { file: "vendor.js", size: "612.3 kB", modified: "3 days ago" },
  { file: "favicon.svg", size: "0.9 kB", modified: "3 weeks ago" },
  { file: "robots.txt", size: "0.1 kB", modified: "3 weeks ago" },
];

export default function TableStriped() {
  return (
    <Table.Root variant="outline" striped hoverable className="max-w-xl">
      <Table.Header>
        <Table.Row>
          <Table.Head>File</Table.Head>
          <Table.Head numeric>Size</Table.Head>
          <Table.Head>Modified</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {ROWS.map((row) => (
          <Table.Row key={row.file}>
            <Table.Cell className="font-mono text-1">{row.file}</Table.Cell>
            <Table.Cell numeric>{row.size}</Table.Cell>
            <Table.Cell className="text-foreground-muted">{row.modified}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
