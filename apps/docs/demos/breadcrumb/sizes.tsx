"use client";

import { Breadcrumb, type BreadcrumbSize } from "@dofortech/pretty-ui";

const SIZES: BreadcrumbSize[] = ["sm", "md", "lg"];

/* One prop on the root. The separator is sized in `em`, so it tracks the text
 * instead of needing a scale of its own. */
export default function BreadcrumbSizes() {
  return (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <Breadcrumb.Root key={size} size={size}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Library</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Data</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      ))}
    </div>
  );
}
