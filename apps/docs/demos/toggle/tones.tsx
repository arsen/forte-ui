"use client";

import { Toggle } from "@forte-ui/react";

const TONES = ["primary", "secondary", "danger", "neutral"] as const;

export default function ToggleTones() {
  return (
    <div className="flex flex-wrap gap-2">
      {/* `tone` only reaches the pressed state — an unpressed toggle looks the
        * same in all four, which is deliberate: off is off. Each one here
        * starts pressed so the difference is visible. */}
      {TONES.map((tone) => (
        <Toggle key={tone} tone={tone} variant="solid" defaultPressed>
          {tone}
        </Toggle>
      ))}
    </div>
  );
}
