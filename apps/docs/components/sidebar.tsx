"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

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
      { title: "Scroll Area", href: "/components/scroll-area" },
      { title: "Select", href: "/components/select" },
      { title: "Separator", href: "/components/separator" },
      { title: "Slider", href: "/components/slider" },
      { title: "Switch", href: "/components/switch" },
      { title: "Tabs", href: "/components/tabs" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav aria-label="Documentation">
        {NAV.map((group) => (
          <div key={group.title} className="navGroup">
            <p className="navGroupTitle">{group.title}</p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "navLink navLinkActive" : "navLink"}
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
