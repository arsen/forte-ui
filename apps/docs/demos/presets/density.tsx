"use client";

import { Button, Field, Input } from "@dofortech/forte-ui";

const PRESETS = ["compact", undefined, "spacious"] as const;

export default function DensityPresets() {
  return (
    <>
      {PRESETS.map((preset) => (
        <div
          key={preset ?? "default"}
          data-forte-density={preset}
          className="grid w-[11rem] gap-2 rounded-surface border border-border-muted bg-panel p-surface"
        >
          <Field.Root name={`email-${preset ?? "default"}`}>
            <Field.Label>Email</Field.Label>
            <Input placeholder="you@work.com" />
          </Field.Root>
          <Button size="sm">Subscribe</Button>
          <span className="font-mono text-1 text-foreground-muted">{preset ?? "default"}</span>
        </div>
      ))}
    </>
  );
}
