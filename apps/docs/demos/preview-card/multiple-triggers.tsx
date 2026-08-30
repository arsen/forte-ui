"use client";

import { Avatar, PreviewCard } from "@dofortech/forte-ui";

type Person = {
  id: string;
  handle: string;
  name: string;
  initials: string;
  avatar: string;
  role: string;
};

const PEOPLE: Person[] = [
  {
    id: "ada",
    handle: "@ada",
    name: "Ada Lovelace",
    initials: "AL",
    avatar: "/avatars/ada.svg",
    role: "Wrote the first published algorithm, in 1843.",
  },
  {
    id: "bea",
    handle: "@bea",
    name: "Bea Rivera",
    initials: "BR",
    avatar: "/avatars/bea.svg",
    role: "Keeps the contrast harness honest.",
  },
  {
    id: "cyrus",
    handle: "@cyrus",
    name: "Cyrus Adeyemi",
    initials: "CA",
    avatar: "/avatars/cyrus.svg",
    role: "Owns the motion tokens and the reduced-motion story.",
  },
];

export default function PreviewCardMultipleTriggers() {
  return (
    // One Root, one popup, three links. Each link hands the popup a `payload`,
    // and the popup reads it from the render-function form of Root's children
    // — so the card is written once instead of three times, and only one popup
    // element is ever mounted no matter how many mentions the paragraph grows.
    <PreviewCard.Root<Person>>
      {({ payload }) => (
        <>
          <p className="max-w-md text-2 leading-normal">
            Reviewed by {renderMention(PEOPLE[0])}, {renderMention(PEOPLE[1])}{" "}
            and {renderMention(PEOPLE[2])} before it shipped.
          </p>

          <PreviewCard.Popup size="sm">
            <PreviewCard.Arrow />
            {/* `payload` is undefined on the frames before the first open, and
              * again while the card is animating out — Base UI keeps the popup
              * mounted until the exit finishes. Guard it, or the name empties
              * in full view of the closing gesture. */}
            {payload ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar.Root>
                    <Avatar.Image src={payload.avatar} alt="" />
                    <Avatar.Fallback>{payload.initials}</Avatar.Fallback>
                  </Avatar.Root>
                  <div className="grid">
                    <span className="text-2 font-semibold">{payload.name}</span>
                    <span className="text-1 text-foreground-muted">
                      {payload.handle}
                    </span>
                  </div>
                </div>
                <p className="text-2 text-foreground-muted">{payload.role}</p>
              </>
            ) : null}
          </PreviewCard.Popup>
        </>
      )}
    </PreviewCard.Root>
  );
}

function renderMention(person: Person) {
  return (
    <PreviewCard.Trigger payload={person} href="#">
      {person.handle}
    </PreviewCard.Trigger>
  );
}
