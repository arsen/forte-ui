import { ogCard, size, contentType } from "@/components/og-card";

/**
 * The share card for the customization guides.
 *
 * This section is where the library's one genuinely unusual claim is made,
 * so the card leads with the claim rather than with the section's name.
 *
 * Next collects metadata image files down the segment tree the way it merges
 * metadata, so this one file covers all five pages in the section — a page only
 * needs its own if it wants to say something this card does not.
 */

// Static, and stated. See the note in `og-card.tsx`: under `output: "export"`
// Next refuses to collect a route handler that has not declared its intent,
// and an `opengraph-image` compiles to one.
export const dynamic = "force-static";

export { size, contentType };

export const alt = "Forte UI customization — one CSS variable rebuilds the entire palette";

export default function Image() {
  return ogCard({
    eyebrow: "Customization",
    title: "One variable, whole system",
    body: "Set a seed color and twelve accent steps, brand-tinted neutrals and a readable text color derive themselves — light and dark, in pure CSS.",
  });
}
