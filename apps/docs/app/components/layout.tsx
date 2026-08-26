/**
 * Wraps every component page's MDX output.
 *
 * The typography itself is applied per element in `mdx-components.tsx`; what
 * this adds is the measure. A line length is a property of the column, not of
 * the paragraph, so it belongs here — and keeping it here means a new
 * component page gets it for free.
 */
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-measure">{children}</div>;
}
