"use client";

import { Reveal } from "@forte-ui/react";

const ROWS = [
  "Scroll this panel",
  "Each row enters as it arrives",
  "and resets once it is fully out",
  "so scrolling back plays it again",
  "which is what repeat is for",
  "a demo of the effect itself",
  "or a panel whose contents change",
  "while nobody is looking at it",
];

/* The observer is rooted at the viewport, not at this box, and it still
 * works: an intersection is clipped by every ancestor's overflow on the way
 * up, so a row scrolled out of this panel is out of view even though the
 * panel is not. Nothing had to be told about the scroller. */
export default function RevealRepeat() {
  return (
    <div className="h-[16rem] w-full max-w-md overflow-y-auto rounded-surface border border-border-muted bg-background p-4">
      <div className="grid gap-3">
        {ROWS.map((row) => (
          <Reveal key={row} repeat className="rounded-2 border border-border-muted bg-panel p-3 text-2">
            {row}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
