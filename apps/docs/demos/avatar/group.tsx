"use client";

import type { CSSProperties } from "react";
import { Avatar } from "@forte-ui/react";

const TEAM = [
  { name: "Ada Lovelace", initials: "AL", src: "/avatars/ada.svg" },
  { name: "Bea Rivera", initials: "BR", src: "/avatars/bea.svg" },
  { name: "Cyrus Bell", initials: "CB", src: "/avatars/cyrus.svg" },
  { name: "Dara Okonjo", initials: "DO", src: "/avatars/dara.svg" },
];

export default function AvatarGroup() {
  return (
    <div className="grid gap-5">
      <Avatar.Group>
        {TEAM.map((person) => (
          <Avatar.Root key={person.name}>
            <Avatar.Image src={person.src} alt={person.name} />
            {/* The image carries the name, so the fallback repeats it only for
              * the case where the image never arrives. */}
            <Avatar.Fallback label={person.name}>{person.initials}</Avatar.Fallback>
          </Avatar.Root>
        ))}
        {/* Last, so it lands on top: children paint in DOM order and the
          * counter is where the eye should finish. */}
        <Avatar.Root tone="primary" variant="solid">
          <Avatar.Fallback label="3 more people">+3</Avatar.Fallback>
        </Avatar.Root>
      </Avatar.Group>

      {/* The overlap is a length rather than a fraction, so a group of larger
        * avatars says how much larger. */}
      <Avatar.Group style={{ "--forte-avatar-group-overlap": "1.25rem" } as CSSProperties}>
        {TEAM.slice(0, 3).map((person) => (
          <Avatar.Root key={person.name} size="xl" shape="rounded">
            <Avatar.Image src={person.src} alt={person.name} />
            <Avatar.Fallback label={person.name}>{person.initials}</Avatar.Fallback>
          </Avatar.Root>
        ))}
      </Avatar.Group>
    </div>
  );
}
