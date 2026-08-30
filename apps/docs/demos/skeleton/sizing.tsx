"use client";

import * as React from "react";
import { Button, Skeleton } from "@dofortech/forte-ui";

const NAME = "Adaobi Okonkwo";

export default function SkeletonSizing() {
  const [loading, setLoading] = React.useState(true);

  return (
    /* A definite width, for the same reason as the card demo: under
     * `justify-items-start` this block would be sized to its own max-content,
     * so the Guessed row growing would resize the whole thing — and the demo
     * frame centres it, so BOTH rows would slide sideways and the Sized row
     * would appear to shift too. */
    <div className="grid w-full max-w-sm gap-4">
      <Button variant="soft" className="justify-self-start" onClick={() => setLoading((v) => !v)}>
        {loading ? "Load" : "Reset"}
      </Button>

      <div className="grid gap-3 text-2">
        <div className="flex items-center gap-2">
          <span className="w-20 text-1 text-foreground-muted">Guessed</span>
          {/* A width picked by eye. It is never the width of the answer, so
            * the row jumps sideways the moment the name arrives. */}
          {loading ? <Skeleton.Root variant="text" width="4.5rem" /> : <span>{NAME}</span>}
          <span aria-hidden className="text-1 text-foreground-subtle">← watch this edge</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-20 text-1 text-foreground-muted">Sized</span>
          {/* Same content, handed to the skeleton. It is laid out and then
            * hidden with `visibility`, so the placeholder is exactly the box
            * the name will occupy — and nothing moves when it lands. */}
          <Skeleton.Root variant="text" loading={loading}>
            {NAME}
          </Skeleton.Root>
          <span aria-hidden className="text-1 text-foreground-subtle">← and this one</span>
        </div>
      </div>
    </div>
  );
}
