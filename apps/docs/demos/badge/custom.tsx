"use client";

import * as React from "react";
import { Badge } from "@dofortech/pretty-ui";

export default function BadgeCustom() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Squarer than the preset, and a heavier label. */}
      <Badge
        tone="primary"
        style={{
          "--pui-badge-radius": "var(--pui-radius-1)",
          "--pui-badge-font-weight": "var(--pui-font-weight-bold)",
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
          "--pui-badge-dot-color": "var(--pui-color-success)",
          "--pui-badge-dot-size": "0.625em",
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
          "--pui-badge-padding-x": "var(--pui-space-4)",
        } as React.CSSProperties}
      >
        Preview build
      </Badge>
    </div>
  );
}
