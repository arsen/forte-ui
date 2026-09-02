"use client";

import * as React from "react";
import { Button, Carousel } from "@forte-ui/react";

const STEPS = ["Account", "Address", "Payment", "Review"];

const slide =
  "flex h-[12rem] select-none flex-col items-center justify-center gap-2 rounded-surface bg-panel-hover text-foreground";

export default function CarouselControlled() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Carousel.Root
        aria-label="Checkout steps"
        index={index}
        onIndexChange={setIndex}
        draggable={false}
      >
        <Carousel.Viewport>
          <Carousel.Track>
            {STEPS.map((step, i) => (
              <Carousel.Slide key={step}>
                <div className={slide}>
                  <span className="text-1 uppercase tracking-wide text-foreground-muted">
                    Step {i + 1} of {STEPS.length}
                  </span>
                  <span className="text-4 font-semibold">{step}</span>
                </div>
              </Carousel.Slide>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
      </Carousel.Root>

      <div className="flex items-center justify-between gap-2">
        <Button variant="soft" size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Back
        </Button>
        <span className="text-2 text-foreground-muted">{STEPS[index]}</span>
        <Button
          size="sm"
          disabled={index === STEPS.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
