"use client";

import { Check } from "lucide-react";
import { Avatar } from "@forte-ui/react";

const SIZES = ["sm", "md", "lg", "xl"] as const;
const SHAPES = ["circle", "rounded", "square"] as const;

export default function AvatarBadge() {
  return (
    <div className="grid gap-6">
      {/* The badge is a fraction of --forte-avatar-size and its offset is a
        * fraction of --forte-avatar-radius, so one dot definition sits correctly
        * on every size — which is the part a fixed-size <span> gets wrong. */}
      <div className="flex flex-wrap items-end gap-4">
        {SIZES.map((size) => (
          <Avatar.Root key={size} size={size}>
            <Avatar.Image src="/avatars/ada.svg" alt="" />
            <Avatar.Fallback>AL</Avatar.Fallback>
            <Avatar.Badge tone="success" label={`Ada Lovelace, online, ${size}`} />
          </Avatar.Root>
        ))}
      </div>

      {/* Same expression for all three shapes: the badge's centre lands where
        * the 45° diagonal crosses the corner, whatever the corner is. */}
      <div className="flex flex-wrap items-end gap-4">
        {SHAPES.map((shape) => (
          <Avatar.Root key={shape} shape={shape} size="lg">
            <Avatar.Image src="/avatars/bea.svg" alt="" />
            <Avatar.Fallback>BR</Avatar.Fallback>
            <Avatar.Badge tone="primary" label={`Bea Rivera, verified, ${shape}`}>
              <Check aria-hidden="true" />
            </Avatar.Badge>
          </Avatar.Root>
        ))}
      </div>

      {/* Content widens the badge into a pill, growing inward from the pinned
        * edge. `top-end` keeps a count clear of a name written underneath. */}
      <div className="flex flex-wrap items-end gap-4">
        <Avatar.Root size="lg" tone="secondary">
          <Avatar.Fallback>DO</Avatar.Fallback>
          <Avatar.Badge tone="danger" placement="top-end" label="4 unread messages">
            4
          </Avatar.Badge>
        </Avatar.Root>
        <Avatar.Root size="lg" tone="secondary">
          <Avatar.Fallback>DO</Avatar.Fallback>
          <Avatar.Badge tone="danger" placement="top-end" label="12 unread messages">
            12
          </Avatar.Badge>
        </Avatar.Root>

        {/* In a group every avatar but the last has its inline-end corner
          * painted over by the next one, so the dots go on the other side. */}
        <Avatar.Group>
          <Avatar.Root>
            <Avatar.Image src="/avatars/ada.svg" alt="" />
            <Avatar.Fallback>AL</Avatar.Fallback>
            <Avatar.Badge tone="success" placement="bottom-start" label="Ada Lovelace, online" />
          </Avatar.Root>
          <Avatar.Root>
            <Avatar.Image src="/avatars/bea.svg" alt="" />
            <Avatar.Fallback>BR</Avatar.Fallback>
            <Avatar.Badge tone="warning" placement="bottom-start" label="Bea Rivera, away" />
          </Avatar.Root>
          <Avatar.Root>
            <Avatar.Image src="/avatars/cyrus.svg" alt="" />
            <Avatar.Fallback>CB</Avatar.Fallback>
            <Avatar.Badge tone="neutral" placement="bottom-start" label="Cyrus Bell, offline" />
          </Avatar.Root>
        </Avatar.Group>
      </div>
    </div>
  );
}
