"use client";

import { NavigationMenu } from "@forte-ui/react";

const links = [
  { title: "Quick start", description: "Install the package and render a button." },
  { title: "Accessibility", description: "What the library measures, and what it asserts." },
  { title: "Theming", description: "One seed colour, rebuilt with relative colour syntax." },
  { title: "Motion", description: "Springs sampled into linear() easings, no runtime." },
  { title: "Tokens", description: "The whole inventory, generated from the stylesheets." },
  { title: "Releases", description: "What changed, and what broke." },
];

const COLUMNS = [1, 2, 3] as const;

export default function NavigationMenuColumns() {
  return (
    <NavigationMenu.Root aria-label="Column counts">
      <NavigationMenu.List>
        {COLUMNS.map((columns) => (
          <NavigationMenu.Item key={columns}>
            <NavigationMenu.Trigger>
              {columns === 1 ? "One column" : `${columns} columns`}
            </NavigationMenu.Trigger>
            {/* The panel's width is `columns × --forte-navigation-menu-column-width`.
              * Narrow the frame and the grid drops to fewer columns on its own —
              * `minmax(min(<column>, 100%), 1fr)` is what allows a track to
              * shrink below its own minimum instead of overflowing. */}
            <NavigationMenu.Content columns={columns}>
              {links.slice(0, columns * 2).map((item) => (
                <NavigationMenu.Link key={item.title} href="/customization/tokens" closeOnClick>
                  <NavigationMenu.LinkTitle>{item.title}</NavigationMenu.LinkTitle>
                  <NavigationMenu.LinkDescription>
                    {item.description}
                  </NavigationMenu.LinkDescription>
                </NavigationMenu.Link>
              ))}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>

      <NavigationMenu.Popup />
    </NavigationMenu.Root>
  );
}
