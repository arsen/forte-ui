"use client";

import type { ReactNode } from "react";
import { Breadcrumb } from "@forte-ui/react";
import { ChevronsRight } from "lucide-react";

const CRUMBS = ["Home", "Docs", "Breadcrumb"];

/* `separator` is set once on the root and every gap uses it. A text separator
 * is NOT mirrored in RTL — only the default chevron is, because mirroring a
 * glyph would turn a slash into a backslash. */
function Trail({ separator }: { separator?: ReactNode }) {
  return (
    <Breadcrumb.Root separator={separator}>
      <Breadcrumb.List>
        {CRUMBS.map((title, index) => (
          <Breadcrumb.Item key={title}>
            {index === CRUMBS.length - 1 ? (
              <Breadcrumb.Page>{title}</Breadcrumb.Page>
            ) : (
              <Breadcrumb.Link href="#">{title}</Breadcrumb.Link>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

export default function BreadcrumbSeparators() {
  return (
    <div className="flex flex-col gap-4">
      <Trail />
      <Trail separator="/" />
      <Trail separator="·" />
      <Trail separator={<ChevronsRight className="size-3 shrink-0" aria-hidden />} />
    </div>
  );
}
