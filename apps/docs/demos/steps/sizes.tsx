"use client";

import { Steps, type StepsSize } from "@forte-ui/react";

const SIZES: StepsSize[] = ["sm", "md", "lg"];

/* `size` is the circle's diameter and the text beside it; the connector's
 * thickness stays put, and its minimum length grows with the circle. */
export default function StepsSizes() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {SIZES.map((size) => (
        <Steps.Root key={size} size={size} current={1}>
          <Steps.Item>
            <Steps.Indicator />
            <Steps.Title>Details</Steps.Title>
          </Steps.Item>
          <Steps.Item>
            <Steps.Indicator />
            <Steps.Title>Options</Steps.Title>
          </Steps.Item>
          <Steps.Item>
            <Steps.Indicator />
            <Steps.Title>Confirm</Steps.Title>
          </Steps.Item>
        </Steps.Root>
      ))}
    </div>
  );
}
