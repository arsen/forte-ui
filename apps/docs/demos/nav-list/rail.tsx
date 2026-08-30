"use client";

import * as React from "react";
import { NavList } from "@dofortech/forte-ui";

const ITEMS = [
  { title: "Overview", href: "/project" },
  { title: "Analytics", href: "/project/analytics" },
  { title: "Reports", href: "/project/reports" },
  { title: "Exports", href: "/project/exports" },
];

export default function NavListRail() {
  const [active, setActive] = React.useState("/project/analytics");

  return (
    <NavList.Root aria-label="Project" marker="rail" className="w-56">
      <NavList.List>
        {ITEMS.map((item) => (
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
    </NavList.Root>
  );
}
