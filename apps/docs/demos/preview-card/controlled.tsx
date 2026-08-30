"use client";

import * as React from "react";
import { Button, PreviewCard, Switch } from "@dofortech/forte-ui";

const RELEASES = [
  {
    id: "release-0-3",
    name: "v0.3",
    body: "The motion tokens land, and every component stops writing its own prefers-reduced-motion query.",
  },
  {
    id: "release-0-4",
    name: "v0.4",
    body: "The contrast harness becomes a build gate rather than a report.",
  },
  {
    id: "release-0-5",
    name: "v0.5",
    body: "The Tailwind bridge ships from the library, so the docs and a consumer app read the same token map.",
  },
];

export default function PreviewCardControlled() {
  // Two pieces of state, because a multi-trigger card has two questions:
  // whether it is open, and which link it is anchored to. `triggerId` is what
  // anchors the popup, so it has to be set before `open` is honoured.
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(
    RELEASES[0].id,
  );

  const release = RELEASES.find((item) => item.id === triggerId) ?? RELEASES[0];
  const index = RELEASES.indexOf(release);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {/* The controls sit ABOVE the paragraph on purpose: the card opens
        * below the link it is anchored to, and a row underneath would spend
        * the whole demo hidden behind it. */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-2">
          <Switch
            checked={open}
            onCheckedChange={setOpen}
            aria-label="Pin the card open"
          />
          Pin the card open
        </label>
        {/* Re-anchoring is a state change, not a close: triggerId alone moves
          * the same card to the next link. `open` is set here too because
          * pressing a button outside the card is an outside press, which
          * reports through onOpenChange a moment before this handler runs. */}
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          disabled={index === RELEASES.length - 1}
          onClick={() => {
            setTriggerId(RELEASES[index + 1]?.id ?? null);
            setOpen(true);
          }}
        >
          Next release
        </Button>
      </div>
      <PreviewCard.Root
        open={open}
        triggerId={triggerId}
        // Every route in and out reports here — hover, focus, Escape and an
        // outside press alike. There is no separate onTriggerIdChange: the
        // trigger that caused the change arrives on the event details, so both
        // pieces of state are updated from this one handler.
        onOpenChange={(nextOpen, eventDetails) => {
          if (nextOpen && eventDetails.trigger?.id) {
            setTriggerId(eventDetails.trigger.id);
          }
          setOpen(nextOpen);
        }}
      >
        <p className="text-2 leading-normal">
          Shipped so far:{" "}
          {RELEASES.map((item, position) => (
            <span key={item.id}>
              {position > 0 ? ", " : ""}
              <PreviewCard.Trigger id={item.id} href="#">
                {item.name}
              </PreviewCard.Trigger>
            </span>
          ))}
          .
        </p>

        <PreviewCard.Popup size="sm">
          <PreviewCard.Arrow />
          <span className="text-3 font-semibold">{release.name}</span>
          <p className="text-2 text-foreground-muted">{release.body}</p>
        </PreviewCard.Popup>
      </PreviewCard.Root>
    </div>
  );
}
