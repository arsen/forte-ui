"use client";

import { Breadcrumb, Menu } from "@forte-ui/react";

/* A deep trail keeps its first and last crumbs and folds the middle into a
 * menu. `Breadcrumb.Ellipsis` is a <span> on its own — inert, and a trail is
 * the wrong place to hide a page behind something unclickable — so it goes in
 * as the menu's trigger.
 *
 * The inner `render={<button type="button" />}` is what keeps `Menu.Trigger`
 * from also painting its own button chrome: it only styles itself when it is
 * rendering its default element. */
const HIDDEN = [
  { title: "Projects", href: "#projects" },
  { title: "Apollo", href: "#apollo" },
  { title: "Releases", href: "#releases" },
];

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          <Menu.Root>
            <Breadcrumb.Ellipsis
              label={`Show ${HIDDEN.length} more levels`}
              render={<Menu.Trigger render={<button type="button" />} />}
            />
            <Menu.Popup>
              {HIDDEN.map((crumb) => (
                <Menu.LinkItem key={crumb.title} href={crumb.href} closeOnClick>
                  {crumb.title}
                </Menu.LinkItem>
              ))}
            </Menu.Popup>
          </Menu.Root>
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">v2.1.0</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Changelog</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
