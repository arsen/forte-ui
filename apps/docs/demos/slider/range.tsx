"use client";

import { Slider } from "@forte-ui/react";

export default function SliderRange() {
  return (
    // An array value is what makes this a range slider — there is no `range`
    // prop. `format` is applied by Slider.Value and by the aria-valuetext of
    // every thumb, so the price is announced as a price, not as a bare number.
    <Slider.Root
      defaultValue={[25, 75]}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
    >
      <Slider.Label>Price range</Slider.Label>
      <Slider.Value />
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          {/* `index` is required for server rendering: without it the thumbs
            * only learn their order once the composite list registers on the
            * client, so both paint at the first value and jump on hydration.
            * The aria-labels distinguish the two handles — Slider.Label names
            * the group, not the individual thumbs. */}
          <Slider.Thumb index={0} aria-label="Minimum price" />
          <Slider.Thumb index={1} aria-label="Maximum price" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
