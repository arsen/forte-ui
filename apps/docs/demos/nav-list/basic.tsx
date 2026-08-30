"use client";

import * as React from "react";
import { NavList } from "@forte-ui/react";

/* In an app, `active` comes from the router (see the routing example on this
 * page). The demo keeps it in state so the rows are clickable without
 * navigating away. */
const SECTIONS = [
  {
    label: "Getting started",
    items: [
      { title: "Installation", href: "/docs/installation" },
      { title: "Project structure", href: "/docs/structure" },
    ],
  },
  {
    label: "Building",
    items: [
      { title: "Routing", href: "/docs/routing" },
      { title: "Data fetching", href: "/docs/data" },
      { title: "Caching", href: "/docs/caching" },
      { title: "Deploying", href: "/docs/deploying" },
    ],
  },
];

export default function NavListBasic() {
  const [active, setActive] = React.useState("/docs/installation");

  return (
    <NavList.Root aria-label="Guides" className="w-56">
      {SECTIONS.map((section) => (
        <NavList.Section key={section.label}>
          <NavList.SectionLabel>{section.label}</NavList.SectionLabel>
          <NavList.List>
            {section.items.map((item) => (
              <NavList.Item key={item.href}>
                <NavList.Link
                  href={item.href}
                  active={active === item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    setActive(item.href);
                  }}
                >
                  {item.title}
                </NavList.Link>
              </NavList.Item>
            ))}
          </NavList.List>
        </NavList.Section>
      ))}
    </NavList.Root>
  );
}
