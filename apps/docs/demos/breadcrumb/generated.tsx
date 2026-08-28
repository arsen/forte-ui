"use client";

import { Breadcrumb } from "@dofortech/pretty-ui";

/* The shape a real app writes: one array, one map. `React.Children.toArray`
 * flattens what a `.map()` returns, so the generated crumbs get their
 * separators exactly like hand-written ones — and a `null` crumb is dropped
 * before the count is taken, so a conditional crumb never leaves a separator
 * pointing at nothing. */
const TRAIL = [
  { title: "Workspace", href: "#workspace" },
  { title: "Projects", href: "#projects" },
  { title: "Apollo", href: "#apollo" },
  { title: "Settings", href: null },
];

export default function BreadcrumbGenerated() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {TRAIL.map((crumb) => (
          <Breadcrumb.Item key={crumb.title}>
            {crumb.href ? (
              <Breadcrumb.Link href={crumb.href}>{crumb.title}</Breadcrumb.Link>
            ) : (
              <Breadcrumb.Page>{crumb.title}</Breadcrumb.Page>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
