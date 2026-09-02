"use client";

import * as React from "react";
import { Button, Steps } from "@forte-ui/react";

const STEPS = [
  {
    title: "Pick a plan",
    caption: "Starter, Team or Enterprise",
    body: "Every plan starts with a two-week trial. You can move between them at any point, and the difference is prorated.",
  },
  {
    title: "Invite your team",
    caption: "Optional",
    body: "Add people by email now, or skip this and do it from settings later. Everyone you add gets the same trial.",
  },
  {
    title: "Connect a repository",
    caption: "GitHub, GitLab or Bitbucket",
    body: "We only ask for read access to the repositories you choose. Nothing is cloned until you run the first build.",
  },
];

/* Stacked, the connector runs down the side of whatever the description
 * holds — so the active step can open up into its own content and the line
 * simply gets longer. The other steps keep a one-line caption. */
export default function StepsVertical() {
  const [current, setCurrent] = React.useState(0);

  return (
    <Steps.Root orientation="vertical" current={current} className="w-full max-w-lg">
      {STEPS.map((step, index) => (
        <Steps.Item key={step.title}>
          <Steps.Indicator />
          <Steps.Title>{step.title}</Steps.Title>
          <Steps.Description>
            {index === current ? (
              <div className="flex flex-col gap-3">
                <p className="m-0 text-foreground">{step.body}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setCurrent((step) => Math.min(step + 1, STEPS.length))}
                  >
                    {index === STEPS.length - 1 ? "Finish" : "Continue"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => setCurrent((step) => step - 1)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              step.caption
            )}
          </Steps.Description>
        </Steps.Item>
      ))}
    </Steps.Root>
  );
}
