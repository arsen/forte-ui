"use client";

import { Separator } from "@dofortech/pretty-ui";

export default function SeparatorHorizontal() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-4)",
        inlineSize: "min(30rem, 100%)",
      }}
    >
      <section>
        <h3 style={{ margin: 0, fontSize: "var(--pui-font-size-3)" }}>Billing</h3>
        <p style={{ margin: "var(--pui-space-1) 0 0", color: "var(--pui-color-foreground-muted)" }}>
          Visa ending 4242 · renews 1 September
        </p>
      </section>

      <Separator />

      <section>
        <h3 style={{ margin: 0, fontSize: "var(--pui-font-size-3)" }}>Notifications</h3>
        <p style={{ margin: "var(--pui-space-1) 0 0", color: "var(--pui-color-foreground-muted)" }}>
          Email only · digest at 09:00
        </p>
      </section>
    </div>
  );
}
