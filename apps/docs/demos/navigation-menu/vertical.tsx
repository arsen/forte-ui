"use client";

import { NavigationMenu } from "@dofortech/forte-ui";

const sections = {
  Account: ["Profile", "Sessions", "Connected apps"],
  Billing: ["Plan", "Invoices", "Payment method"],
};

export default function NavigationMenuVertical() {
  return (
    /* `orientation` swaps which arrow keys move between triggers, and it is
     * what the panel's entrance reads: a vertical bar's panels slide in from
     * above or below rather than from the side. */
    <NavigationMenu.Root orientation="vertical" aria-label="Settings">
      <NavigationMenu.List>
        {Object.entries(sections).map(([label, items]) => (
          <NavigationMenu.Item key={label}>
            <NavigationMenu.Trigger>{label}</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              {items.map((item) => (
                <NavigationMenu.Link key={item} href="/components/navigation-menu" closeOnClick>
                  <NavigationMenu.LinkTitle>{item}</NavigationMenu.LinkTitle>
                </NavigationMenu.Link>
              ))}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}

        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="/components/button">
            Sign out
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      {/* A vertical bar's panel belongs beside it, not under it. `start`
        * aligns the panel's top edge with the trigger that opened it. */}
      <NavigationMenu.Popup side="inline-end" align="start" />
    </NavigationMenu.Root>
  );
}
