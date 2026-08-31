"use client";

import { Button, Card, Field, Input } from "@forte-ui/react";

const PRESETS = ["compact", undefined, "spacious"] as const;

export default function DensityPresets() {
  return (
    <>
      {PRESETS.map((preset) => (
        /* The preset scope sits ON the card, and the card itself responds:
          * `--forte-card-p` defaults to `--forte-surface-p`, which is exactly
          * what `data-forte-density` re-points — so the padding you see
          * changing is the component's own, not a utility's. */
        <Card.Root
          key={preset ?? "default"}
          data-forte-density={preset}
          className="w-[11rem] gap-2"
        >
          <Field.Root name={`email-${preset ?? "default"}`}>
            <Field.Label>Email</Field.Label>
            <Input placeholder="you@work.com" />
          </Field.Root>
          <Button size="sm">Subscribe</Button>
          <span className="font-mono text-1 text-foreground-muted">{preset ?? "default"}</span>
        </Card.Root>
      ))}
    </>
  );
}
