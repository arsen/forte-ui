"use client";

import { Spinner } from "@dofortech/pretty-ui";

const TONES = ["primary", "secondary", "danger", "neutral"] as const;

export default function SpinnerTones() {
  return (
    <div style={{ display: "grid", gap: "var(--pui-space-5)" }}>
      <div style={{ display: "flex", gap: "var(--pui-space-5)", alignItems: "center" }}>
        {TONES.map((tone) => (
          <div
            key={tone}
            style={{ display: "grid", justifyItems: "center", gap: "var(--pui-space-2)" }}
          >
            <Spinner tone={tone} size="lg" decorative />
            <code
              style={{ fontFamily: "var(--pui-font-mono)", fontSize: "var(--pui-font-size-1)" }}
            >
              {tone}
            </code>
          </div>
        ))}
      </div>

      {/* `current` takes whatever colour it lands in, which is what makes it
       * the one to reach for inside another control. Both lines below use the
       * same markup — only the surrounding `color` differs. */}
      <div style={{ display: "grid", gap: "var(--pui-space-3)" }}>
        {[
          { label: "inside muted text", color: "var(--pui-color-foreground-muted)" },
          { label: "inside a danger message", color: "var(--pui-color-danger-text)" },
        ].map(({ label, color }) => (
          <p
            key={label}
            style={{
              margin: 0,
              color,
              display: "flex",
              alignItems: "center",
              gap: "var(--pui-space-2)",
              fontSize: "var(--pui-font-size-2)",
            }}
          >
            <Spinner variant="dots" tone="current" size="sm" decorative />
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}
