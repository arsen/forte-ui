"use client";

import * as React from "react";
import { Pagination } from "@forte-ui/react";

const COUNT = 40;

/* The strip for a phone or a crowded table footer: no page numbers at all,
 * just the four jumps around a counter. `iconOnly` hides each label
 * visually and keeps it in the markup, so "First" and "Previous" are still
 * what a screen reader hears.
 *
 * The counter is a plain Item — the list is only markup, and a slot that
 * is text rather than a control is just an <li> with text in it. */
export default function PaginationCompact() {
  const [page, setPage] = React.useState(22);

  return (
    <Pagination.Root variant="joined" tone="neutral">
      <Pagination.List>
        <Pagination.Item>
          <Pagination.First iconOnly disabled={page === 1} onClick={() => setPage(1)} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Previous
            iconOnly
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          />
        </Pagination.Item>
        <Pagination.Item className="px-4 text-2 tabular-nums" aria-live="polite">
          Page {page} of {COUNT}
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next
            iconOnly
            disabled={page === COUNT}
            onClick={() => setPage((p) => p + 1)}
          />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Last iconOnly disabled={page === COUNT} onClick={() => setPage(COUNT)} />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}
