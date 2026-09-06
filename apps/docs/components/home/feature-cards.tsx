"use client";

import { Card } from "@forte-ui/react";

/**
 * The "What you get" grid: one card per reason the library is shaped the way
 * it is — a headline and a sentence, no link, because the prose behind each
 * lives in the Introduction and the entry cards above already lead there.
 */
const FEATURES = [
  {
    title: "One variable, whole system",
    body: "Set a seed color and twelve accent steps, brand-tinted neutrals, and a readable text color derive themselves — in both light and dark mode, in pure CSS.",
  },
  {
    title: "Contrast that is measured",
    body: "The ramp is verified against 119,108 in-gamut seeds. Text on a solid fill never drops below 4.5:1, whichever brand color you pick.",
  },
  {
    title: "Motion that listens",
    body: "Reduced motion is handled once, in the token layer. Movement stops, fades stay, and state that was carried by movement gets a second cue.",
  },
  {
    title: "Built on Base UI",
    body: "Keyboard behavior, focus management and ARIA come from primitives that are tested across browsers, platforms and screen readers.",
  },
  {
    title: "Yours to override",
    body: "Everything ships inside a cascade layer, so your CSS and your utility classes win without a single !important.",
  },
  {
    title: "No runtime",
    body: "No animation library, no CSS-in-JS, no theme provider. The components render, the browser does the rest.",
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
      {FEATURES.map((f) => (
        <Card.Root key={f.title}>
          <Card.Header>
            <Card.Title>
              <h3>{f.title}</h3>
            </Card.Title>
            <Card.Description className="text-pretty">{f.body}</Card.Description>
          </Card.Header>
        </Card.Root>
      ))}
    </div>
  );
}
