"use client";

import * as React from "react";
import { Button, Reveal, type RevealEffect } from "@forte-ui/react";

const EFFECTS: RevealEffect[] = [
  "fade",
  "fade-up",
  "fade-down",
  "fade-start",
  "fade-end",
  "scale",
  "fade-scale",
];

const TILE = "rounded-surface border border-border-muted bg-panel p-4 text-2 font-mono";

export default function RevealEffects() {
  /* An entrance plays on the way in, so replaying one means arriving again.
   * A new `key` is a new element as far as React is concerned, which is
   * exactly the event the reveal is waiting for. */
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EFFECTS.map((effect) => (
          <Reveal key={`${effect}-${run}`} effect={effect} className={TILE}>
            {effect}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
