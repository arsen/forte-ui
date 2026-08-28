"use client";

import { Breadcrumb, type BreadcrumbVariant } from "@dofortech/pretty-ui";

const VARIANTS: BreadcrumbVariant[] = ["plain", "chip"];

/* `plain` is text with a hover underline — the trail above a document.
 * `chip` gives every crumb a rounded fill, which is what holds up when the
 * trail sits on a toolbar rather than on the page background. */
export default function BreadcrumbVariants() {
  return (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="font-mono text-1 text-foreground-subtle">{variant}</span>
          <Breadcrumb.Root variant={variant}>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#">Billing</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>Invoices</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
      ))}
    </div>
  );
}
