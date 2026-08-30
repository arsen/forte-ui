"use client";

import { Badge } from "@dofortech/forte-ui";

const TAGS = ["css", "accessibility", "base-ui", "tokens"];

/* Nothing here says "interactive". The styles read the rendered element, so
 * an `<a href>` and a `<button>` get the pointer cursor, the hover wash and a
 * 24×24 hit target, while the plain badge below stays a label. */
export default function BadgeLinks() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {TAGS.map((tag) => (
          <Badge
            key={tag}
            tone="neutral"
            variant="outline"
            shape="pill"
            render={<a href={`#${tag}`} />}
          >
            #{tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary" variant="soft" render={<button type="button" />}>
          Add label
        </Badge>
        <Badge tone="primary" variant="soft">
          Not a button
        </Badge>
      </div>
    </div>
  );
}
