"use client";

import { Calendar, type CalendarSize } from "@dofortech/pretty-ui";

const SIZES: CalendarSize[] = ["sm", "md", "lg"];

export default function CalendarSizes() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Calendar size={size} defaultMonth={new Date(2026, 7, 1)} />
          <code className="font-mono text-1 text-foreground-muted">size=&quot;{size}&quot;</code>
        </div>
      ))}
    </div>
  );
}
