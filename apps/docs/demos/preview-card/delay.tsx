"use client";

import { PreviewCard } from "@dofortech/forte-ui";

const LINKS = [
  {
    id: "instant",
    label: "no wait",
    delay: 0,
    note: "Opens the moment the pointer arrives. Fine in isolation, and noisy in a paragraph — one sweep across the text pops a card at every link.",
  },
  {
    id: "default",
    label: "the default",
    delay: 600,
    note: "Long enough that passing over a link on the way somewhere else never opens anything. This is the default.",
  },
  {
    id: "patient",
    label: "a long wait",
    delay: 1200,
    note: "Deliberate enough that most readers never see the card at all, which is the wrong trade for content worth showing.",
  },
];

export default function PreviewCardDelay() {
  return (
    <p className="max-w-md text-2 leading-normal">
      Rest on{" "}
      {LINKS.map((link, index) => (
        <span key={link.id}>
          {index > 0 ? (index === LINKS.length - 1 ? ", or " : ", ") : ""}
          <PreviewCard.Root>
            {/* closeDelay is the other half of the feel: it is how long the
              * card waits after the pointer leaves the link, so overshooting
              * on the way into the card is forgiven. */}
            <PreviewCard.Trigger href="#" delay={link.delay} closeDelay={300}>
              {link.label}
            </PreviewCard.Trigger>
            <PreviewCard.Popup size="sm">
              <PreviewCard.Arrow />
              <span className="text-3 font-semibold">
                {link.delay} ms
              </span>
              <p className="text-2 text-foreground-muted">{link.note}</p>
            </PreviewCard.Popup>
          </PreviewCard.Root>
        </span>
      ))}{" "}
      and compare how long each one makes you hold still.
    </p>
  );
}
