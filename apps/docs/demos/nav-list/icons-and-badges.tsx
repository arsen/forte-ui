"use client";

import * as React from "react";
import { NavList } from "@dofortech/pretty-ui";
import { ChartLine, FlaskConical, Home, Settings, Users } from "lucide-react";

/* `size-4 shrink-0` — sized from the space scale, so icons follow density
 * like every other measure. The svg goes in as a plain child: rows are flex,
 * and icon colour rides `currentColor` through rest, hover and active. */
const icon = "size-4 shrink-0";

export default function NavListIconsAndBadges() {
  const [active, setActive] = React.useState("/home");

  const select = (href: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setActive(href);
  };

  return (
    <NavList.Root aria-label="Workspace" className="w-56">
      <NavList.List>
        <NavList.Item>
          <NavList.Link href="/home" active={active === "/home"} onClick={select("/home")}>
            <Home className={icon} aria-hidden />
            Home
          </NavList.Link>
        </NavList.Item>
        <NavList.Item>
          <NavList.Link
            href="/members"
            active={active === "/members"}
            onClick={select("/members")}
          >
            <Users className={icon} aria-hidden />
            Members
            <NavList.Badge>12</NavList.Badge>
          </NavList.Link>
        </NavList.Item>
        <NavList.Item>
          <NavList.Link
            href="/insights"
            active={active === "/insights"}
            onClick={select("/insights")}
          >
            <ChartLine className={icon} aria-hidden />
            Insights
            <NavList.Badge>New</NavList.Badge>
          </NavList.Link>
        </NavList.Item>
        <NavList.Item>
          <NavList.Link href="/labs" disabled>
            <FlaskConical className={icon} aria-hidden />
            Labs
            <NavList.Badge>Soon</NavList.Badge>
          </NavList.Link>
        </NavList.Item>
        <NavList.Item>
          <NavList.Link
            href="/settings"
            active={active === "/settings"}
            onClick={select("/settings")}
          >
            <Settings className={icon} aria-hidden />
            Settings
          </NavList.Link>
        </NavList.Item>
      </NavList.List>
    </NavList.Root>
  );
}
