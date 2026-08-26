"use client";

import * as React from "react";
import { Button, Spinner } from "@dofortech/pretty-ui";

const ROWS = ["INV-2043 — £1,200.00", "INV-2044 — £340.00", "INV-2045 — £2,780.00"];

export default function SpinnerLoadingPanel() {
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");

  async function load() {
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setState("done");
  }

  return (
    <div style={{ display: "grid", gap: "var(--pui-space-4)", justifyItems: "start" }}>
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
      <div
        role="status"
        aria-busy={state === "loading"}
        style={{
          display: "grid",
          alignContent: "center",
          justifyItems: "start",
          gap: "var(--pui-space-2)",
          minBlockSize: "6rem",
          inlineSize: "min(100%, 22rem)",
          padding: "var(--pui-surface-p)",
          borderRadius: "var(--pui-radius-surface)",
          border: "1px solid var(--pui-color-border-muted)",
          background: "var(--pui-color-panel)",
          fontSize: "var(--pui-font-size-2)",
        }}
      >
        {state === "idle" ? (
          <span style={{ color: "var(--pui-color-foreground-muted)" }}>
            Nothing loaded yet.
          </span>
        ) : state === "loading" ? (
          <Spinner variant="bars" label="Loading invoices" labelPlacement="end" decorative />
        ) : (
          ROWS.map((row) => (
            <span key={row} style={{ fontFamily: "var(--pui-font-mono)" }}>
              {row}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
