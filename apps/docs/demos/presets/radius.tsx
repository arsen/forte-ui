"use client";

import { Button, Input } from "@dofortech/forte-ui";

const PRESETS = [undefined, "none", "soft", "pill"] as const;

export default function RadiusPresets() {
  return (
    <>
      {PRESETS.map((preset) => (
        <div
          key={preset ?? "default"}
          data-forte-radius={preset}
          className="grid justify-items-center gap-2"
        >
          <Input placeholder="Search" aria-label={`Search, ${preset ?? "default"} radius`} className="w-[8.5rem]" />
          <Button size="sm">Save</Button>
          <span className="font-mono text-1 text-foreground-muted">{preset ?? "default"}</span>
        </div>
      ))}
    </>
  );
}
