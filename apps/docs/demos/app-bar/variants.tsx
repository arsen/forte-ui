"use client";

import { Menu, Search } from "lucide-react";
import { AppBar, Button, type AppBarVariant } from "@forte-ui/react";

const ICON = "size-4 shrink-0";
const VARIANTS: AppBarVariant[] = ["plain", "panel", "outline", "frosted"];

export default function AppBarVariants() {
  return (
    /* The bars sit on a gradient so `frosted` has something to show through
     * it — on a flat page it is indistinguishable from `outline`. Hidden
     * under forced colors, where a gradient is a meaningless flat block. */
    <div className="grid w-full gap-4 rounded-surface bg-[linear-gradient(135deg,var(--forte-accent-4),var(--forte-secondary-4))] p-4 forte-hc-decorative">
      {VARIANTS.map((variant) => (
        <AppBar.Root key={variant} variant={variant}>
          <AppBar.Leading>
            <Button variant="ghost" tone="neutral" iconOnly aria-label="Open navigation">
              <Menu className={ICON} />
            </Button>
          </AppBar.Leading>
          <AppBar.Title>{variant}</AppBar.Title>
          <AppBar.Trailing>
            <Button variant="ghost" tone="neutral" iconOnly aria-label="Search">
              <Search className={ICON} />
            </Button>
            <Button variant="solid" tone="primary" size="sm">
              New
            </Button>
          </AppBar.Trailing>
        </AppBar.Root>
      ))}
    </div>
  );
}
