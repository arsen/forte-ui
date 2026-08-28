"use client";

import { Skeleton } from "@dofortech/pretty-ui";

const VARIANTS = [
  { variant: "rect", note: "Blocks and thumbnails", className: "h-16 w-28" },
  { variant: "text", note: "One line of prose", className: "w-28" },
  { variant: "circle", note: "Avatars and dots", className: "size-16" },
] as const;

export default function SkeletonVariants() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {VARIANTS.map(({ variant, note, className }) => (
        <div key={variant} className="grid justify-items-center gap-2">
          {/* Every placeholder on this page is `aria-hidden` for free — the
            * component does it. The page's prose already says what each one
            * is, so there is no `Skeleton.Group` here to announce anything. */}
          <Skeleton.Root variant={variant} className={className} />
          <code className="font-mono text-1">{variant}</code>
          <span className="text-1 text-foreground-muted">{note}</span>
        </div>
      ))}
    </div>
  );
}
