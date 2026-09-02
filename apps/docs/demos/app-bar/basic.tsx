"use client";

import { Bell, Menu, Search } from "lucide-react";
import { AppBar, Avatar, Button, ThemeToggle } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function AppBarBasic() {
  return (
    <AppBar.Root className="w-full">
      <AppBar.Leading>
        <Button variant="ghost" tone="neutral" iconOnly aria-label="Open navigation">
          <Menu className={ICON} />
        </Button>
      </AppBar.Leading>

      {/* A `<div>` by default — the heading level is the page's decision.
        * Nest the heading when the bar genuinely names the document. */}
      <AppBar.Title>
        <h1>Inbox</h1>
      </AppBar.Title>

      <AppBar.Trailing>
        <Button variant="ghost" tone="neutral" iconOnly aria-label="Search">
          <Search className={ICON} />
        </Button>
        <Button variant="ghost" tone="neutral" iconOnly aria-label="Notifications">
          <Bell className={ICON} />
        </Button>
        <ThemeToggle />
        <Avatar.Root size="sm">
          <Avatar.Image src="/avatars/ada.svg" alt="" />
          <Avatar.Fallback label="Ada Lovelace">AL</Avatar.Fallback>
        </Avatar.Root>
      </AppBar.Trailing>
    </AppBar.Root>
  );
}
