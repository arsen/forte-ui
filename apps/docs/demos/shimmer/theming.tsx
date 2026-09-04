"use client";

import type { CSSProperties } from "react";
import { Shimmer } from "@forte-ui/react";

/* Every visual decision is a custom property on the shimmer root, so a restyle
 * is a `style` object rather than a variant. These stay a `style` object
 * rather than becoming utility classes because they are the component's own
 * knobs, not layout. */
const RECIPES: { label: string; style: CSSProperties }[] = [
  {
    label: "Accent band",
    style: { "--forte-shimmer-color": "var(--forte-accent-9)" } as CSSProperties,
  },
  {
    label: "Narrow and fast",
    style: {
      "--forte-shimmer-spread": "var(--forte-space-5)",
      "--forte-shimmer-duration": "700ms",
    } as CSSProperties,
  },
  {
    label: "Wide, upright and slow",
    style: {
      "--forte-shimmer-spread": "8rem",
      "--forte-shimmer-angle": "0deg",
      "--forte-shimmer-duration": "3s",
    } as CSSProperties,
  },
];

export default function ShimmerTheming() {
  return (
    <div className="grid gap-4">
      {RECIPES.map(({ label, style }) => (
        <div key={label} className="grid gap-1">
          <span className="text-1 text-foreground-muted">{label}</span>
          <Shimmer style={style} className="text-4 font-medium text-foreground-muted">
            The quick brown fox jumps over the lazy dog
          </Shimmer>
        </div>
      ))}
    </div>
  );
}
