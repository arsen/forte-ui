"use client";

import * as React from "react";
import { Field, NumberField } from "@dofortech/pretty-ui";

/**
 * Two scrub areas driving something you can watch move, because the point of
 * scrubbing is the feedback loop: drag, see, stop. A stepper cannot do that.
 *
 * Width scrubs on the inline axis and height on the block axis, which is also
 * the honest mapping — the cursor, the grip and the drag all follow the axis
 * the number lives on.
 */
export default function NumberFieldScrubbing() {
  const [width, setWidth] = React.useState<number | null>(160);
  const [height, setHeight] = React.useState<number | null>(90);

  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-6">
      <div className="flex gap-4">
        <Field.Root name="width">
          <NumberField.Root
            value={width}
            onValueChange={setWidth}
            min={40}
            max={280}
            size="sm"
          >
            <NumberField.ScrubArea>
              <Field.Label>Width</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
        </Field.Root>

        {/* `direction="vertical"` rotates the grip and swaps the cursor to
          * ns-resize, so the affordance keeps matching the gesture. */}
        <Field.Root name="height">
          <NumberField.Root
            value={height}
            onValueChange={setHeight}
            min={40}
            max={180}
            size="sm"
          >
            <NumberField.ScrubArea direction="vertical">
              <Field.Label>Height</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
        </Field.Root>
      </div>

      <div className="flex min-h-[11rem] items-center justify-center">
        <div
          // Runtime geometry, so it stays in a style object — there is no
          // utility class for "whatever the user just dragged it to".
          style={{ width: `${width ?? 0}px`, height: `${height ?? 0}px` }}
          className="rounded-2 bg-primary-soft ring-1 ring-primary-border"
        />
      </div>
    </div>
  );
}
