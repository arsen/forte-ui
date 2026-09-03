import { ogCard, size, contentType } from "@/components/og-card";

/**
 * The share card for the getting-started guides.
 *
 * A reader who is sent this link has not decided yet, so the card answers the
 * question they actually have — how much work is this — rather than
 * restating what the library is.
 *
 * Next collects metadata image files down the segment tree the way it merges
 * metadata, so this one file covers all four guides — a page only
 * needs its own if it wants to say something this card does not.
 */

// Static, and stated. See the note in `og-card.tsx`: under `output: "export"`
// Next refuses to collect a route handler that has not declared its intent,
// and an `opengraph-image` compiles to one.
export const dynamic = "force-static";

export { size, contentType };

export const alt = "Getting started with Forte UI — install, import one stylesheet, set a brand color";

export default function Image() {
  return ogCard({
    eyebrow: "Getting started",
    title: "Running in three steps",
    body: "Install, import one stylesheet, set your brand color. Guides for Next.js and Vite, or scaffold a fresh app with pnpm create forte-ui.",
  });
}
