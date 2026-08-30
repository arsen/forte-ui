"use client";

import { AspectRatio, type AspectRatioVariant } from "@dofortech/forte-ui";

/* Shown EMPTY, because the chrome is the subject and an image would cover all
 * three the same way. Empty is also the state that matters most: `filled` is
 * what the box looks like while the media is still on the wire. */
const VARIANTS: { variant: AspectRatioVariant; note: string }[] = [
  { variant: "plain", note: "pure layout — no background, border or radius" },
  { variant: "outlined", note: "a hairline frame, for light-on-light media" },
  { variant: "filled", note: "a recessed panel, and the loading placeholder" },
];

export default function AspectRatioVariants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {VARIANTS.map(({ variant, note }) => (
        <div key={variant} className="grid gap-2">
          {/* The dashed guide belongs to the DEMO, not to the component. It
            * marks where the box is so that `plain` — which paints nothing at
            * all — reads as an empty frame rather than as a missing one. */}
          <div className="rounded-surface outline-1 outline-dashed outline-border-muted outline-offset-4">
            <AspectRatio ratio="video" variant={variant} />
          </div>
          <p className="mt-2 text-1 text-foreground-muted">
            <span className="font-mono text-foreground">{variant}</span> — {note}
          </p>
        </div>
      ))}
    </div>
  );
}
