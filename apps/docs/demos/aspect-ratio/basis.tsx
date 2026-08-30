"use client";

import { AspectRatio } from "@dofortech/forte-ui";

/**
 * The case the padding-bottom technique cannot express at all.
 *
 * A percentage padding always resolves against the container's INLINE size, so
 * the old trick can only ever turn a width into a height. `basis="block"` goes
 * the other way: the row below fixes the height, and each thumbnail works out
 * its own width from the ratio — which is how three different shapes end up
 * sharing one baseline without anybody measuring anything.
 */
export default function AspectRatioBasis() {
  return (
    <div className="flex h-32 w-full items-stretch gap-3 overflow-x-auto">
      {(["square", "video", "portrait"] as const).map((ratio) => (
        <AspectRatio key={ratio} ratio={ratio} basis="block" variant="outlined">
          <img src="/media/harbour.svg" alt="" />
          <span className="place-self-end rounded-2 bg-panel/85 px-2 py-1 font-mono text-1 text-foreground">
            {ratio}
          </span>
        </AspectRatio>
      ))}
      <p className="min-w-40 flex-1 self-center text-1 text-foreground-muted">
        The row sets the height. Each frame derives its own width.
      </p>
    </div>
  );
}
