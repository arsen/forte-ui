"use client";

import { Badge } from "@forte-ui/react";

const STATES = [
  { tone: "success", label: "Operational" },
  { tone: "warning", label: "Degraded" },
  { tone: "danger", label: "Outage" },
  { tone: "info", label: "Maintenance" },
  { tone: "neutral", label: "Unknown" },
] as const;

export default function BadgeStatus() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATES.map(({ tone, label }) => (
        /* `dot` is decoration — the word next to it is what carries the
          * status, for a screen reader and for anyone who cannot separate
          * amber from green. */
        <Badge key={label} tone={tone} shape="pill" dot>
          {label}
        </Badge>
      ))}
    </div>
  );
}
