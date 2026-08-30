"use client";

import * as React from "react";
import { NavigationMenu } from "@dofortech/forte-ui";

const links = ["Overview", "Integrations", "Changelog"];

export default function NavigationMenuTheming() {
  return (
    /* The bar's knobs go on `Root`, which every row in it is a descendant of.
     * They stay in a `style` object rather than becoming utility classes
     * because a class cannot set an arbitrary custom property. */
    <NavigationMenu.Root
      aria-label="Themed"
      style={
        {
          "--forte-navigation-menu-row-radius": "var(--forte-radius-pill)",
          "--forte-navigation-menu-row-bg-open": "var(--forte-color-secondary-soft)",
          "--forte-navigation-menu-row-fg-open": "var(--forte-color-secondary-text)",
          "--forte-navigation-menu-gap": "var(--forte-space-2)",
        } as React.CSSProperties
      }
    >
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content columns={2}>
            {links.map((item) => (
              <NavigationMenu.Link key={item} href="/components/navigation-menu" closeOnClick>
                <NavigationMenu.LinkTitle>{item}</NavigationMenu.LinkTitle>
                <NavigationMenu.LinkDescription>
                  Set on the popup, inherited by every card in it.
                </NavigationMenu.LinkDescription>
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="/theme">
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      {/* Everything the panel needs is declared on the popup — including the
        * card knobs, which the cards deliberately do not redeclare. That is
        * what lets one `style` here retune a whole panel; setting them on
        * `Root` instead would do nothing, since the popup is portalled to
        * <body> and is not a descendant of it. */}
      <NavigationMenu.Popup
        arrow
        style={
          {
            "--forte-navigation-menu-radius": "var(--forte-radius-5)",
            "--forte-navigation-menu-border-color": "var(--forte-color-secondary-border)",
            "--forte-navigation-menu-column-width": "13rem",
            "--forte-navigation-menu-content-p": "var(--forte-space-3)",
            "--forte-navigation-menu-card-radius": "var(--forte-radius-4)",
            "--forte-navigation-menu-card-bg-hover": "var(--forte-color-secondary-soft)",
          } as React.CSSProperties
        }
      />
    </NavigationMenu.Root>
  );
}
