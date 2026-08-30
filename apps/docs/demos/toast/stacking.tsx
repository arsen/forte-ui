"use client";

import * as React from "react";
import { Button, Toast, useToast } from "@dofortech/forte-ui";

const EVENTS = [
  { title: "Build #4181 queued", description: "main · 3 jobs" },
  { title: "Build #4181 running", description: "Installing dependencies" },
  { title: "Tests passed", description: "412 passed, 0 failed" },
  { title: "Preview deployed", description: "acme-4181.preview.dev" },
  { title: "Build #4181 finished", description: "2 min 14 s" },
];

function Buttons() {
  const toast = useToast();
  const next = React.useRef(0);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="outline"
        onClick={() => {
          const event = EVENTS[next.current % EVENTS.length]!;
          next.current += 1;
          toast.show(event);
        }}
      >
        Add a toast
      </Button>
      {/* `close()` with no argument closes every toast at once. */}
      <Button variant="ghost" onClick={() => toast.close()}>
        Clear all
      </Button>
    </div>
  );
}

export default function ToastStacking() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[21rem] w-full">
      {/* `timeout={0}` keeps every toast until it is dismissed, so the stack
        * can be poked at. `limit` is the default 3 — press the button a
        * fourth time and the oldest is hidden, not thrown away: it comes back
        * as the ones in front are closed. Hover the deck to fan it out. */}
      <Toast.Provider container={stage} timeout={0}>
        <Buttons />
      </Toast.Provider>
    </div>
  );
}
