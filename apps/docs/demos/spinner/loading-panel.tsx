"use client";

import * as React from "react";
import { Button, Card, Spinner } from "@forte-ui/react";

const ROWS = ["INV-2043 — £1,200.00", "INV-2044 — £340.00", "INV-2045 — £2,780.00"];

export default function SpinnerLoadingPanel() {
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");

  async function load() {
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setState("done");
  }

  return (
    <div className="grid justify-items-start gap-4">
      <Button onClick={load} disabled={state === "loading"}>
        {state === "done" ? "Reload invoices" : "Load invoices"}
      </Button>

      {/* The live region is the PANEL, and it is in the DOM from the first
       * render. That is the whole point: a region that appears at the same
       * moment as its content is unreliably announced, because a screen reader
       * has to be observing it before the change happens.
       *
       * So the spinner inside it is `decorative` — the panel owns the
       * announcement, and `aria-busy` tells assistive technology the contents
       * are mid-update rather than final. */}
      <Card.Root
        role="status"
        aria-busy={state === "loading"}
        className="min-h-[6rem] w-full max-w-[22rem] items-start justify-center gap-2"
      >
        {state === "idle" ? (
          <span className="text-foreground-muted">Nothing loaded yet.</span>
        ) : state === "loading" ? (
          <Spinner variant="bars" label="Loading invoices" labelPlacement="end" decorative />
        ) : (
          ROWS.map((row) => (
            <span key={row} className="font-mono">
              {row}
            </span>
          ))
        )}
      </Card.Root>
    </div>
  );
}
