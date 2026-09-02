"use client";

import { Pagination, type PaginationVariant } from "@forte-ui/react";

const VARIANTS: PaginationVariant[] = ["ghost", "outline", "joined"];

/* One strip per variant, same markup throughout: the axis is a single prop
 * on the root. `joined` is the boxed look with the gaps closed — the slots
 * overlap by one border width and the current page is raised so its fill is
 * framed in its own colour on all four sides. */
export default function PaginationVariants() {
  return (
    <div className="grid gap-5">
      {VARIANTS.map((variant) => (
        <div key={variant} className="grid gap-2">
          <span className="text-1 font-medium text-foreground-muted">{variant}</span>
          <Pagination.Root variant={variant} aria-label={`Pagination, ${variant}`}>
            <Pagination.List>
              <Pagination.Item>
                <Pagination.Previous href="#" iconOnly />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">1</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">2</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#" current>
                  3
                </Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">4</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Ellipsis />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">20</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Next href="#" iconOnly />
              </Pagination.Item>
            </Pagination.List>
          </Pagination.Root>
        </div>
      ))}
    </div>
  );
}
