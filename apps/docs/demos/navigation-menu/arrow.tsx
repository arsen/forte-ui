"use client";

import { NavigationMenu } from "@dofortech/pretty-ui";

const sections = {
  Docs: ["Quick start", "Accessibility", "Composition"],
  Blog: ["Release notes", "Case studies"],
  Support: ["Discussions", "Report an issue", "Status"],
};

export default function NavigationMenuArrow() {
  return (
    <NavigationMenu.Root aria-label="With an arrow">
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
      </NavigationMenu.List>

      {/* The wedge slides along with the panel and keeps pointing at whichever
        * trigger is open — which is worth having once the panel is much wider
        * than the trigger that produced it. */}
      <NavigationMenu.Popup arrow />
    </NavigationMenu.Root>
  );
}
