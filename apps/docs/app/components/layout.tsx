/**
 * Wraps every component page's MDX output in `.prose`.
 *
 * MDX emits bare <h1>/<p>/<table> with no wrapper of its own, so without this
 * the pages render as unstyled HTML. Keeping it here rather than in each page
 * means a new component page gets the typography for free.
 */
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <div className="prose">{children}</div>;
}
