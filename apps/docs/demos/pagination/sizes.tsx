"use client";

import { Pagination, type PaginationSize } from "@forte-ui/react";

const SIZES: PaginationSize[] = ["sm", "md", "lg"];

/* `size` re-points the height, padding, text and icon knobs together, and
 * the height is the same control token Button reads, so a strip lines up
 * with the buttons beside it at every size — and follows the frame's
 * density control the way they do. */
export default function PaginationSizes() {
  return (
    <div className="grid gap-5">
      {SIZES.map((size) => (
        <Pagination.Root key={size} size={size} variant="joined" aria-label={`Pagination, ${size}`}>
          <Pagination.List>
            <Pagination.Item>
              <Pagination.Previous href="#" />
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Link href="#">1</Pagination.Link>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Link href="#" current>
                2
              </Pagination.Link>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Link href="#">3</Pagination.Link>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next href="#" />
            </Pagination.Item>
          </Pagination.List>
        </Pagination.Root>
      ))}
    </div>
  );
}
