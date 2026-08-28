"use client";

import { Breadcrumb } from "@dofortech/pretty-ui";

/* No <Breadcrumb.Separator> anywhere: the list puts one between every pair of
 * children itself. The last crumb is a Page, not a Link — a link to the page
 * you are already on is a control that does nothing. */
export default function BreadcrumbBasic() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
