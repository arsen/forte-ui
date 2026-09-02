"use client";

import { Pagination } from "@forte-ui/react";

/* Every slot has an href, so every slot is a real <a>: a page is an address
 * that opens in a new tab. The current page is a Link too, marked `current`
 * — unlike a breadcrumb, reloading the page you are on is a reasonable thing
 * to ask a pagination strip for. */
export default function PaginationBasic() {
  return (
    <Pagination.Root>
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
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#">12</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}
