"use client";

import * as React from "react";
import { Button, Reveal } from "@forte-ui/react";

const STEPS = [
  ["Install", "pnpm add @forte-ui/react"],
  ["Import the styles", "Once, in the root layout"],
  ["Pick a seed", "Every color derives from it"],
  ["Ship", "No runtime theming layer"],
];

export default function RevealStagger() {
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>

      <ol className="m-0 grid w-full list-none gap-2 p-0">
        {STEPS.map(([title, note], i) => (
          /* `render` puts the entrance ON the list item instead of wrapping
           * it: a <div> between <ol> and <li> is invalid HTML, and the
           * parser moves it out of the list rather than telling you.
           *
           * 70ms apart, which is enough to read as one thing arriving in
           * order and short enough that the last row is in under a third of
           * a second. Under reduced motion the rows still arrive in order —
           * the delay is a wait, not a movement, so it is the fade that
           * staggers. */
          <Reveal
            key={`${title}-${run}`}
            render={<li />}
            delay={i * 70}
            className="rounded-surface border border-border-muted bg-panel p-3"
          >
            <p className="m-0 font-medium">{title}</p>
            <p className="m-0 text-1 text-foreground-muted">{note}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
