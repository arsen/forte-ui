"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NavList } from "@forte-ui/react";
import { routeKey } from "@/lib/route";

/**
 * The documentation page list, and the markup for it.
 *
 * It sits in its own module because two things render it: `Sidebar`, the left
 * rail on a wide screen, and `NavDrawer`, which is the same list on a screen
 * too narrow for a rail. A page added to one copy and not the other would be
 * unreachable on exactly one class of device — and on the class nobody
 * develops on.
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
      { title: "Introduction", href: "/" },
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
    items: [
      { title: "Accordion", href: "/components/accordion/" },
      { title: "Alert", href: "/components/alert/" },
      { title: "App Bar", href: "/components/app-bar/" },
      { title: "Aspect Ratio", href: "/components/aspect-ratio/" },
      { title: "Avatar", href: "/components/avatar/" },
      { title: "Badge", href: "/components/badge/" },
      { title: "Breadcrumb", href: "/components/breadcrumb/" },
      { title: "Button", href: "/components/button/" },
      { title: "Button Group", href: "/components/button-group/" },
      { title: "Calendar", href: "/components/calendar/" },
      { title: "Card", href: "/components/card/" },
      { title: "Checkbox", href: "/components/checkbox/" },
      { title: "Checkbox Group", href: "/components/checkbox-group/" },
      { title: "Collapsible", href: "/components/collapsible/" },
      { title: "Color Picker", href: "/components/color-picker/" },
      { title: "Combobox", href: "/components/combobox/" },
      { title: "Context Menu", href: "/components/context-menu/" },
      { title: "Date Picker", href: "/components/date-picker/" },
      { title: "Dialog", href: "/components/dialog/" },
      { title: "Drawer", href: "/components/drawer/" },
      { title: "Field", href: "/components/field/" },
      { title: "Fieldset", href: "/components/fieldset/" },
      { title: "Form", href: "/components/form/" },
      { title: "Input", href: "/components/input/" },
      { title: "Input Group", href: "/components/input-group/" },
      { title: "Kbd", href: "/components/kbd/" },
      { title: "Menu", href: "/components/menu/" },
      { title: "Menubar", href: "/components/menubar/" },
      { title: "Nav List", href: "/components/nav-list/" },
      { title: "Navigation Menu", href: "/components/navigation-menu/" },
      { title: "Number Field", href: "/components/number-field/" },
      { title: "OTP Field", href: "/components/otp-field/" },
      { title: "Popover", href: "/components/popover/" },
      { title: "Preview Card", href: "/components/preview-card/" },
      { title: "Progress", href: "/components/progress/" },
      { title: "Radio", href: "/components/radio/" },
      { title: "Resizable", href: "/components/resizable/" },
      { title: "Scroll Area", href: "/components/scroll-area/" },
      { title: "Select", href: "/components/select/" },
      { title: "Separator", href: "/components/separator/" },
      { title: "Skeleton", href: "/components/skeleton/" },
      { title: "Slider", href: "/components/slider/" },
      { title: "Spinner", href: "/components/spinner/" },
      { title: "Switch", href: "/components/switch/" },
      { title: "Tabs", href: "/components/tabs/" },
      { title: "Textarea", href: "/components/textarea/" },
      { title: "Theme Toggle", href: "/components/theme-toggle/" },
      { title: "Toast", href: "/components/toast/" },
      { title: "Toggle", href: "/components/toggle/" },
      { title: "Toggle Group", href: "/components/toggle-group/" },
      { title: "Toolbar", href: "/components/toolbar/" },
      { title: "Tooltip", href: "/components/tooltip/" },
    ],
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
