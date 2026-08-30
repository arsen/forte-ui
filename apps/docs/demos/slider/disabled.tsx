"use client";

import type { CSSProperties } from "react";
import { Field, Slider } from "@dofortech/forte-ui";

const column = "grid gap-5";

// The documented escape hatch for a slider that fills its container: the root
// is `inline-size: var(--forte-slider-length)` capped at 100%, so pointing the
// token at 100% makes the cap and the width agree. The cast is only because
// React's CSSProperties has no index signature for custom properties.
const fullWidth = { "--forte-slider-length": "100%" } as CSSProperties;

export default function SliderDisabled() {
  return (
    <div className={column}>
      {/* `disabled` on the Field rather than on the Slider: it takes
        * precedence over the control's own prop and dims the description with
        * it, so the reason the setting is unavailable does not sit at full
        * contrast beside a greyed-out control. A disabled slider is skipped by
        * Tab and cannot show a tooltip, so the reason has to be visible text. */}
      <Field.Root disabled>
        <Slider.Root defaultValue={60} style={fullWidth}>
          <Slider.Label>Concurrent builds</Slider.Label>
          <Slider.Value />
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
        <Field.Description>
          Fixed at 60 on the Hobby plan. Upgrade to change it.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
