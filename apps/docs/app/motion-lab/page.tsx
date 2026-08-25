"use client";

/**
 * TEMPORARY — scratch page for comparing Button hover motion. Delete the
 * whole `app/motion-lab` folder once a direction is picked.
 */
import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

type Option = {
  id: string;
  title: string;
  note: string;
  style?: React.CSSProperties;
};

const OPTIONS: Option[] = [
  {
    id: "before",
    title: "A — Before (2px lift)",
    note: "What shipped. Leaves the row's baseline; the hit box moves with it.",
    style: { "--pui-control-hover-lift": "var(--pui-travel-xs)" } as React.CSSProperties,
  },
  {
    id: "calm",
    title: "B — Colour only (new default)",
    note: "Nothing moves on hover. Press still squashes and springs back.",
  },
  {
    id: "grow",
    title: "C — Colour + 2% grow",
    note: "Symmetric, so the pointer stays inside. Hover→press is one axis.",
    style: { "--pui-control-hover-scale": "1.02" } as React.CSSProperties,
  },
  {
    id: "settle",
    title: "D — Colour + 1% shrink",
    note: "Presses *into* the page instead of out of it. Reads as focus, not liveliness.",
    style: { "--pui-control-hover-scale": "0.99" } as React.CSSProperties,
  },
];

export default function MotionLab() {
  return (
    <div style={{ display: "grid", gap: "2.5rem", maxWidth: "44rem" }}>
      <div>
        <h1>Button hover motion</h1>
        <p style={{ color: "var(--pui-color-muted-foreground)" }}>
          Hover and click each row. Rows sit next to a text input on purpose —
          the alignment break is only obvious against a neighbour.
        </p>
      </div>

      {OPTIONS.map((o) => (
        <section key={o.id} style={{ display: "grid", gap: "0.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "var(--pui-font-size-2)" }}>{o.title}</h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--pui-font-size-1)",
              color: "var(--pui-color-muted-foreground)",
            }}
          >
            {o.note}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              paddingTop: "0.25rem",
              ...o.style,
            }}
          >
            <Button variant="solid">Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <span
              style={{
                height: "var(--pui-control-h-md)",
                display: "inline-flex",
                alignItems: "center",
                padding: "0 var(--pui-control-px-md)",
                border: "1px solid var(--pui-color-border)",
                borderRadius: "var(--pui-radius-control)",
                color: "var(--pui-color-muted-foreground)",
                fontSize: "var(--pui-font-size-2)",
              }}
            >
              neighbour
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
