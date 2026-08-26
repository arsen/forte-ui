"use client";

import { Separator } from "@dofortech/pretty-ui";

export default function SeparatorVertical() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--pui-space-3)",
        color: "var(--pui-color-foreground-muted)",
      }}
    >
      <span>Draft</span>
      <Separator orientation="vertical" />
      <span>Edited 3 minutes ago</span>
      <Separator orientation="vertical" />
      <span>2 collaborators</span>
    </div>
  );
}
