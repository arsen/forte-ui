"use client";

import { Button, Popover } from "@dofortech/pretty-ui";

type View = { id: string; name: string; note: string };

const VIEWS: View[] = [
  {
    id: "view-open-issues",
    name: "Open issues",
    note: "Everything unresolved, newest first, grouped by milestone.",
  },
  {
    id: "view-my-reviews",
    name: "My reviews",
    note: "Pull requests waiting on you, oldest first.",
  },
  {
    id: "view-stale-branches",
    name: "Stale branches",
    note: "Merged or untouched for 30 days, with their last author.",
  },
];

// Created once, at module scope. A handle made during render would be a new
// object on every pass and the root and its triggers would stop recognising
// each other. `React.useState(() => Popover.createHandle())` is the escape
// hatch when the handle has to be per-instance.
const savedViews = Popover.createHandle<View>();

export default function PopoverDetachedTrigger() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {/* These triggers are not children of Popover.Root. They reach it
        * through the handle instead, which is what lets the popup be declared
        * once, at the bottom, beside the data it renders — rather than nested
        * inside whichever part of the layout happens to hold the buttons. */}
      <div className="flex flex-wrap items-center gap-2">
        {VIEWS.map((view) => (
          <Popover.Trigger
            key={view.id}
            id={view.id}
            handle={savedViews}
            payload={view}
            render={<Button variant="outline" tone="neutral" size="sm" />}
          >
            {view.name}
          </Popover.Trigger>
        ))}
      </div>

      <p className="m-0 text-foreground-muted">
        Anything else on the page can open it too, without being a trigger at
        all:
      </p>

      {/* The imperative half of the same handle. `open()` takes a TRIGGER ID —
        * the popup still has to be anchored to something — so each trigger
        * above carries an explicit `id`. It is a no-op unless a root using
        * this handle is mounted; calls made before that are ignored rather
        * than queued. */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          onClick={() => savedViews.open(VIEWS[0].id)}
        >
          Open the first view
        </Button>
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          onClick={() => savedViews.close()}
        >
          Close
        </Button>
      </div>

      <Popover.Root handle={savedViews}>
        {({ payload }) => (
          <Popover.Popup size="sm">
            <Popover.Arrow />
            <Popover.Title>{payload?.name ?? "Saved view"}</Popover.Title>
            <Popover.Description>
              {payload?.note ??
                "Filters, sort order and column layout are stored with the view."}
            </Popover.Description>
          </Popover.Popup>
        )}
      </Popover.Root>
    </div>
  );
}
