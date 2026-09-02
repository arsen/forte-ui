"use client";

import * as React from "react";
import { Button, Steps } from "@forte-ui/react";

const STEPS = [
  { title: "Account", body: "Choose a sign-in method and set a password." },
  { title: "Address", body: "Tell us where the order should go." },
  { title: "Payment", body: "Add a card, or pick one you have used before." },
  { title: "Review", body: "One last look before the order is placed." },
];

/* A wizard is `current` in state and two buttons that move it. Stepping past
 * the last index marks every step complete — the header's way of saying
 * "done" without a fifth step to say it on. */
export default function StepsControlled() {
  const [current, setCurrent] = React.useState(0);
  const done = current >= STEPS.length;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Steps.Root current={current}>
        {STEPS.map((step) => (
          <Steps.Item key={step.title}>
            <Steps.Indicator />
            <Steps.Title>{step.title}</Steps.Title>
          </Steps.Item>
        ))}
      </Steps.Root>

      <div className="rounded-surface border border-border bg-panel p-surface text-2 text-foreground-muted">
        {done ? "All steps completed — the order is on its way." : STEPS[current].body}
      </div>

      <div className="flex gap-2">
        <Button
          variant="soft"
          size="sm"
          disabled={current === 0}
          onClick={() => setCurrent((step) => step - 1)}
        >
          Back
        </Button>
        {done ? (
          <Button size="sm" onClick={() => setCurrent(0)}>
            Start over
          </Button>
        ) : (
          <Button size="sm" onClick={() => setCurrent((step) => step + 1)}>
            {current === STEPS.length - 1 ? "Finish" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
}
