"use client";

import { AspectRatio } from "@forte-ui/react";

/* `clip` is on by default because media overflowing its own frame is a bug.
 * The exception is the decoration that is MEANT to break out — a badge on a
 * corner, a focus ring, a tooltip anchored inside. */
export default function AspectRatioUnclipped() {
  return (
    <div className="grid w-full gap-8 p-3 sm:grid-cols-2">
      {[true, false].map((clip) => (
        <div key={String(clip)} className="grid gap-3">
          <AspectRatio ratio="video" variant="filled" clip={clip}>
            <img src="/media/harbour.svg" alt="" />
            {/* Hangs off the corner: the negative logical margins are what push it
              * past the frame, and only the unclipped box lets them. */}
            <span className="-mt-2 -me-2 self-start justify-self-end rounded-pill bg-primary px-2 py-1 text-1 font-medium text-on-primary">
              New
            </span>
          </AspectRatio>
          <span className="font-mono text-1 text-foreground-muted">
            clip={"{"}
            {String(clip)}
            {"}"}
          </span>
        </div>
      ))}
    </div>
  );
}
