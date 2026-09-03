import { ogCard, size, contentType } from "@/components/og-card";

/**
 * The site's share card — the home page's, and the fallback for every route
 * that does not override it.
 *
 * Living at the root of `app/` is what makes it the fallback: Next collects
 * metadata image files down the segment tree the same way it merges metadata,
 * so a section that wants its own card puts one in its own directory and
 * everything under that inherits it. There are four of those, and between
 * them they cover every route on the site — so in practice this card is the
 * home page's, which is also the URL that gets shared most and the one the
 * GitHub repo's social preview is cut from.
 *
 * No eyebrow. The logo directly above the headline already says "Forte UI",
 * and a card that names the site twice before saying anything about it wastes
 * the one line a reader in a feed actually stops for.
 */

// Static, and stated. See the note in `og-card.tsx`: under `output: "export"`
// Next refuses to collect a route handler that has not declared its intent,
// and an `opengraph-image` compiles to one.
export const dynamic = "force-static";

export { size, contentType };

export const alt =
  "Forte UI — an accessible React component library re-themed from one CSS variable";

export default function Image() {
  return ogCard({
    // Not `SITE_TAGLINE`. That string is the meta description, written for a
    // search result where a full sentence about the runtime earns its length;
    // this is read in a feed at thumbnail size, where the second clause is
    // never reached. Same claim, cut to what survives the glance.
    title: "Accessible React components",
    body: "One CSS variable rebuilds the entire palette. Contrast is measured, motion respects every preference, and nothing ships a runtime.",
  });
}
