"use client";

import { Breadcrumb } from "@forte-ui/react";
import { FileText, Folder, House } from "lucide-react";

/* Crumbs are flex, so an svg goes in as a plain child. The stylesheet sizes a
 * direct-child svg at `1em` and it rides `currentColor`, so an icon follows
 * the size preset and the hover color without a class.
 *
 * The first crumb is icon-only, so it needs a name of its own — the visually
 * hidden span is what a screen reader reads, and the title is what a pointer
 * user gets from the tooltip the browser draws. */
export default function BreadcrumbIcons() {
  return (
    <Breadcrumb.Root variant="chip">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#" title="Home">
            <House aria-hidden />
            <span className="forte-visually-hidden">Home</span>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">
            <Folder aria-hidden />
            Reports
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>
            <FileText aria-hidden />
            Q3 revenue
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
