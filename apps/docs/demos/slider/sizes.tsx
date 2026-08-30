"use client";

import { Slider } from "@dofortech/forte-ui";

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

const column = "grid gap-5";

export default function SliderSizes() {
  return (
    <div className={column}>
      {sizes.map(({ size, label }) => (
        // The rail and the thumb scale together, and the control's padding is
        // derived from both — so every size keeps a 24px pointer target even
        // though the painted rail is only 3px tall at `sm`.
        <Slider.Root key={size} size={size} defaultValue={45}>
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
