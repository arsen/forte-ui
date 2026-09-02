"use client";

import { ChevronLeft, Share } from "lucide-react";
import { AppBar, Button } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function AppBarHideOnScroll() {
  return (
    <div className="h-[18rem] w-full overflow-y-auto rounded-surface border border-border-muted bg-background">
      <AppBar.Root position="sticky" variant="panel" hideOnScroll>
        <AppBar.Leading>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Back">
            <ChevronLeft className={ICON} />
          </Button>
        </AppBar.Leading>
        <AppBar.Title align="center">Article</AppBar.Title>
        <AppBar.Trailing>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Share">
            <Share className={ICON} />
          </Button>
        </AppBar.Trailing>
      </AppBar.Root>

      <div className="grid gap-4 p-5 text-2 text-foreground-muted">
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="m-0">
            Scroll down and the bar slides away to give the text the room;
            scroll up by any amount and it is back. It never hides within its
            own height of the top, and Tab into it brings it back too.
          </p>
        ))}
      </div>
    </div>
  );
}
