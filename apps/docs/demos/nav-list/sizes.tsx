"use client";

import { NavList, type NavListSize } from "@dofortech/forte-ui";

const SIZES: NavListSize[] = ["sm", "md", "lg"];

export default function NavListSizes() {
  return (
    <div className="flex flex-wrap gap-8">
      {SIZES.map((size) => (
        <NavList.Root key={size} aria-label={`Library (${size})`} size={size} className="w-44">
          <NavList.Section>
            <NavList.SectionLabel>{size}</NavList.SectionLabel>
            <NavList.List>
              <NavList.Item>
                <NavList.Link href="#" onClick={(e) => e.preventDefault()} active>
                  Inbox
                </NavList.Link>
              </NavList.Item>
              <NavList.Item>
                <NavList.Link href="#" onClick={(e) => e.preventDefault()}>
                  Drafts
                </NavList.Link>
              </NavList.Item>
              <NavList.Item>
                <NavList.Link href="#" onClick={(e) => e.preventDefault()}>
                  Archive
                </NavList.Link>
              </NavList.Item>
            </NavList.List>
          </NavList.Section>
        </NavList.Root>
      ))}
    </div>
  );
}
