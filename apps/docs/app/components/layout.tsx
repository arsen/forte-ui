/**
 * Wraps every component page's MDX output.
 *
 * The typography is applied per element in `mdx-components.tsx`; what this used
 * to add was one `max-w-measure` around the lot. It no longer does, and the
 * difference is which things get to be wide.
 *
 * Capping the whole column capped everything in it. A five-column prop table, a
 * demo showing sixteen variant×tone pairs and a code block with a long import
 * line all had 48rem to work with and scrolled inside themselves, while the page
 * sat in the middle of a display with room to spare. Those are the parts of a
 * component page a reader actually scans, and scanning is exactly what an
 * inner scrollbar breaks.
 *
 * The measure has not gone away, it has moved to the elements that want one:
 * `p`, `ul` and `ol` in the element mapping. A line length is a property of
 * running text — a table is not running text, and neither is a demo.
 */
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
