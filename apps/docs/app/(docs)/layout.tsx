import { Sidebar } from "@/components/sidebar";
import { Toc } from "@/components/toc";

/**
 * The documentation shell: the page list on the left, the page, and the
 * "On this page" rail on the right.
 *
 * It is the layout of a ROUTE GROUP rather than of the root because one route
 * does not want it. The home page is a landing page — a hero, a component
 * gallery, a row of cards — and three columns would hand it the same 48rem a
 * prop table gets and leave a sidebar beside a hero that has nothing to
 * navigate. Everything under `(docs)` gets the columns; `app/page.tsx` gets
 * the bar and the full width. The group contributes no URL segment, so every
 * docs route is exactly where it was.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  /* The cap is on the PAGE COLUMN, not on the grid, and the two are
   * not interchangeable. A `max-width` on the grid is spent by the
   * two fixed rails first — at 72rem it leaves the page 38rem, less
   * than a five-column prop table needs — so the cap
   * that reads as "72rem of page" has to be written as the column's
   * own maximum. The rails then sit against it at every width and no
   * empty gutter opens up between the page and the section rail.
   *
   * `justify-center`, not `mx-auto`: the grid is `w-full` and has no
   * maximum of its own, so what needs centering is the column set
   * inside it, which is `justify-content` rather than a margin.
   *
   * Nothing else caps the reading measure any more, so this cap IS
   * the line length: prose, tables, demos and code blocks all run to
   * the same right edge, and `mdx-components.tsx` adds no second
   * maximum of its own. Widen this and the paragraphs widen too. */
  return (
    <div className="grid w-full flex-1 justify-center grid-cols-[15rem_minmax(0,var(--container-5xl))_14rem] gap-6 px-4 max-toc:grid-cols-[15rem_minmax(0,var(--container-6xl))] max-nav:grid-cols-[minmax(0,var(--container-6xl))]">
      <Sidebar />
      <main className="min-w-0 pt-7 pb-8" id="main">{children}</main>
      {/* The section rail. It renders nothing on a page with fewer than
        * two headings, and the track is a fixed width either way, so
        * the center column does not shift between pages. */}
      <Toc />
    </div>
  );
}
