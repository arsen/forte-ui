"use client";

import { Slider } from "@dofortech/pretty-ui";

const column = "grid gap-5";

export default function SliderLabeling() {
  return (
    <div className={column}>
      {/* A visible label. Slider.Label renders a <div> wired to every thumb's
        * hidden input with aria-labelledby — a native <label> could only point
        * at one control, which would leave the second thumb of a range slider
        * unnamed. */}
      <Slider.Root defaultValue={60}>
        <Slider.Label>Brightness</Slider.Label>
        <Slider.Value />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      {/* A custom readout. The children function receives the values already
        * formatted by `format`/`locale`, plus the raw numbers. */}
      <Slider.Root
        defaultValue={2}
        min={1}
        max={4}
        step={1}
        format={{ minimumFractionDigits: 0 }}
      >
        <Slider.Label>Playback speed</Slider.Label>
        <Slider.Value>{(formatted) => `${formatted[0]}×`}</Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            {/* getAriaValueText replaces the number a screen reader would
              * otherwise read out, so "2" is announced as "2× speed". */}
            <Slider.Thumb
              getAriaValueText={(formattedValue) => `${formattedValue}× speed`}
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
