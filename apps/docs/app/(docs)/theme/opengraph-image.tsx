import { ogCard, size, contentType } from "@/components/og-card";

/**
 * The share card for the Theme Studio.
 *
 * The studio is the page most worth sharing on its own — it is the claim made
 * demonstrable — and it is a single route, so this card can be about the one
 * thing rather than about a section.
 *
 * Next collects metadata image files down the segment tree the way it merges
 * metadata, so this one file covers the one route — a page only
 * needs its own if it wants to say something this card does not.
 */

// Static, and stated. See the note in `og-card.tsx`: under `output: "export"`
// Next refuses to collect a route handler that has not declared its intent,
// and an `opengraph-image` compiles to one.
export const dynamic = "force-static";

export { size, contentType };

export const alt = "Forte UI Theme Studio — design a theme live and copy the CSS";

export default function Image() {
  return ogCard({
    eyebrow: "Theme Studio",
    title: "Design your theme, live",
    body: "Pick a seed color and watch the whole system rebuild around it. Copy the CSS, or take a scaffold command that reproduces it.",
  });
}
