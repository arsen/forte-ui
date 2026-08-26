"use client";

import type { CSSProperties } from "react";
import { Slider } from "@dofortech/pretty-ui";

const tones = [
  { tone: "primary", label: "Primary", value: 40 },
  { tone: "secondary", label: "Secondary", value: 55 },
  { tone: "danger", label: "Danger", value: 85 },
  { tone: "neutral", label: "Neutral", value: 25 },
] as const;

const column: CSSProperties = {
  display: "grid",
  gap: "var(--pui-space-5)",
};

export default function SliderTones() {
  return (
    <div style={column}>
      {tones.map(({ tone, label, value }) => (
        // `tone` swaps the indicator fill, the thumb's ring and its halo in
        // one move. The rail stays neutral in every tone — it is the empty
        // part of the range, and colouring it would compete with the fill it
        // exists to contrast against.
        <Slider.Root key={tone} tone={tone} defaultValue={value}>
          <Slider.Label>{label}</Slider.Label>
          <Slider.Value />
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      ))}
    </div>
  );
}
