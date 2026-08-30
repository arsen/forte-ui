"use client";

import { AspectRatio, type AspectRatioPreset } from "@forte-ui/react";

/* The seven names, with the shape each one stands for. Written out rather than
 * imported so the demo shows what a reader gets from the prop. */
const PRESETS: { name: AspectRatioPreset; ratio: string }[] = [
  { name: "square", ratio: "1:1" },
  { name: "video", ratio: "16:9" },
  { name: "wide", ratio: "21:9" },
  { name: "photo", ratio: "4:3" },
  { name: "portrait", ratio: "3:4" },
  { name: "story", ratio: "9:16" },
  { name: "golden", ratio: "1.618:1" },
];

export default function AspectRatioPresets() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
      {PRESETS.map(({ name, ratio }) => (
        <div key={name} className="grid content-start gap-2">
          {/* Every child of the box lands in the same grid cell, so the label
            * needs no absolute positioning — only an alignment. */}
          <AspectRatio ratio={name} variant="filled">
            <span className="place-self-center font-mono text-1 text-foreground-muted">
              {ratio}
            </span>
          </AspectRatio>
          <span className="text-1 text-foreground-muted">{name}</span>
        </div>
      ))}
    </div>
  );
}
