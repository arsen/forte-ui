import Link from "next/link";
import { CardRoot, CardHeader, CardTitle, CardDescription } from "@forte-ui/react";
import { CATALOG, CATEGORIES } from "./component-catalog";
import { LINK_CARD, LINK_CARD_SURFACE, PROSE_H2 } from "./styles";

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
 * The cost is that `build-toc.mjs`, which reads headings out of the MDX AST,
 * sees none, so this route has no seed in `toc-registry.ts` and its rail is
 * assembled from the DOM on mount instead of arriving in the server HTML.
 * `Toc` is built for that case and says so at length; the home page's
 * `<h2 id>`s are the same shape. One route, one frame.
 */

/* Not github-slugger's, which is what `rehype-slug` gives the MDX headings, and
 * it does not need to be: nothing links to these from another page, and the
 * rail reads its ids off the DOM. It is the readable answer for the one
 * category with punctuation in it — `content-layout`, where the slugger's
 * literal reading of "Content & layout" would be `content--layout`. */
const slug = (category: string) =>
  category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ComponentIndex() {
  return (
    <>
      {CATEGORIES.map((category) => (
        <section key={category} aria-labelledby={slug(category)}>
          <h2 id={slug(category)} className={PROSE_H2}>
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
                <Link href={entry.href} className={LINK_CARD}>
                  <CardRoot className={LINK_CARD_SURFACE}>
                    <CardHeader>
                      <CardTitle>
                        {/* The exported name, not the prose title: this is what
                          * you type to use it, and the name someone scanning
                          * for `ScrollArea` is scanning for. The sidebar spaces
                          * the same names out, because a rail of fifty-six runs
                          * of camel case is harder to read down. */}
                        <h3>{entry.name}</h3>
                      </CardTitle>
                      <CardDescription className="text-pretty">{entry.summary}</CardDescription>
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
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
