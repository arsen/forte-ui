"use client";

import { Menu, Search } from "lucide-react";
import { AppBar, Button, type AppBarSize } from "@forte-ui/react";

const SIZES: AppBarSize[] = ["sm", "md", "lg"];

export default function AppBarSizes() {
  return (
    <div className="grid w-full gap-4">
      {SIZES.map((size) => (
        /* The bar's `size` sets the bar and its title, not its contents:
         * each control keeps its own `size`, matched here by hand. No size on
         * the icons either — Button sizes a direct `svg` child to its own
         * `size`, so a 16px class on the `sm` bar's glyphs would grow its
         * squares past the 28px controls beside them. */
        <AppBar.Root key={size} size={size} variant="outline">
          <AppBar.Leading>
            <Button variant="ghost" size={size} iconOnly aria-label="Open navigation">
              <Menu />
            </Button>
          </AppBar.Leading>
          <AppBar.Title>Settings</AppBar.Title>
          <AppBar.Trailing>
            <Button variant="ghost" size={size} iconOnly aria-label="Search">
              <Search />
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
