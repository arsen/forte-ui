"use client";

import { Badge } from "@dofortech/forte-ui";

export default function BadgeBasic() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Beta</Badge>
      <Badge tone="success" dot>
        Active
      </Badge>
      <Badge tone="warning" dot>
        Degraded
      </Badge>
      <Badge tone="danger" variant="solid">
        Failed
      </Badge>
      <Badge tone="neutral" variant="outline">
        Draft
      </Badge>
      <Badge tone="danger" variant="solid" shape="pill" count={12} />
    </div>
  );
}
