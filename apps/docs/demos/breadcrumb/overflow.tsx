"use client";

import { Breadcrumb, type BreadcrumbOverflow } from "@dofortech/pretty-ui";

const TRAIL = [
  "Workspace",
  "Engineering",
  "Platform services",
  "Ingest pipeline",
  "Configuration",
];

/* Both trails are in the same 20rem column, which is narrower than either one
 * needs. `wrap` runs onto a second line; `scroll` puts the row in a ScrollArea
 * and starts it scrolled to the END — the leading crumbs fade out under the
 * mask, and dragging or swiping brings them back. The end of a trail is the
 * part a reader needs, and it is the part that falls off the edge. */
function Trail({ overflow }: { overflow: BreadcrumbOverflow }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-1 text-foreground-subtle">
        overflow=&quot;{overflow}&quot;
      </span>
      <div className="w-full max-w-xs rounded-2 border border-border-muted p-2">
        <Breadcrumb.Root overflow={overflow}>
          <Breadcrumb.List>
            {TRAIL.map((title, index) => (
              <Breadcrumb.Item key={title}>
                {index === TRAIL.length - 1 ? (
                  <Breadcrumb.Page>{title}</Breadcrumb.Page>
                ) : (
                  <Breadcrumb.Link href="#">{title}</Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </div>
  );
}

export default function BreadcrumbOverflow() {
  return (
    <div className="flex flex-col gap-4">
      <Trail overflow="wrap" />
      <Trail overflow="scroll" />
    </div>
  );
}
