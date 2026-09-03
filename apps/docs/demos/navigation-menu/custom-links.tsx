"use client";

import NextLink from "next/link";
import { NavigationMenu } from "@forte-ui/react";

const pages = [
  { href: "/components/menu", title: "Menu", description: "Commands, not destinations." },
  { href: "/components/tabs", title: "Tabs", description: "One panel at a time, in place." },
  { href: "/components/popover", title: "Popover", description: "An anchored surface to read or act on." },
];

export default function NavigationMenuCustomLinks() {
  return (
    <NavigationMenu.Root aria-label="Client-side routing">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Related</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            {pages.map((page) => (
              /* `render` hands the element to the router's own link component,
                * so navigation stays client-side and the menu keeps its
                * keyboard behavior. `href` goes on BOTH: Base UI needs it to
                * decide the link is a link, next/link needs it to route. */
              <NavigationMenu.Link
                key={page.href}
                href={page.href}
                render={<NextLink href={page.href} />}
                closeOnClick
              >
                <NavigationMenu.LinkTitle>{page.title}</NavigationMenu.LinkTitle>
                <NavigationMenu.LinkDescription>
                  {page.description}
                </NavigationMenu.LinkDescription>
              </NavigationMenu.Link>
            ))}

            {/* An outbound link is still an ordinary <a>: no router involved,
              * and it opens a new tab, so `closeOnClick` stays off — this page
              * and its menu are still standing behind it. */}
            <NavigationMenu.Link
              href="https://base-ui.com/react/components/navigation-menu"
              target="_blank"
              rel="noreferrer"
            >
              <NavigationMenu.LinkTitle>Base UI Navigation Menu ↗</NavigationMenu.LinkTitle>
              <NavigationMenu.LinkDescription>
                The unstyled primitive this is built on.
              </NavigationMenu.LinkDescription>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Popup />
    </NavigationMenu.Root>
  );
}
