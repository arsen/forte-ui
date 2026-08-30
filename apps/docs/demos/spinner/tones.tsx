"use client";

import { Spinner } from "@forte-ui/react";

const TONES = ["primary", "secondary", "danger", "neutral"] as const;

/* `current` takes whatever colour it lands in, which is what makes it the one
 * to reach for inside another control. Both rows below use the same markup —
 * only the surrounding `color` differs. */
const CONTEXTS = [
  { label: "inside muted text", className: "text-foreground-muted" },
  { label: "inside a danger message", className: "text-danger-text" },
];

export default function SpinnerTones() {
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-5">
        {TONES.map((tone) => (
          <div key={tone} className="grid justify-items-center gap-2">
            <Spinner tone={tone} size="lg" decorative />
            <code className="font-mono text-1">{tone}</code>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        {CONTEXTS.map(({ label, className }) => (
          <p key={label} className={`m-0 flex items-center gap-2 text-2 ${className}`}>
            <Spinner variant="dots" tone="current" size="sm" decorative />
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}
