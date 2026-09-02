"use client";

import * as React from "react";

/**
 * One slot in a pagination strip: a page number, or the gap standing in for
 * the pages that were folded away on that side of the current page.
 */
export type PaginationRangeItem = number | "start-ellipsis" | "end-ellipsis";

export interface UsePaginationRangeOptions {
  /**
   * The current page, 1-based. A value outside `1…count` is clamped rather
   * than thrown on, so a stale page from the URL still renders a strip.
   */
  page: number;
  /**
   * How many pages there are. `0` yields an empty range.
   */
  count: number;
  /**
   * Pages shown on EACH side of the current one before the strip folds.
   * @default 1
   */
  siblings?: number;
  /**
   * Pages always shown at EACH end of the strip — the first and last page
   * with the default, the first two and last two with `2`.
   * @default 1
   */
  boundaries?: number;
}

function range(start: number, end: number): number[] {
  const length = Math.max(end - start + 1, 0);
  return Array.from({ length }, (_, index) => start + index);
}

/**
 * Which pages to show for a given position in a long set — the first and
 * last, a window around the current page, and an ellipsis where the two do
 * not meet.
 *
 * ```tsx
 * const items = usePaginationRange({ page, count: 42 });
 * // page 1  → [1, 2, 3, 4, 5, "end-ellipsis", 42]
 * // page 20 → [1, "start-ellipsis", 19, 20, 21, "end-ellipsis", 42]
 * ```
 *
 * The number of slots is CONSTANT for a given `count`, `siblings` and
 * `boundaries`: an ellipsis takes exactly the place of the page it hides, and
 * when only one page would be hidden that page is shown instead of a gap
 * standing in for it. That is what keeps the Next button from moving under
 * the pointer as the reader pages through — a strip that changes width on
 * every click is the single most common pagination bug.
 *
 * The two ellipses have distinct names so they can be React keys directly;
 * a range never contains the same item twice.
 */
export function usePaginationRange({
  page,
  count,
  siblings = 1,
  boundaries = 1,
}: UsePaginationRangeOptions): PaginationRangeItem[] {
  return React.useMemo(() => {
    if (count < 1) return [];
    const current = Math.min(Math.max(Math.trunc(page), 1), count);

    const startPages = range(1, Math.min(boundaries, count));
    const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);

    // The window around the current page, pinned so it never overlaps the
    // boundary pages and never shrinks: near either end the window slides
    // rather than losing a sibling, which is the other half of the constant
    // slot count.
    const windowStart = Math.max(
      Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
      boundaries + 2,
    );
    const firstEndPage = endPages[0];
    const windowEnd = Math.min(
      Math.max(current + siblings, boundaries + siblings * 2 + 2),
      firstEndPage === undefined ? count - 1 : firstEndPage - 2,
    );

    return [
      ...startPages,
      // A gap only when it would hide MORE than one page; hiding exactly one
      // behind an ellipsis costs the same slot and tells the reader less.
      ...(windowStart > boundaries + 2
        ? (["start-ellipsis"] as const)
        : boundaries + 1 < count - boundaries
          ? [boundaries + 1]
          : []),
      ...range(windowStart, windowEnd),
      ...(windowEnd < count - boundaries - 1
        ? (["end-ellipsis"] as const)
        : count - boundaries > boundaries
          ? [count - boundaries]
          : []),
      ...endPages,
    ];
  }, [page, count, siblings, boundaries]);
}
