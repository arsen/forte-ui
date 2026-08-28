"use client";

import * as React from "react";
import { Badge, Button } from "@dofortech/pretty-ui";
import { Bell, Inbox } from "lucide-react";

export default function BadgeOnAButton() {
  const [unread, setUnread] = React.useState(12);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4">
        {/* Inline. The count sits in the button's own label, so it is read as
          * part of it — "Inbox 12" — and nothing has to be repeated in an
          * aria-label. Reach for this first: the corner version below buys a
          * tighter layout and pays for it in markup. */}
        <Button variant="soft" tone="neutral">
          <Inbox aria-hidden />
          Inbox
          <Badge tone="primary" size="sm" count={unread} />
        </Button>

        {/* Corner, on an icon-only button. The wrapper is what the badge
          * positions against — `inline-flex` so it hugs the button rather than
          * spanning the row. `-end-1` and not `-right-1`: the badge has to
          * cross to the other corner in RTL. */}
        <span className="relative inline-flex">
          <Button
            iconOnly
            variant="ghost"
            tone="neutral"
            aria-label={`Notifications, ${unread} unread`}
            onClick={() => setUnread(0)}
          >
            <Bell aria-hidden />
          </Button>
          {unread > 0 ? (
            /* `aria-hidden`, because the count is already in the button's
              * label above — without that it would be announced twice, and a
              * bare "12" beside a button tells a screen reader user nothing.
              * `pointer-events-none` so the badge cannot swallow the click
              * that is meant for the button underneath it. */
            <Badge
              variant="solid"
              tone="danger"
              size="sm"
              shape="pill"
              count={unread}
              aria-hidden
              className="pointer-events-none absolute -top-1 -end-1"
            />
          ) : null}
        </span>

        {/* The same thing over a filled button, where the badge would
          * otherwise sit on a colour close to its own. The ring is the page
          * behind it, punched back through — the trick `Avatar.Group` uses to
          * separate overlapping avatars. */}
        <span className="relative inline-flex">
          <Button tone="primary" onClick={() => setUnread((n) => n + 1)}>
            Send message
          </Button>
          <Badge
            variant="solid"
            tone="danger"
            size="sm"
            shape="pill"
            count={unread}
            aria-hidden
            className="pointer-events-none absolute -top-1 -end-1 ring-2 ring-background"
          />
        </span>
      </div>

      <p className="text-1 text-foreground-muted">
        Sending adds one, the bell clears them. Hold the button down past 99 and
        the badge stops at <code className="font-mono">99+</code> instead of
        stretching — and the bell&rsquo;s accessible name keeps the real number.
      </p>
    </div>
  );
}
