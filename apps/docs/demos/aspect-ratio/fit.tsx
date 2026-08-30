"use client";

import { AspectRatio, type AspectRatioFit } from "@dofortech/forte-ui";

/* A tall image in a wide box: the mismatch is the point, because with matching
 * ratios every value of `fit` looks identical. */
const FITS: { fit: AspectRatioFit; note: string }[] = [
  { fit: "cover", note: "fills the frame, crops the rest" },
  { fit: "contain", note: "whole image, bars at the sides" },
  { fit: "fill", note: "stretched to the frame" },
  { fit: "none", note: "intrinsic size, cropped by the frame" },
];

export default function AspectRatioFit() {
  return (
    <div className="grid w-full gap-5 sm:grid-cols-2">
      {FITS.map(({ fit, note }) => (
        <div key={fit} className="grid gap-2">
          <AspectRatio ratio="video" fit={fit} variant="outlined">
            <img src="/media/tower.svg" alt="" />
          </AspectRatio>
          <p className="text-1 text-foreground-muted">
            <span className="font-mono text-foreground">{fit}</span> — {note}
          </p>
        </div>
      ))}
    </div>
  );
}
