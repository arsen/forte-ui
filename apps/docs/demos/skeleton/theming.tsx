"use client";

import type { CSSProperties } from "react";
import { Skeleton } from "@dofortech/forte-ui";

/* Every visual decision is a custom property on the skeleton root, so a
 * restyle is a `style` object rather than a new variant. These stay a style
 * object rather than becoming utility classes because they are the
 * component's own knobs, not layout — and a utility class cannot set an
 * arbitrary custom property. */
const RECIPES: { label: string; animation: "pulse" | "shimmer"; style: CSSProperties }[] = [
  {
    label: "Tinted, slow",
    animation: "pulse",
    style: {
      "--forte-skeleton-color": "var(--forte-color-primary-soft)",
      "--forte-skeleton-duration": "2400ms",
    } as CSSProperties,
  },
  {
    label: "Pill, brand sheen",
    animation: "shimmer",
    style: {
      "--forte-skeleton-radius": "var(--forte-radius-pill)",
      "--forte-skeleton-highlight": "var(--forte-color-primary-soft-active)",
    } as CSSProperties,
  },
  {
    label: "Barely there",
    animation: "pulse",
    style: {
      "--forte-skeleton-color": "var(--forte-color-panel-hover)",
      /* A shallower dip than the default 0.55. A literal here replaces the
       * component's reduced-motion calc, which only matters in the louder
       * direction — 0.85 is already calmer than the 0.8 that calc reaches
       * under reduced motion, so this stays quiet everywhere. */
      "--forte-skeleton-dim": "0.85",
    } as CSSProperties,
  },
];

export default function SkeletonTheming() {
  return (
    <div className="grid gap-4">
      {RECIPES.map(({ label, animation, style }) => (
        <div key={label} className="grid gap-2">
          <span className="text-1 text-foreground-muted">{label}</span>
          <Skeleton.Root animation={animation} style={style} className="h-10 w-full max-w-sm" />
        </div>
      ))}
    </div>
  );
}
