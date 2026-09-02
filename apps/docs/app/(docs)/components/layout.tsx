/**
 * Wraps every component page's MDX output.
 *
 * The typography is applied per element in `mdx-components.tsx`; what this used
 * to add was one `max-w-measure` around the lot, and the reason it does not is
 * worth keeping written down.
 *
 * Capping the whole column capped everything in it. A five-column prop table, a
 * demo showing sixteen variant×tone pairs and a code block with a long import
 * line all had 48rem to work with and scrolled inside themselves, while the page
 * sat in the middle of a display with room to spare. Those are the parts of a
 * component page a reader actually scans, and scanning is exactly what an
 * inner scrollbar breaks.
 *
 * Moving the cap onto `p`, `ul` and `ol` fixed that and bought a second
 * problem: the paragraphs then stopped short of the demo frame under them, for
 * no reason a reader could see. So there is no cap at either level now, and the
 * page column's own maximum in `app/(docs)/layout.tsx` is the only width there is.
 */
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
