"use client";

import { Menu, Search } from "lucide-react";
import { AppBar, Button, type AppBarSize } from "@forte-ui/react";

const ICON = "size-4 shrink-0";
const SIZES: AppBarSize[] = ["sm", "md", "lg"];

export default function AppBarSizes() {
  return (
    <div className="grid w-full gap-4">
      {SIZES.map((size) => (
        /* The bar's `size` sets the bar and its title, not its contents:
         * each control keeps its own `size`, matched here by hand. */
        <AppBar.Root key={size} size={size} variant="outline">
          <AppBar.Leading>
            <Button variant="ghost" tone="neutral" size={size} iconOnly aria-label="Open navigation">
              <Menu className={ICON} />
            </Button>
          </AppBar.Leading>
          <AppBar.Title>Settings</AppBar.Title>
          <AppBar.Trailing>
            <Button variant="ghost" tone="neutral" size={size} iconOnly aria-label="Search">
              <Search className={ICON} />
            </Button>
            <Button variant="solid" tone="primary" size={size}>
              Save
            </Button>
          </AppBar.Trailing>
        </AppBar.Root>
      ))}
    </div>
  );
}
