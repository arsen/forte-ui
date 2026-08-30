"use client";

import * as React from "react";
import { Button, Drawer } from "@dofortech/forte-ui";

type Review = {
  id: string;
  title: string;
  author: string;
  branch: string;
  summary: string;
};

const REVIEWS: Review[] = [
  {
    id: "1841",
    title: "Rate-limit the export endpoint",
    author: "Nadia",
    branch: "fix/export-rate-limit",
    summary:
      "Adds a token bucket in front of /export and returns 429 with a Retry-After header once it empties.",
  },
  {
    id: "1839",
    title: "Drop the legacy session cookie",
    author: "Tomás",
    branch: "chore/session-cookie",
    summary:
      "The old cookie has not been read since March. This removes the writer and the migration that kept it warm.",
  },
  {
    id: "1836",
    title: "Retry failed webhooks",
    author: "Priya",
    branch: "feat/webhook-retry",
    summary:
      "Three attempts with exponential backoff, then the delivery moves to the dead-letter queue.",
  },
];

const stack = "flex w-full max-w-sm flex-col gap-2";

const rows = "flex flex-col";

const row = "flex justify-between gap-4 border-t border-border-muted py-2";

const label = "text-foreground-muted";

export default function DrawerControlled() {
  // Two pieces of state, not one. `open` is what the drawer is told; `review`
  // is what it reads. They are separate because they stop being true at
  // different moments — see onOpenChangeComplete below.
  const [open, setOpen] = React.useState(false);
  const [review, setReview] = React.useState<Review | null>(null);

  function inspect(next: Review) {
    setReview(next);
    setOpen(true);
  }

  return (
    <div className={stack}>
      {REVIEWS.map((item) => (
        <Button
          key={item.id}
          variant="outline"
          tone="neutral"
          fullWidth
          onClick={() => inspect(item)}
        >
          #{item.id} — {item.title}
        </Button>
      ))}

      {/* No Drawer.Trigger anywhere: the rows above are ordinary buttons that
          happen to set state, and the drawer only ever reads it. */}
      <Drawer.Root
        side="right"
        open={open}
        // Every exit reports here — Escape, an outside press, Drawer.Close and
        // the swipe. Accept all of them: a controlled drawer that filters one
        // out slides back into place after the gesture already threw it off
        // the screen.
        onOpenChange={setOpen}
        // Base UI keeps the popup mounted until the closing slide finishes, so
        // the review has to outlive the `false`. Clearing it in onOpenChange
        // would empty the title and body in full view of the animation.
        onOpenChangeComplete={(nowOpen) => {
          if (!nowOpen) {
            setReview(null);
          }
        }}
      >
        <Drawer.Popup size="sm">
          <Drawer.Content>
            {review ? (
              <>
                <Drawer.Title>{review.title}</Drawer.Title>
                <Drawer.Description>{review.summary}</Drawer.Description>
                <div className={rows}>
                  <div className={row}>
                    <span className={label}>Author</span>
                    <span>{review.author}</span>
                  </div>
                  <div className={row}>
                    <span className={label}>Branch</span>
                    <span>{review.branch}</span>
                  </div>
                </div>
              </>
            ) : null}
            <Drawer.Footer>
              {/* Closing from inside the drawer goes through Drawer.Close, not
                  through setOpen(false). It is the same state change either
                  way, but this one keeps the button a real close control for
                  assistive technology. */}
              <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
                Close
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Root>
    </div>
  );
}
