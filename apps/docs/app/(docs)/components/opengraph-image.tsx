import { ogCard, size, contentType } from "@/components/og-card";
import { CATALOG } from "@/components/component-catalog";

/**
 * The share card for the component index and every component page under it.
 *
 * The count is read from the catalog rather than typed out. It is the one
 * number on any of these cards that goes stale on its own — a component
 * lands, the card still advertises the old total — and `CATALOG` is the
 * same generated list the index page and the sidebar are built from, so it
 * cannot disagree with what a reader finds when they follow the link.
 *
 * Next collects metadata image files down the segment tree the way it merges
 * metadata, so this one file covers all fifty-seven routes beneath it — a page only
 * needs its own if it wants to say something this card does not.
 */

// Static, and stated. See the note in `og-card.tsx`: under `output: "export"`
// Next refuses to collect a route handler that has not declared its intent,
// and an `opengraph-image` compiles to one.
export const dynamic = "force-static";

export { size, contentType };

export const alt = `Forte UI components — ${CATALOG.length} accessible React components, re-themed from one CSS variable`;

export default function Image() {
  return ogCard({
    eyebrow: "Components",
    title: `${CATALOG.length} components, one palette`,
    body: "Keyboard behavior, focus management and ARIA come from primitives tested across browsers, platforms and screen readers.",
  });
}
