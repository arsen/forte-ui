"use client";

import { Button, Table } from "@forte-ui/react";

export default function TableEmpty() {
  return (
    <Table.Root variant="outline" className="max-w-xl">
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Owner</Table.Head>
          <Table.Head>Updated</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          {/* One cell spanning every column: the header stays, so the
           * reader still knows what WOULD be here. */}
          <Table.Cell colSpan={3} align="center" className="py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="text-foreground-muted">No projects yet.</div>
              <Button size="sm">Create a project</Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
