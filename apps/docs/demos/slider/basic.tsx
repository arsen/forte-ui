"use client";

import { Slider } from "@dofortech/pretty-ui";

export default function SliderBasic() {
  return (
    <Slider.Root defaultValue={25}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          {/* No visible label here, so the thumb carries the accessible name
            * itself. Without it the control is announced as just "slider". */}
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
