"use client";

import * as React from "react";
import { Pagination, Select, usePaginationRange } from "@forte-ui/react";

const TOTAL = 97;
const PAGE_SIZES = { "10": "10 per page", "25": "25 per page", "50": "50 per page" };

/* The footer of a data table: a page-size select, the row range, and the
 * strip. Changing the page size re-derives the page count, and the current
 * page is clamped to it — jumping to page 10 of 4 is the bug this line
 * exists to prevent. The range text is the live region, not the strip:
 * "Showing 26–50 of 97" is what changed, and it says so once. */
export default function PaginationTableFooter() {
  const [pageSize, setPageSize] = React.useState("25");
  const [page, setPage] = React.useState(2);

  const size = Number(pageSize);
  const count = Math.max(1, Math.ceil(TOTAL / size));
  const current = Math.min(page, count);
  const items = usePaginationRange({ page: current, count });

  const first = (current - 1) * size + 1;
  const last = Math.min(current * size, TOTAL);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <Select.Root
        items={PAGE_SIZES}
        value={pageSize}
        onValueChange={(value) => {
          if (value == null) return;
          setPageSize(value);
          setPage(1);
        }}
      >
        <Select.Trigger size="sm" aria-label="Rows per page">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          {Object.entries(PAGE_SIZES).map(([value, label]) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>

      <p className="m-0 text-1 text-foreground-muted tabular-nums" aria-live="polite">
        Showing {first}–{last} of {TOTAL}
      </p>

      <Pagination.Root size="sm" tone="neutral">
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Previous
              iconOnly
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            />
          </Pagination.Item>
          {items.map((item) => (
            <Pagination.Item key={item}>
              {typeof item === "number" ? (
                <Pagination.Link
                  current={item === current}
                  onClick={() => setPage(item)}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Pagination.Link>
              ) : (
                <Pagination.Ellipsis />
              )}
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next
              iconOnly
              disabled={current === count}
              onClick={() => setPage(current + 1)}
            />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>
    </div>
  );
}
