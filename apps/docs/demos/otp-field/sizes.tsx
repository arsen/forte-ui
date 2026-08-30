"use client";

import { OTPField } from "@dofortech/forte-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function OTPFieldSizes() {
  return (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-6 font-mono text-1 text-foreground-subtle">{size}</span>
          {/* The slot side is the same `--forte-control-h-*` an Input reads, so
            * a code field and a text field of the same size line up. */}
          <OTPField.Root size={size} length={4} defaultValue="24" aria-label={`Code (${size})`} />
        </div>
      ))}
    </div>
  );
}
