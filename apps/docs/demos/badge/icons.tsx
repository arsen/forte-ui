"use client";

import { Badge } from "@dofortech/forte-ui";
import { Check, GitPullRequest, Lock, Sparkles, TriangleAlert } from "lucide-react";

/* No size class on any of these: the badge sizes an `svg` child at `1em`, so
 * an icon tracks the label through every `size` on its own. `aria-hidden`
 * because the word beside it already says what it means. */
export default function BadgeIcons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="success" variant="soft">
        <Check aria-hidden />
        Merged
      </Badge>
      <Badge tone="primary" variant="soft">
        <GitPullRequest aria-hidden />
        In review
      </Badge>
      <Badge tone="warning" variant="soft">
        <TriangleAlert aria-hidden />
        Conflicts
      </Badge>
      <Badge tone="neutral" variant="outline">
        <Lock aria-hidden />
        Private
      </Badge>
      <Badge tone="secondary" variant="solid" size="lg">
        <Sparkles aria-hidden />
        New
      </Badge>
    </div>
  );
}
