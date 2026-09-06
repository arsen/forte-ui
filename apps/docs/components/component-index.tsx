import Link from "next/link";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardMedia } from "@forte-ui/react";
import { CATALOG, CATEGORIES } from "./component-catalog";
import { ComponentPreview } from "./component-previews";
import { PROSE_H2 } from "./styles";
import { categorySlug } from "@/lib/category-slug.mjs";

/**
 * Every component in the library, as cards, grouped by category.
 *
 * Nothing here is a list of components. `component-catalog.ts` is GENERATED
 * from `@forte-ui/react/docs-data/components.json`, which docgen builds from
 * the `@summary` / `@category` doc comments it refuses to build without — so
 * the cards, their summaries, their categories and the sidebar all come from
 * the component source, and a component cannot ship without appearing here.
 * See `scripts/build-catalog.mjs` for how an entry resolves to a page, and for
 * the two directions it checks.
 *
 * ---------------------------------------------------------------------------
 * The headings are JSX, and the section rail is fine with that
 * ---------------------------------------------------------------------------
 * The category headings are rendered here rather than written as `##` in the
 * page's MDX, because a category the library adds would then need a hand edit
 * to appear — the drift this whole path exists to remove.
 *
 * `build-toc.mjs`, which reads headings out of the MDX AST, therefore sees
 * none here — so it seeds this route from the same `components.json` the
 * catalog is built from, one heading per category, with the id from
 * `categorySlug` below. That is what puts the rail in the server HTML for
 * this page too; before it, the rail and the phone's drawer button were
 * assembled from the DOM on mount and appeared a frame after everything
 * else. `Toc` still reconciles against the DOM, as on every page.
 *
 * ---------------------------------------------------------------------------
 * The card is not the link
 * ---------------------------------------------------------------------------
 * The home page's entry cards wrap the whole card in the anchor. These cannot:
 * the top of each one is a live rendering of the component
 * (`component-previews.tsx`), and Breadcrumb, Pagination, NavList and the
 * rest render anchors of their own — an `<a>` inside an `<a>` is closed early
 * by the HTML parser, so the server HTML and the client tree disagree and
 * hydration fails. The preview is `inert`, which takes it out of focus, hit
 * testing and the accessibility tree, but not out of the parser.
 *
 * So the link is the title, stretched: an `::after` pinned to the card's
 * edges makes the whole surface the target, the card is `relative` to give
 * that box its bounds, and the card — not the anchor — carries the hover
 * border and the focus ring. `forte-focus-ring-within` is the library's own
 * class for exactly this: the ring draws on the card when a descendant is
 * `:focus-visible`, and the anchor's own outline is suppressed so there is
 * one ring, not two. The link's accessible name is now just the component's
 * name, which is the right one for a list of sixty; `aria-describedby`
 * hands a screen reader the summary on request.
 *
 * `has-[a:hover]` rather than `group-hover`: hover has to originate on the
 * anchor (its `::after` is what the pointer is over) and land on the card,
 * which is the anchor's ancestor — the direction `group` does not run. The
 * preview's own anchors cannot match it; inert elements are never hovered.
 */

/** The card. `h-full` so a row of cards stays one height, whatever their
 *  summaries wrap to. No transition, for the reason `LINK_CARD` gives. */
const PREVIEW_CARD = "relative h-full forte-focus-ring-within has-[a:hover]:border-primary-border";

/** The stage's seam with the card body. The preview draws on the page color
 *  inside a panel-colored card, the way every demo frame does, and the rule
 *  is what stops a light preview reading as a floating slab. */
const PREVIEW_MEDIA = "border-b border-border-muted";

/** The title link, stretched over the card — see the header. */
const STRETCHED_LINK = "after:absolute after:inset-0";

export function ComponentIndex() {
  return (
    <>
      {CATEGORIES.map((category) => (
        <section key={category} aria-labelledby={categorySlug(category)}>
          <h2 id={categorySlug(category)} className={PROSE_H2}>
            {category}
          </h2>
          {/* `auto-fill`, not `auto-fit`: with a category down to two entries,
            * `auto-fit` collapses the empty tracks and stretches those two to
            * half the page each, so the cards change size from one section to
            * the next. `auto-fill` keeps the tracks, and every card on the page
            * is the same width. */}
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4 p-0">
            {CATALOG.filter((entry) => entry.category === category).map((entry) => (
              <li key={entry.name}>
                <CardRoot className={PREVIEW_CARD}>
                  <CardMedia className={PREVIEW_MEDIA}>
                    <ComponentPreview name={entry.name} />
                  </CardMedia>
                  <CardHeader>
                    <CardTitle>
                      {/* The exported name, not the prose title: this is what
                        * you type to use it, and the name someone scanning
                        * for `ScrollArea` is scanning for. The sidebar spaces
                        * the same names out, because a rail of fifty-six runs
                        * of camel case is harder to read down. */}
                      <h3>
                        <Link
                          href={entry.href}
                          className={STRETCHED_LINK}
                          aria-describedby={`${entry.name}-summary`}
                        >
                          {entry.name}
                        </Link>
                      </h3>
                    </CardTitle>
                    <CardDescription id={`${entry.name}-summary`} className="text-pretty">
                      {entry.summary}
                    </CardDescription>
                    {/* The four entries that head no page of their own. The
                      * card still exists — someone looking for AlertDialog
                      * should find it here — and this line is what stops two
                      * cards arriving at one page reading as a duplicate.
                      *
                      * `col-start-1` is load-bearing, and its absence is not
                      * visible until you look at one of these four cards.
                      * `Card.Header` is a two-column grid, message beside
                      * action, and only the title and the description claim
                      * column 1 — so a third child auto-places into the first
                      * free cell, which is the ACTION corner. The note stood
                      * as a second column and squeezed the summary beside it
                      * to a hundred pixels.
                      *
                      * No margin: the header's own `row-gap` already spaces
                      * the title from the description, and this line is one
                      * more row of the same list. */}
                    {entry.partOf && (
                      <p className="col-start-1 m-0 text-1 text-foreground-subtle">
                        Documented with {entry.partOf}
                      </p>
                    )}
                  </CardHeader>
                </CardRoot>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
