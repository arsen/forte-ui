"use client";

import { NavigationMenu } from "@forte-ui/react";

const components = [
  { href: "/components/button", title: "Button", description: "The one control everything else is measured against." },
  { href: "/components/dialog", title: "Dialog", description: "A modal surface, with focus trapped inside it." },
  { href: "/components/select", title: "Select", description: "Pick one value out of a fixed set." },
  { href: "/components/toast", title: "Toast", description: "Transient messages that never steal focus." },
];

const customization = [
  { href: "/customization/theming", title: "Theming", description: "One seed colour rebuilds the whole palette." },
  { href: "/customization/tokens", title: "Design tokens", description: "Every value the library reads, in one table." },
  { href: "/customization/tailwind", title: "Tailwind", description: "The bridge that re-points Tailwind's theme." },
];

export default function NavigationMenuBasic() {
  return (
    /* One `aria-label` per navigation on a page. It is what a screen-reader
     * user picks between in a landmark list, and two unnamed navigations there
     * are indistinguishable. */
    <NavigationMenu.Root aria-label="forte-ui documentation">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
          <NavigationMenu.Content columns={2}>
            {components.map((item) => (
              <NavigationMenu.Link key={item.href} href={item.href} closeOnClick>
                <NavigationMenu.LinkTitle>{item.title}</NavigationMenu.LinkTitle>
                <NavigationMenu.LinkDescription>
                  {item.description}
                </NavigationMenu.LinkDescription>
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Customization</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            {customization.map((item) => (
              <NavigationMenu.Link key={item.href} href={item.href} closeOnClick>
                <NavigationMenu.LinkTitle>{item.title}</NavigationMenu.LinkTitle>
                <NavigationMenu.LinkDescription>
                  {item.description}
                </NavigationMenu.LinkDescription>
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* An item with no panel: a `plain` Link sits level with the triggers
          * beside it because both draw from the same set of `-row-*` knobs. */}
        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="/theme">
            Theme Studio
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      {/* One popup for the whole bar. It slides and resizes between the
        * triggers rather than each item owning a surface of its own. */}
      <NavigationMenu.Popup />
    </NavigationMenu.Root>
  );
}
