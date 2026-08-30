"use client";

import { Separator } from "@dofortech/forte-ui";

export default function SeparatorVertical() {
  return (
    <div className="flex items-center gap-3 text-foreground-muted">
      <span>Draft</span>
      <Separator orientation="vertical" />
      <span>Edited 3 minutes ago</span>
      <Separator orientation="vertical" />
      <span>2 collaborators</span>
    </div>
  );
}
