"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { EYEBROW, NAV_LINK, NAV_LINK_ACTIVE, STICKY_COLUMN } from "./styles";

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
    title: "Components",
    items: [
      { title: "Accordion", href: "/components/accordion" },
      { title: "Button", href: "/components/button" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Collapsible", href: "/components/collapsible" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Drawer", href: "/components/drawer" },
      { title: "Field", href: "/components/field" },
      { title: "Fieldset", href: "/components/fieldset" },
      { title: "Form", href: "/components/form" },
      { title: "Input", href: "/components/input" },
      { title: "Radio", href: "/components/radio" },
      { title: "Scroll Area", href: "/components/scroll-area" },
      { title: "Select", href: "/components/select" },
      { title: "Separator", href: "/components/separator" },
      { title: "Slider", href: "/components/slider" },
      { title: "Spinner", href: "/components/spinner" },
      { title: "Switch", href: "/components/switch" },
      { title: "Tabs", href: "/components/tabs" },
      { title: "Toggle", href: "/components/toggle" },
      { title: "Toggle Group", href: "/components/toggle-group" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={cn(STICKY_COLUMN, "max-nav:hidden")}>
      {/* The gap replaces the old `.navGroup + .navGroup` margin — same result,
        * and it survives a group being added or reordered. */}
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
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
