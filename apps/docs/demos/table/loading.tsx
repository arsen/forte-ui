"use client";

import * as React from "react";
import { Button, Skeleton, Table } from "@forte-ui/react";

const ROWS = [
  { id: "INV-2041", customer: "Northwind", amount: "$1,250.00" },
  { id: "INV-2040", customer: "Fabrikam", amount: "$840.00" },
  { id: "INV-2039", customer: "Contoso", amount: "$2,100.00" },
];

export default function TableLoading() {
  const [loading, setLoading] = React.useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <Button variant="outline" size="sm" onClick={() => setLoading((v) => !v)}>
        {loading ? "Show data" : "Show skeleton"}
      </Button>
      {/* The group wraps the whole table, not the body — a <div> inside a
       * <tbody> is invalid markup — and it is what announces "Loading" and
       * marks the region busy. The same rows render either way, so nothing
       * shifts when the data arrives. */}
      <Skeleton.Group loading={loading} label="Loading invoices" className="w-full">
        <Table.Root variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.Head>Invoice</Table.Head>
              <Table.Head>Customer</Table.Head>
              <Table.Head numeric>Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell className="font-mono text-1">
                  <Skeleton.Root>{row.id}</Skeleton.Root>
                </Table.Cell>
                <Table.Cell>
                  <Skeleton.Root>{row.customer}</Skeleton.Root>
                </Table.Cell>
                <Table.Cell numeric>
                  {/* A skeleton is a block sized to its content, so the cell's
                   * end alignment cannot reach it; the auto margin does. */}
                  <Skeleton.Root className="ms-auto">{row.amount}</Skeleton.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Skeleton.Group>
    </div>
  );
}
