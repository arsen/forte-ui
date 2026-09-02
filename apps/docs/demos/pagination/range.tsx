"use client";

import * as React from "react";
import { Pagination, usePaginationRange } from "@forte-ui/react";

const COUNT = 50;

/* The hook's two knobs, side by side on the same page. `siblings` is how
 * many pages sit on EACH side of the current one; `boundaries` how many are
 * pinned at EACH end. Both strips are controlled by the same state, so
 * click through either and watch the other keep its width: the slot count
 * never changes for a given count, siblings and boundaries. */
const SHAPES = [
  { label: "siblings 1 · boundaries 1 (default)", siblings: 1, boundaries: 1 },
  { label: "siblings 2 · boundaries 2", siblings: 2, boundaries: 2 },
  { label: "siblings 0 · boundaries 1", siblings: 0, boundaries: 1 },
];

function Strip({
  page,
  onPageChange,
  siblings,
  boundaries,
}: {
  page: number;
  onPageChange: (page: number) => void;
  siblings: number;
  boundaries: number;
}) {
  const items = usePaginationRange({ page, count: COUNT, siblings, boundaries });

  return (
    <Pagination.Root size="sm" variant="outline">
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous
            iconOnly
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          />
        </Pagination.Item>
        {items.map((item) => (
          <Pagination.Item key={item}>
            {typeof item === "number" ? (
              <Pagination.Link
                current={item === page}
                onClick={() => onPageChange(item)}
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
            disabled={page === COUNT}
            onClick={() => onPageChange(page + 1)}
          />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}

export default function PaginationRange() {
  const [page, setPage] = React.useState(25);

  return (
    <div className="grid gap-5">
      {SHAPES.map((shape) => (
        <div key={shape.label} className="grid gap-2">
          <span className="text-1 font-medium text-foreground-muted">{shape.label}</span>
          <Strip
            page={page}
            onPageChange={setPage}
            siblings={shape.siblings}
            boundaries={shape.boundaries}
          />
        </div>
      ))}
    </div>
  );
}
