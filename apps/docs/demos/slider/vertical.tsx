"use client";

import type { CSSProperties } from "react";
import { Slider } from "@forte-ui/react";

const row = "flex items-start gap-6";

export default function SliderVertical() {
  return (
    <div className={row}>
      {/* Vertical turns the same parts 90°: the root becomes one centred
        * column, and --forte-slider-length now describes the block axis. Up and
        * Right increase the value in both orientations. */}
      <Slider.Root orientation="vertical" defaultValue={35}>
        <Slider.Label>Bass</Slider.Label>
        <Slider.Value />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <Slider.Root orientation="vertical" defaultValue={70} tone="secondary">
        <Slider.Label>Mids</Slider.Label>
        <Slider.Value />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <Slider.Root
        orientation="vertical"
        defaultValue={[20, 80]}
        style={{ "--forte-slider-length": "12rem" } as CSSProperties}
      >
        <Slider.Label>Treble</Slider.Label>
        <Slider.Value />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} aria-label="Treble minimum" />
            <Slider.Thumb index={1} aria-label="Treble maximum" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
