"use client";

import { Avatar } from "@dofortech/forte-ui";

const SHAPES = [
  { shape: "circle", note: "People" },
  { shape: "rounded", note: "Workspaces, repos" },
  { shape: "square", note: "Logos, bots" },
] as const;

export default function AvatarShapes() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {SHAPES.map(({ shape, note }) => (
        <div key={shape} className="grid justify-items-center gap-2">
          <Avatar.Root shape={shape} size="lg">
            <Avatar.Image src="/avatars/eli.svg" alt="" />
            <Avatar.Fallback>EN</Avatar.Fallback>
          </Avatar.Root>
          <code className="font-mono text-1">{shape}</code>
          <span className="text-1 text-foreground-muted">{note}</span>
        </div>
      ))}
    </div>
  );
}
