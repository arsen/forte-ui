"use client";

import { Badge, Table } from "@forte-ui/react";

const INVOICES = [
  { id: "INV-2041", customer: "Northwind", status: "Paid", tone: "success", amount: "$1,250.00" },
  { id: "INV-2040", customer: "Fabrikam", status: "Due today", tone: "warning", amount: "$840.00" },
  { id: "INV-2039", customer: "Contoso", status: "Failed", tone: "danger", amount: "$2,100.00" },
  { id: "INV-2038", customer: "Litware", status: "Draft", tone: "neutral", amount: "$415.50" },
] as const;

export default function TableBasic() {
  return (
    /* A width cap, because the demo frame centers its children and a table
     * at the frame's full width is wider than four columns need. */
    <Table.Root className="max-w-xl">
      <Table.Caption placement="bottom">A list of your recent invoices.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head numeric>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell className="font-mono text-1">{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.customer}</Table.Cell>
            <Table.Cell>
              <Badge tone={invoice.tone} size="sm" dot>
                {invoice.status}
              </Badge>
            </Table.Cell>
            <Table.Cell numeric>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
