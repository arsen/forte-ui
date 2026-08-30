"use client";

import * as React from "react";
import { Badge } from "@dofortech/forte-ui";

export default function BadgeCustom() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Squarer than the preset, and a heavier label. */}
      <Badge
        tone="primary"
        style={{
          "--forte-badge-radius": "var(--forte-radius-1)",
          "--forte-badge-font-weight": "var(--forte-font-weight-bold)",
        } as React.CSSProperties}
      >
        v0.4.0
      </Badge>

      {/* A dot that does not match the label. Both are still tokens. */}
      <Badge
        tone="neutral"
        variant="outline"
        dot
        style={{
          "--forte-badge-dot-color": "var(--forte-color-success)",
          "--forte-badge-dot-size": "0.625em",
        } as React.CSSProperties}
      >
        eu-west-1
      </Badge>

      {/* Roomier, without leaving the spacing scale. */}
      <Badge
        tone="info"
        size="lg"
        shape="pill"
        style={{
          "--forte-badge-padding-x": "var(--forte-space-4)",
        } as React.CSSProperties}
      >
        Preview build
      </Badge>
    </div>
  );
}
