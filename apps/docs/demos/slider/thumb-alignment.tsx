"use client";

import type { CSSProperties } from "react";
import { Slider } from "@dofortech/forte-ui";

const column = "grid gap-5";

// A guide line at each end of the control, so where the thumb comes to rest is
// visible rather than something you have to take on trust. One of the few
// things here that stays a style object rather than becoming utilities: four
// co-indexed background properties spelled as `bg-[...]` arbitrary values are
// a class string nobody can read, and none of it is layout or typography.
const guides: CSSProperties = {
  backgroundImage:
    "linear-gradient(var(--forte-color-danger-border), var(--forte-color-danger-border))," +
    "linear-gradient(var(--forte-color-danger-border), var(--forte-color-danger-border))",
  backgroundSize: "1px 100%, 1px 100%",
  backgroundPosition: "left center, right center",
  backgroundRepeat: "no-repeat",
};

export default function SliderThumbAlignment() {
  return (
    <div className={column}>
      <Slider.Root defaultValue={100} style={guides}>
        <Slider.Label>center — the default</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Centre-aligned example" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      {/* `edge` insets the thumb so its outer edge lands on the control's edge
        * instead of hanging half its width past it. The inset is measured from
        * the control's own border and padding, which is why it is worth
        * checking after any change to the control's padding.
        *
        * `edge-client-only` behaves identically but skips the pre-hydration
        * script, trading a first paint with no thumb for a smaller bundle. */}
      <Slider.Root defaultValue={100} thumbAlignment="edge" style={guides}>
        <Slider.Label>edge</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Edge-aligned example" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
