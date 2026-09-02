"use client";

import * as React from "react";
import { Steps } from "@forte-ui/react";

const STEPS = ["Account", "Address", "Payment", "Review"];

/* Wrap a step's parts in a Trigger and the whole face becomes one button. This
 * one lets the reader jump anywhere; a stricter wizard would disable the steps
 * ahead of the furthest one reached. The last step is disabled here to show
 * what that looks like. */
export default function StepsClickable() {
  const [current, setCurrent] = React.useState(1);

  return (
    <Steps.Root current={current} className="w-full max-w-2xl">
      {STEPS.map((title, index) => (
        <Steps.Item key={title} disabled={index === STEPS.length - 1}>
          <Steps.Trigger onClick={() => setCurrent(index)}>
            <Steps.Indicator />
            <Steps.Title>{title}</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
      ))}
    </Steps.Root>
  );
}
