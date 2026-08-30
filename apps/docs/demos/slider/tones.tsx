"use client";

import { Slider } from "@forte-ui/react";

const tones = [
  { tone: "primary", label: "Primary", value: 40 },
  { tone: "secondary", label: "Secondary", value: 55 },
  { tone: "danger", label: "Danger", value: 85 },
  { tone: "neutral", label: "Neutral", value: 25 },
] as const;

const column = "grid gap-5";

export default function SliderTones() {
  return (
    <div className={column}>
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
