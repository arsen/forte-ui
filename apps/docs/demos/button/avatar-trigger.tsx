"use client";

import { Avatar, Button, Menu, ThemeToggle } from "@forte-ui/react";

const SIZES = ["sm", "md", "lg"] as const;

export default function ButtonAvatarTrigger() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Menu.Root>
            <Menu.Trigger
              render={<Button variant="outline" iconOnly size={size} />}
              aria-label={`Account menu (${size})`}
            >
              {/* No `size` on the avatar: inside an icon-only button the
                * button sizes it from `--forte-button-avatar-size` and pulls
                * its padding in to fit, so the square stays on the control
                * height — level with the toggle beside it. */}
              <Avatar.Root tone="primary">
                <Avatar.Image src="/avatars/ada.svg" alt="" />
                <Avatar.Fallback label="Ada Lovelace">AL</Avatar.Fallback>
              </Avatar.Root>
            </Menu.Trigger>
            <Menu.Popup align="end">
              <Menu.Item>Account</Menu.Item>
              <Menu.Separator />
              <Menu.Item>Log out</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <ThemeToggle variant="outline" size={size} />
        </div>
      ))}
    </div>
  );
}
