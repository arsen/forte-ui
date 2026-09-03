"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NavList } from "@forte-ui/react";
import { routeKey } from "@/lib/route";
import { COMPONENT_PAGES } from "./component-catalog";

/**
 * The documentation page list, and the markup for it.
 *
 * It sits in its own module because two things render it: `Sidebar`, the left
 * rail on a wide screen, and `NavDrawer`, which is the same list on a screen
 * too narrow for a rail. A page added to one copy and not the other would be
 * unreachable on exactly one class of device — and on the class nobody
 * develops on.
 *
 * The Components group is not written here. It is spread in from
 * `component-catalog.ts`, which `scripts/build-catalog.mjs` generates from the
 * library's `@summary` / `@category` doc comments — so adding a component to
 * the package adds it to both navigations, and a page with no component behind
 * it (or a component with no page) fails the build rather than quietly
 * appearing, or quietly not.
 *
 * Only ONE of the two is ever in the accessibility tree, which is why both can
 * carry the same `aria-label`: the rail is `display: none` below
 * `--breakpoint-nav` (and `display: none` removes a subtree from the tree, not
 * just from paint), and the drawer's trigger is hidden above it, so the drawer
 * cannot be opened at a width where the rail exists.
 */

type NavItem = { title: string; href: string; badge?: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/getting-started/introduction/" },
      { title: "Next.js", href: "/getting-started/nextjs/" },
      { title: "Vite", href: "/getting-started/vite/" },
      { title: "AI agents", href: "/getting-started/ai-agents/" },
      { title: "Theme Studio", href: "/theme/" },
    ],
  },
  {
    title: "Customization",
    items: [
      { title: "Theming", href: "/customization/theming/" },
      { title: "Presets", href: "/customization/presets/" },
      { title: "Design tokens", href: "/customization/tokens/" },
      { title: "Styling components", href: "/customization/styling/" },
      { title: "Tailwind", href: "/customization/tailwind/" },
    ],
  },
  {
    title: "Components",
    /* Every row below the first is GENERATED — `COMPONENT_PAGES` comes from
     * `scripts/build-catalog.mjs`, which resolves the library's own catalog
     * to the pages on this site and fails the build if the two disagree in
     * either direction. These fifty-six titles were typed out here until then,
     * and the derived ones came out identical to the last character, which is
     * the only reason the swap was safe to make in one go.
     *
     * Overview is hand-written because it is not a component: it is the index
     * those rows point into, and it belongs at the top of the group rather
     * than alphabetised among them. */
    items: [{ title: "Overview", href: "/components/" }, ...COMPONENT_PAGES],
  },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    /* Which row is current is this component's call, not NavList's — the
     * library deliberately does not read a router. `render` swaps the row's
     * <a> for the framework Link so client-side navigation is kept.
     *
     * `revealActive` because both homes of this list scroll: the rail is its
     * own `overflow-y: auto` column, so a page load would otherwise start it
     * back at the top with the current page fifty rows below the fold, and
     * the drawer re-earns the problem on every open by unmounting on close. */
    <NavList.Root aria-label="Documentation" revealActive>
      {NAV.map((group) => (
        <NavList.Section key={group.title}>
          <NavList.SectionLabel>{group.title}</NavList.SectionLabel>
          <NavList.List>
            {group.items.map((item) => (
              <NavList.Item key={item.href}>
                <NavList.Link
                  render={<Link href={item.href} />}
                  active={routeKey(pathname) === routeKey(item.href)}
                  onClick={onNavigate}
                >
                  {item.title}
                  {item.badge && <NavList.Badge>{item.badge}</NavList.Badge>}
                </NavList.Link>
              </NavList.Item>
            ))}
          </NavList.List>
        </NavList.Section>
      ))}
    </NavList.Root>
  );
}
