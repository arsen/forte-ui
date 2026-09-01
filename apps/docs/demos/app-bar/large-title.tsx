"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";
import { AppBar, Button } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function AppBarLargeTitle() {
  return (
    <div className="h-[20rem] w-full overflow-y-auto rounded-surface border border-border-muted bg-background">
      <AppBar.Root position="sticky" variant="outline" elevateOnScroll>
        <AppBar.Leading>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Back">
            <ChevronLeft className={ICON} />
          </Button>
        </AppBar.Leading>

        {/* The small title: invisible until the large one has folded away. */}
        <AppBar.Title align="center" revealOnScroll>
          Inbox
        </AppBar.Title>

        <AppBar.Trailing>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="More">
            <MoreVertical className={ICON} />
          </Button>
        </AppBar.Trailing>

        {/* The large title: a second row that collapses once the page has
          * scrolled under the bar. The heading is the document's; the bar
          * only sizes it. */}
        <AppBar.Section collapsible>
          <h1 className="m-0 text-6 font-bold tracking-tight">Inbox</h1>
          <p className="m-0 text-2 text-foreground-muted">12 unread</p>
        </AppBar.Section>
      </AppBar.Root>

      <div className="grid gap-4 p-5 text-2 text-foreground-muted">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="m-0">
            The heading starts large, below the controls. As the page scrolls
            under the bar the row folds up and the small title fades into the
            bar in its place; at the top, the large one unfolds again.
          </p>
        ))}
      </div>
    </div>
  );
}
