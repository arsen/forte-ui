"use client";

import { Skeleton } from "@forte-ui/react";

const ANIMATIONS = [
  { animation: "pulse", note: "Shallow opacity breathe" },
  { animation: "shimmer", note: "Band crossing the fill" },
  { animation: "none", note: "Static — nothing moves" },
] as const;

export default function SkeletonAnimations() {
  return (
    <div className="grid gap-5">
      {ANIMATIONS.map(({ animation, note }) => (
        <div key={animation} className="grid gap-2">
          <div className="flex items-baseline gap-3">
            <code className="font-mono text-1">{animation}</code>
            <span className="text-1 text-foreground-muted">{note}</span>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton.Root animation={animation} variant="circle" className="size-10" />
            <Skeleton.Root animation={animation} className="h-10 w-full max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
