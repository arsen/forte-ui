"use client";

import { Steps, type StepsTone } from "@forte-ui/react";

const TONES: StepsTone[] = ["primary", "secondary", "success", "neutral"];

/* `tone` colors "done" and "here" and nothing else. A step not yet reached
 * stays neutral in every tone, so the color only ever says "this far". */
export default function StepsTones() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {TONES.map((tone) => (
        <Steps.Root key={tone} tone={tone} current={1}>
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
