"use client";

import * as React from "react";
import { Checkbox, Table } from "@forte-ui/react";

const USERS = [
  { id: "u1", name: "Ada Lovelace", email: "ada@example.com", role: "Owner" },
  { id: "u2", name: "Grace Hopper", email: "grace@example.com", role: "Admin" },
  { id: "u3", name: "Katherine Johnson", email: "katherine@example.com", role: "Member" },
  { id: "u4", name: "Margaret Hamilton", email: "margaret@example.com", role: "Member" },
];

export default function TableSelection() {
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(["u2"]));

  const all = selected.size === USERS.length;
  const some = selected.size > 0 && !all;

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Table.Root variant="outline" hoverable>
        <Table.Header>
          <Table.Row>
            {/* The header checkbox is the whole-table control: ticked when
             * every row is, mixed when some are. `aria-label` because there
             * is no visible label a cell this narrow could hold. */}
            <Table.Head className="w-(--forte-space-8)">
              <Checkbox
                aria-label="Select all members"
                checked={all}
                indeterminate={some}
                onCheckedChange={(checked) =>
                  setSelected(checked ? new Set(USERS.map((user) => user.id)) : new Set())
                }
              />
            </Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Role</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {USERS.map((user) => {
            const isSelected = selected.has(user.id);
            return (
              /* `selected` is the tint; the checkbox is the state. Assistive
               * technology reads the checkbox, and so does the keyboard. */
              <Table.Row key={user.id} selected={isSelected}>
                <Table.Cell>
                  <Checkbox
                    aria-label={`Select ${user.name}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => toggle(user.id, checked)}
                  />
                </Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell className="text-foreground-muted">{user.email}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <p className="text-1 text-foreground-muted" aria-live="polite">
        {selected.size} of {USERS.length} selected
      </p>
    </div>
  );
}
