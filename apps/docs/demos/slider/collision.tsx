"use client";

import { Slider } from "@dofortech/pretty-ui";

const behaviours = [
  {
    value: "push",
    label: "push — the default",
    hint: "The dragged thumb shoves the other along and does not give the ground back.",
  },
  {
    value: "swap",
    label: "swap",
    hint: "Drag one thumb past the other and they trade places.",
  },
  {
    value: "none",
    label: "none",
    hint: "Neither thumb can pass the other; the extra movement is ignored.",
  },
] as const;

const column = "grid gap-5";

const hint = "m-0 text-1 text-foreground-muted";

export default function SliderCollision() {
  return (
    <div className={column}>
      {behaviours.map(({ value, label, hint: text }) => (
        <div key={value} className="grid gap-1">
          {/* `minStepsBetweenValues` is the companion knob: it keeps a gap
            * between the two values whichever collision behaviour is in use. */}
          <Slider.Root
            defaultValue={[35, 55]}
            thumbCollisionBehavior={value}
            minStepsBetweenValues={value === "none" ? 5 : 0}
          >
            <Slider.Label>{label}</Slider.Label>
            <Slider.Value />
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb index={0} aria-label={`${value} minimum`} />
                <Slider.Thumb index={1} aria-label={`${value} maximum`} />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <p className={hint}>{text}</p>
        </div>
      ))}
    </div>
  );
}
