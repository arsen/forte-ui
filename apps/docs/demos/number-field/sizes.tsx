"use client";

import { Input, NumberField } from "@dofortech/forte-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function NumberFieldSizes() {
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-3">
      {SIZES.map((size) => (
        // A NumberField.Group and an Input at the same size read the same
        // control metrics, so they line up on one row at every density.
        <div key={size} className="flex items-center gap-2">
          {/* `flex-none` so the number field keeps its natural width and the
            * Input beside it takes the slack. Without it the `fullWidth` Input
            * asks for the whole row, both items shrink, and the number field
            * ends up narrower than the one on the row above — which is the one
            * thing this demo is meant to let you compare. */}
          <NumberField.Root size={size} defaultValue={12} className="flex-none">
            <NumberField.Group aria-label={`Amount (${size})`}>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
          <Input size={size} defaultValue={`size="${size}"`} fullWidth />
        </div>
      ))}
    </div>
  );
}
