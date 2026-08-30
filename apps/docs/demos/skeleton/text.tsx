"use client";

import { Skeleton } from "@forte-ui/react";

/* Explicit newlines rather than natural wrapping, so this is provably three
 * lines at every viewport width — which is what makes the overlay below a
 * measurement rather than a coincidence. */
const COPY = `Base UI ships the behaviour.
forte-ui ships the pixels.
Nothing here is hardcoded.`;

export default function SkeletonText() {
  return (
    <div className="grid gap-5">
      {/* Both layers occupy the SAME grid cell, so the bars are drawn directly
        * over the text they stand in for. Each bar covers its line's ink and
        * each gap is that line's leading — which is why swapping one for the
        * other moves nothing on the page. */}
      <div className="grid w-full max-w-sm">
        {/* `m-0` is load-bearing: the docs site does not import Preflight, so a
          * bare `<p>` keeps the UA's 1em block margins and the two layers would
          * be measured against different boxes. */}
        <p className="col-start-1 row-start-1 m-0 whitespace-pre-line text-2 leading-normal">
          {COPY}
        </p>
        <Skeleton.Text
          lines={3}
          animation="none"
          className="col-start-1 row-start-1 text-2 opacity-70"
        />
      </div>

      <div className="grid w-full max-w-sm gap-2">
        <span className="text-1 text-foreground-muted">On its own, at three sizes</span>
        {/* The metrics are relative to the inherited font size, so a heading
          * placeholder is heading-sized without a second prop. */}
        <Skeleton.Text lines={2} className="text-4" />
        <Skeleton.Text lines={3} className="text-2" />
        <Skeleton.Text lines={2} className="text-1" />
      </div>
    </div>
  );
}
