"use client";

import { ScrollArea } from "@dofortech/pretty-ui";

const REGIONS = [
  ["us-east-1", "N. Virginia"],
  ["us-west-2", "Oregon"],
  ["eu-west-1", "Ireland"],
  ["eu-central-1", "Frankfurt"],
  ["ap-south-1", "Mumbai"],
  ["ap-northeast-1", "Tokyo"],
  ["sa-east-1", "São Paulo"],
];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea.Root style={{ width: "min(30rem, 100%)" }}>
      <ScrollArea.Viewport aria-label="Deployment regions">
        <ScrollArea.Content style={{ paddingBlockEnd: "var(--pui-space-4)" }}>
          <div style={{ display: "flex", gap: "var(--pui-space-3)" }}>
            {REGIONS.map(([id, city]) => (
              <div
                key={id}
                style={{
                  flex: "0 0 auto",
                  width: "9rem",
                  padding: "var(--pui-space-4)",
                  borderRadius: "var(--pui-radius-surface)",
                  backgroundColor: "var(--pui-color-panel)",
                }}
              >
                <p style={{ margin: 0, fontWeight: "var(--pui-font-weight-medium)" }}>{city}</p>
                <p
                  style={{
                    margin: 0,
                    color: "var(--pui-color-foreground-muted)",
                    fontFamily: "var(--pui-font-mono)",
                    fontSize: "var(--pui-font-size-1)",
                  }}
                >
                  {id}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
