"use client";

import { AspectRatio } from "@forte-ui/react";

/* `cover` has to throw something away; `--forte-aspect-position` is how you say
 * WHICH something. The default centres the crop, which is the one choice
 * guaranteed to behead a portrait. */
const CROPS = [
  { label: "50% 0%", position: "50% 0%" },
  { label: "50% 50%  (default)", position: "50% 50%" },
  { label: "50% 100%", position: "50% 100%" },
];

export default function AspectRatioFocal() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {CROPS.map(({ label, position }) => (
        <div key={label} className="grid gap-2">
          {/* A knob, not a prop — so it goes in a `style` object, which is
            * also how you would set it from a stylesheet. */}
          <AspectRatio
            ratio="square"
            variant="outlined"
            style={{ "--forte-aspect-position": position } as React.CSSProperties}
          >
            <img src="/media/tower.svg" alt="" />
          </AspectRatio>
          <span className="font-mono text-1 text-foreground-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
