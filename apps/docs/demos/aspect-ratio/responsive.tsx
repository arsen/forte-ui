"use client";

import { AspectRatio } from "@forte-ui/react";

/**
 * A ratio that changes with the layout — and the reason `ratio` seeds a knob
 * instead of setting one.
 *
 * The prop writes `--forte-aspect-ratio-seed`; the stylesheet reads it into
 * `--forte-aspect-ratio` from inside `@layer forte.components`. An ordinary,
 * unlayered class therefore outranks it, so the ratio can be restated by a
 * container query without a re-render and without `!important`. Had the prop
 * written the knob directly, as an inline style, no CSS could have reached it.
 *
 * Resize the frame (drag its corner, or switch to the phone width) and watch
 * the shape change: a 3:4 card on a narrow column, 4:3 once there is room,
 * 16:9 when there is plenty.
 */
export default function AspectRatioResponsive() {
  return (
    <div className="@container w-full">
      <AspectRatio
        variant="filled"
        className="[--forte-aspect-ratio:3_/_4] @sm:[--forte-aspect-ratio:4_/_3] @lg:[--forte-aspect-ratio:16_/_9]"
      >
        <img src="/media/harbour.svg" alt="A harbour at dusk, seen from the water" />
      </AspectRatio>
    </div>
  );
}
