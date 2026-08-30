"use client";

import * as React from "react";
import { NavList } from "@dofortech/forte-ui";

export default function NavListGroups() {
  const [active, setActive] = React.useState("/settings/members");
  const [workspaceOpen, setWorkspaceOpen] = React.useState(true);
  const inWorkspace = active !== "/settings/general";

  const link = (href: string, title: string) => (
    <NavList.Item key={href}>
      <NavList.Link
        href={href}
        active={active === href}
        onClick={(event) => {
          event.preventDefault();
          setActive(href);
        }}
      >
        {title}
      </NavList.Link>
    </NavList.Item>
  );

  return (
    <NavList.Root aria-label="Settings" className="w-56">
      <NavList.List>
        {link("/settings/general", "General")}

        {/* `active` on the trigger marks "the current page is in here". Lit
          * only while the group is CLOSED — open, the row itself is visible
          * and highlighted, and two active rows would fight over the eye. */}
        <NavList.Group open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
          <NavList.GroupTrigger active={!workspaceOpen && inWorkspace}>
            Workspace
          </NavList.GroupTrigger>
          <NavList.GroupPanel>
            <NavList.List>
              {link("/settings/members", "Members")}
              {link("/settings/billing", "Billing")}

              <NavList.Group>
                <NavList.GroupTrigger>Integrations</NavList.GroupTrigger>
                <NavList.GroupPanel>
                  <NavList.List>
                    {link("/settings/integrations/github", "GitHub")}
                    {link("/settings/integrations/slack", "Slack")}
                  </NavList.List>
                </NavList.GroupPanel>
              </NavList.Group>
            </NavList.List>
          </NavList.GroupPanel>
        </NavList.Group>
      </NavList.List>
    </NavList.Root>
  );
}
