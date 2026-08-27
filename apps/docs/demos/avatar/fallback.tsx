"use client";

import { Avatar } from "@dofortech/pretty-ui";

/* `/avatars/gone.png` does not exist. Base UI loads the image off-screen first
 * and only mounts the <img> once it succeeds, so a 404 never paints a torn
 * image — the fallback simply stays where it was. */
const CASES = [
  { src: "/avatars/dara.svg", label: "Loads" },
  { src: "/avatars/gone.png", label: "404s" },
  { src: undefined, label: "No src" },
];

export default function AvatarFallback() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {CASES.map(({ src, label }) => (
        <div key={label} className="grid justify-items-center gap-2">
          <Avatar.Root size="lg" tone="primary">
            {src ? <Avatar.Image src={src} alt="" /> : null}
            <Avatar.Fallback label="Dara Okonjo">DO</Avatar.Fallback>
          </Avatar.Root>
          <span className="text-1 text-foreground-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
