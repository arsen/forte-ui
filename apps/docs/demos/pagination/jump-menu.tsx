"use client";

import * as React from "react";
import { Menu, Pagination, usePaginationRange } from "@forte-ui/react";

const COUNT = 30;

/* The ellipsis is inert on its own. Rendered as a `Menu.Trigger` it becomes
 * the way INTO the folded pages: the menu lists exactly the pages that gap
 * hides, so a reader can reach page 17 without clicking Next twelve times.
 *
 * The inner `render={<button type="button" />}` is what keeps `Menu.Trigger`
 * from also painting its own button chrome — it only styles itself when it
 * renders its default element. */
export default function PaginationJumpMenu() {
  const [page, setPage] = React.useState(5);
  const items = usePaginationRange({ page, count: COUNT });

  return (
    <Pagination.Root variant="outline">
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous
            iconOnly
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          />
        </Pagination.Item>
        {items.map((item, index) => {
          if (typeof item === "number") {
            return (
              <Pagination.Item key={item}>
                <Pagination.Link
                  current={item === page}
                  onClick={() => setPage(item)}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Pagination.Link>
              </Pagination.Item>
            );
          }

          // The pages this gap stands in for: everything strictly between
          // the numbers on either side of it.
          const before = items[index - 1] as number;
          const after = items[index + 1] as number;
          const hidden = Array.from(
            { length: after - before - 1 },
            (_, i) => before + 1 + i,
          );

          return (
            <Pagination.Item key={item}>
              <Menu.Root>
                <Pagination.Ellipsis
                  label={`Pages ${hidden[0]} to ${hidden[hidden.length - 1]}`}
                  render={<Menu.Trigger render={<button type="button" />} />}
                />
                <Menu.Popup>
                  {hidden.map((n) => (
                    <Menu.Item key={n} onClick={() => setPage(n)}>
                      Page {n}
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Root>
            </Pagination.Item>
          );
        })}
        <Pagination.Item>
          <Pagination.Next
            iconOnly
            disabled={page === COUNT}
            onClick={() => setPage((p) => p + 1)}
          />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}
