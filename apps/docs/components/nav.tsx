"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { EYEBROW, NAV_LINK, NAV_LINK_ACTIVE } from "./styles";

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
      { title: "Theme Studio", href: "/theme" },
    ],
  },
  {
    title: "Customization",
    items: [
      { title: "Theming", href: "/customization/theming" },
      { title: "Presets", href: "/customization/presets" },
      { title: "Design tokens", href: "/customization/tokens" },
      { title: "Styling components", href: "/customization/styling" },
      { title: "Tailwind", href: "/customization/tailwind" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Accordion", href: "/components/accordion" },
      { title: "Avatar", href: "/components/avatar" },
      { title: "Button", href: "/components/button" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Checkbox Group", href: "/components/checkbox-group" },
      { title: "Collapsible", href: "/components/collapsible" },
      { title: "Color Picker", href: "/components/color-picker" },
      { title: "Context Menu", href: "/components/context-menu" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Drawer", href: "/components/drawer" },
      { title: "Field", href: "/components/field" },
      { title: "Fieldset", href: "/components/fieldset" },
      { title: "Form", href: "/components/form" },
      { title: "Input", href: "/components/input" },
      { title: "Menu", href: "/components/menu" },
      { title: "Number Field", href: "/components/number-field" },
      { title: "OTP Field", href: "/components/otp-field" },
      { title: "Popover", href: "/components/popover" },
      { title: "Preview Card", href: "/components/preview-card" },
      { title: "Progress", href: "/components/progress" },
      { title: "Radio", href: "/components/radio" },
      { title: "Scroll Area", href: "/components/scroll-area" },
      { title: "Select", href: "/components/select" },
      { title: "Separator", href: "/components/separator" },
      { title: "Slider", href: "/components/slider" },
      { title: "Spinner", href: "/components/spinner" },
      { title: "Switch", href: "/components/switch" },
      { title: "Tabs", href: "/components/tabs" },
      { title: "Textarea", href: "/components/textarea" },
      { title: "Toast", href: "/components/toast" },
      { title: "Toggle", href: "/components/toggle" },
      { title: "Toggle Group", href: "/components/toggle-group" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    /* The gap replaces the old `.navGroup + .navGroup` margin — same result,
     * and it survives a group being added or reordered. */
    <nav aria-label="Documentation" className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.title}>
          <p className={cn(EYEBROW, "mt-0 mb-2 px-2")}>{group.title}</p>
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(NAV_LINK, "font-medium", active && NAV_LINK_ACTIVE)}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
