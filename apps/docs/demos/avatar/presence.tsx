"use client";

import { Avatar } from "@dofortech/pretty-ui";

const PEOPLE = [
  { name: "Ada Lovelace", src: "/avatars/ada.svg", initials: "AL", status: "Online", tone: "success" },
  { name: "Bea Rivera", src: "/avatars/bea.svg", initials: "BR", status: "Away", tone: "warning" },
  { name: "Cyrus Bell", src: "/avatars/cyrus.svg", initials: "CB", status: "Offline", tone: "neutral" },
] as const;

/* `Avatar.Badge` works out where the corner is: the offset that lands a dot on
 * the avatar's outline is a fraction of the radius, so it is right for every
 * `size` and every `shape` without a second prop. No `label` here, because the
 * status is written beside the avatar and would otherwise be announced twice. */
export default function AvatarPresence() {
  return (
    <div className="flex flex-wrap gap-6">
      {PEOPLE.map((person) => (
        <div key={person.name} className="flex items-center gap-3">
          <Avatar.Root size="lg">
            <Avatar.Image src={person.src} alt="" />
            <Avatar.Fallback>{person.initials}</Avatar.Fallback>
            <Avatar.Badge tone={person.tone} />
          </Avatar.Root>
          <div className="grid">
            <span className="text-2 font-medium">{person.name}</span>
            {/* The status is text, not a colour: SC 1.4.1. */}
            <span className="text-1 text-foreground-muted">{person.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
