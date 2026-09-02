"use client";

import * as React from "react";
import { Table, type TableSortDirection } from "@forte-ui/react";

type Row = { name: string; language: string; stars: number; updated: string };

const REPOS: Row[] = [
  { name: "forte-ui", language: "TypeScript", stars: 1840, updated: "2026-08-30" },
  { name: "ramp", language: "JavaScript", stars: 312, updated: "2026-07-12" },
  { name: "motion-lab", language: "TypeScript", stars: 96, updated: "2026-05-02" },
  { name: "contrast-harness", language: "Rust", stars: 2205, updated: "2026-08-21" },
  { name: "docs", language: "MDX", stars: 58, updated: "2026-08-31" },
];

type SortKey = keyof Row;
type SortState = { key: SortKey; direction: Exclude<TableSortDirection, "none"> };

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Repository" },
  { key: "language", label: "Language" },
  { key: "stars", label: "Stars", numeric: true },
  { key: "updated", label: "Updated" },
];

export default function TableSorting() {
  const [sort, setSort] = React.useState<SortState>({ key: "stars", direction: "descending" });

  // The table holds no sort state and does no sorting: the header reports the
  // direction it should take next, and the rows are ordered here.
  const rows = [...REPOS].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    const order = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.direction === "ascending" ? order : -order;
  });

  return (
    <Table.Root variant="outline" className="max-w-xl">
      <Table.Header>
        <Table.Row>
          {COLUMNS.map((column) => (
            <Table.Head
              key={column.key}
              numeric={column.numeric}
              sort={sort.key === column.key ? sort.direction : "none"}
              onSortChange={(direction) => setSort({ key: column.key, direction })}
            >
              {column.label}
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell className="font-mono text-1">{row.name}</Table.Cell>
            <Table.Cell>{row.language}</Table.Cell>
            <Table.Cell numeric>{row.stars.toLocaleString()}</Table.Cell>
            <Table.Cell className="text-foreground-muted">{row.updated}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
