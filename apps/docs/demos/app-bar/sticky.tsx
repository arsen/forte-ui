"use client";

import { Menu, Search } from "lucide-react";
import { AppBar, Button } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function AppBarSticky() {
  return (
    /* The scroll container is this box, not the window: the bar finds the
     * nearest scrolling ancestor and pins to the top of it. */
    <div className="h-[18rem] w-full overflow-y-auto rounded-surface border border-border-muted bg-background">
      <AppBar.Root position="sticky" variant="frosted" elevateOnScroll>
        <AppBar.Leading>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Open navigation">
            <Menu className={ICON} />
          </Button>
        </AppBar.Leading>
        <AppBar.Title>Release notes</AppBar.Title>
        <AppBar.Trailing>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Search">
            <Search className={ICON} />
          </Button>
        </AppBar.Trailing>
      </AppBar.Root>

      <div className="grid gap-4 p-5 text-2 text-foreground-muted">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="m-0">
            At the top the bar is part of the page — no fill, no edge. Scroll and
            it becomes a surface over the content, frosted, with the hairline
            and a shadow. Scroll back and it dissolves again.
          </p>
        ))}
      </div>
    </div>
  );
}
