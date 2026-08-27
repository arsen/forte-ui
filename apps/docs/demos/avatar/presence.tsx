"use client";

import { Avatar } from "@dofortech/pretty-ui";

const PEOPLE = [
  { name: "Ada Lovelace", src: "/avatars/ada.svg", initials: "AL", status: "Online", dot: "bg-success" },
  { name: "Bea Rivera", src: "/avatars/bea.svg", initials: "BR", status: "Away", dot: "bg-warning" },
  { name: "Cyrus Bell", src: "/avatars/cyrus.svg", initials: "CB", status: "Offline", dot: "bg-foreground-subtle" },
];

/* There is no presence part, and there does not need to be one: the root is
 * `position: relative` and does NOT clip its overflow, so a dot is an ordinary
 * absolutely-positioned child. The ring around it is the page background, which
 * is what separates the dot from the photo underneath. */
export default function AvatarPresence() {
  return (
    <div className="flex flex-wrap gap-6">
      {PEOPLE.map((person) => (
        <div key={person.name} className="flex items-center gap-3">
          <Avatar.Root size="lg">
            <Avatar.Image src={person.src} alt="" />
            <Avatar.Fallback>{person.initials}</Avatar.Fallback>
            <span
              aria-hidden="true"
              className={`absolute end-0 bottom-0 size-3 rounded-pill border-2 border-background ${person.dot}`}
            />
          </Avatar.Root>
          <div className="grid">
            <span className="text-2 font-medium">{person.name}</span>
            {/* The status is text, not a colour: SC 1.4.1 again. */}
            <span className="text-1 text-foreground-muted">{person.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
