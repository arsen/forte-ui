"use client";

import type { CSSProperties } from "react";
import { Avatar } from "@forte-ui/react";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export default function AvatarSizes() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end gap-4">
        {SIZES.map((size) => (
          <div key={size} className="grid justify-items-center gap-2">
            <Avatar.Root size={size}>
              <Avatar.Image src="/avatars/cyrus.svg" alt="" />
              <Avatar.Fallback>CB</Avatar.Fallback>
            </Avatar.Root>
            <code className="font-mono text-1">{size}</code>
          </div>
        ))}
      </div>

      {/* Nothing is tied to the five presets: the type and the icon are
        * fractions of --forte-avatar-size, so one custom value resizes the lot. */}
      <div className="flex items-end gap-4">
        <Avatar.Root style={{ "--forte-avatar-size": "6rem" } as CSSProperties} tone="secondary">
          <Avatar.Fallback label="Dara Okonjo">DO</Avatar.Fallback>
        </Avatar.Root>
        <code className="font-mono text-1 text-foreground-muted">--forte-avatar-size: 6rem</code>
      </div>
    </div>
  );
}
