"use client";

import { Avatar } from "@dofortech/forte-ui";

export default function AvatarBasic() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* A photo. The alt is empty because the name is written right beside it
        * — repeating it would have a screen reader say "Ada Lovelace Ada
        * Lovelace". The fallback carries the initials the photo would be
        * replaced by if it failed to load. */}
      <div className="flex items-center gap-3">
        <Avatar.Root>
          <Avatar.Image src="/avatars/ada.svg" alt="" />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
        <div className="grid">
          <span className="text-2 font-medium">Ada Lovelace</span>
          <span className="text-1 text-foreground-muted">Owner</span>
        </div>
      </div>

      {/* No image at all: the fallback IS the avatar, so it has to name
        * itself. `label` hides "BR" from assistive technology and announces
        * the whole name in its place. */}
      <Avatar.Root tone="primary">
        <Avatar.Fallback label="Bea Rivera">BR</Avatar.Fallback>
      </Avatar.Root>

      {/* An icon fallback stands for "somebody", not for anybody in
        * particular, so it stays decorative: no label, and the svg is hidden.
        * It is sized by --forte-avatar-icon-size without a width of its own. */}
      <Avatar.Root variant="outline">
        <Avatar.Fallback>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
          </svg>
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
