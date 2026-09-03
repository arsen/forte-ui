"use client";

import { Menu, MoreVertical, Search } from "lucide-react";
import { AppBar, Button, Separator, type AppBarTone } from "@forte-ui/react";

const ICON = "size-4 shrink-0";
const TONES: AppBarTone[] = ["neutral", "primary", "secondary"];

export default function AppBarTones() {
  return (
    <div className="grid w-full gap-4">
      {TONES.map((tone) => (
        /* Nothing inside is told the tone. The ghost buttons, the muted
         * caption and the separator all read the foreground tokens, and a
         * colored bar re-points those for its subtree. */
        <AppBar.Root key={tone} tone={tone}>
          <AppBar.Leading>
            <Button variant="ghost" tone="neutral" iconOnly aria-label="Open navigation">
              <Menu className={ICON} />
            </Button>
          </AppBar.Leading>
          <AppBar.Title>
            Projects <span className="font-normal text-foreground-muted">· {tone}</span>
          </AppBar.Title>
          <AppBar.Trailing>
            <Button variant="ghost" tone="neutral" iconOnly aria-label="Search">
              <Search className={ICON} />
            </Button>
            <Separator orientation="vertical" decorative />
            <Button variant="ghost" tone="neutral" iconOnly aria-label="More">
              <MoreVertical className={ICON} />
            </Button>
          </AppBar.Trailing>
        </AppBar.Root>
      ))}
    </div>
  );
}
