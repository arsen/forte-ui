"use client";

import { NavigationMenu } from "@dofortech/forte-ui";

const primitives = [
  { title: "Accordion", description: "Sections that expand one at a time." },
  { title: "Collapsible", description: "One section, open or shut." },
  { title: "Tabs", description: "One panel at a time, with a sliding indicator." },
];

export default function NavigationMenuNested() {
  return (
    <NavigationMenu.Root aria-label="Nested menus">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Library</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/components/button" closeOnClick>
              <NavigationMenu.LinkTitle>Getting started</NavigationMenu.LinkTitle>
              <NavigationMenu.LinkDescription>
                Install the package and render your first component.
              </NavigationMenu.LinkDescription>
            </NavigationMenu.Link>

            {/* A whole `Root` nested inside a panel, with its own `Popup`. It
              * renders a <div> rather than a second <nav>, so the page still
              * has one navigation landmark for this region. */}
            <NavigationMenu.Root orientation="vertical">
              <NavigationMenu.List>
                <NavigationMenu.Item>
                  {/* `card` is what makes the nested trigger sit level with the
                    * links around it, chevron and all. */}
                  <NavigationMenu.Trigger variant="card">
                    <NavigationMenu.LinkTitle>Disclosure</NavigationMenu.LinkTitle>
                    <NavigationMenu.LinkDescription>
                      Three ways to show one thing at a time.
                    </NavigationMenu.LinkDescription>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    {primitives.map((item) => (
                      <NavigationMenu.Link
                        key={item.title}
                        href={`/components/${item.title.toLowerCase()}`}
                        closeOnClick
                      >
                        <NavigationMenu.LinkTitle>{item.title}</NavigationMenu.LinkTitle>
                        <NavigationMenu.LinkDescription>
                          {item.description}
                        </NavigationMenu.LinkDescription>
                      </NavigationMenu.Link>
                    ))}
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Popup side="inline-end" align="start" alignOffset={-8} />
            </NavigationMenu.Root>

            <NavigationMenu.Link href="/customization/theming" closeOnClick>
              <NavigationMenu.LinkTitle>Theming</NavigationMenu.LinkTitle>
              <NavigationMenu.LinkDescription>
                One seed colour rebuilds the whole palette.
              </NavigationMenu.LinkDescription>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Popup />
    </NavigationMenu.Root>
  );
}
