"use client";

import * as React from "react";
import { Button, Reveal } from "@forte-ui/react";

const TILE = "rounded-surface border border-border-muted bg-panel p-4 text-1 text-foreground-muted";

/* Every knob is a custom property on the component's own root, so it is set
 * in a `style` object the way every component's knobs are. The duration and
 * the easing move together: a spring curve on a shorter duration is a spring
 * stopped mid-bounce. */
export default function RevealTheming() {
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>

      <div className="grid w-full gap-3 sm:grid-cols-3">
        <Reveal
          key={`travel-${run}`}
          className={TILE}
          style={{ "--forte-reveal-travel": "3rem" } as React.CSSProperties}
        >
          travel 3rem
        </Reveal>

        <Reveal
          key={`duration-${run}`}
          className={TILE}
          style={
            {
              "--forte-reveal-duration": "var(--forte-duration-normal)",
              "--forte-reveal-ease": "var(--forte-ease-standard)",
            } as React.CSSProperties
          }
        >
          240ms, no spring
        </Reveal>

        <Reveal
          key={`scale-${run}`}
          effect="fade-scale"
          className={TILE}
          style={{ "--forte-reveal-scale": "0.75" } as React.CSSProperties}
        >
          scale from 0.75
        </Reveal>
      </div>
    </div>
  );
}
