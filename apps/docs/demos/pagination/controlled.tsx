"use client";

import * as React from "react";
import { Pagination, usePaginationRange } from "@forte-ui/react";

const COUNT = 24;

/* No hrefs anywhere, so every slot renders a <button>: this strip pages
 * state in place. `usePaginationRange` turns the page and the count into the
 * slots to draw — the numbers, and a named ellipsis wherever the strip folds
 * — with a constant slot count, so Next never moves under the pointer. */
export default function PaginationControlled() {
  const [page, setPage] = React.useState(1);
  const items = usePaginationRange({ page, count: COUNT });

  return (
    <div className="grid justify-items-center gap-3">
      <Pagination.Root>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Previous
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
          </Pagination.Item>
          {items.map((item) => (
            <Pagination.Item key={item}>
              {typeof item === "number" ? (
                <Pagination.Link
                  current={item === page}
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
              disabled={page === COUNT}
              onClick={() => setPage((p) => p + 1)}
            />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>
      <p className="m-0 text-1 text-foreground-muted" aria-live="polite">
        Page {page} of {COUNT}
      </p>
    </div>
  );
}
