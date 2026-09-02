"use client";

import { Steps, type StepsVariant } from "@forte-ui/react";

const VARIANTS: StepsVariant[] = ["solid", "outline", "dot"];

/* `solid` fills every circle; `outline` rings a step until it is done, so
 * the filled circles are exactly the completed ones; `dot` drops the number
 * and shrinks the circle to a point on a line. */
export default function StepsVariants() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {VARIANTS.map((variant) => (
        <Steps.Root key={variant} variant={variant} current={1}>
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
