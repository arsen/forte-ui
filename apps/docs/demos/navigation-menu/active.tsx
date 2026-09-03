"use client";

import { NavigationMenu } from "@forte-ui/react";

const guides = [
  { href: "/customization/theming", title: "Theming" },
  { href: "/customization/presets", title: "Presets" },
  { href: "/customization/tokens", title: "Design tokens" },
];

/* Pretend this came from a router. In a real app it is `usePathname()` from
 * next/navigation, or your router's equivalent. */
const pathname = "/customization/presets";

export default function NavigationMenuActive() {
  return (
    <NavigationMenu.Root aria-label="Current page">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Customization</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            {guides.map((item) => (
              /* `active` publishes `data-active` AND `aria-current="page"`, so
               * the cue is not color alone — which is what SC 1.4.1 asks for
               * and what a screen reader announces as "current page". */
              <NavigationMenu.Link
                key={item.href}
                href={item.href}
                active={pathname === item.href}
                closeOnClick
              >
                <NavigationMenu.LinkTitle>{item.title}</NavigationMenu.LinkTitle>
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* A `plain` Link takes the same treatment, so the bar shows where you
          * are even when no panel is open. */}
        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="/theme" active>
            Theme Studio
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="/components/button">
            Components
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Popup />
    </NavigationMenu.Root>
  );
}
