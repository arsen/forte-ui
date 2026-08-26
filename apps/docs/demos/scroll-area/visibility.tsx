"use client";

import { ScrollArea } from "@dofortech/pretty-ui";

const LINES = Array.from({ length: 12 }, (_, i) => `Row ${i + 1}`);

export default function ScrollAreaVisibility() {
  return (
    <ScrollArea.Root
      fade={false}
      scrollbarVisibility="always"
      style={{ maxHeight: "11rem", width: "min(22rem, 100%)" }}
    >
      <ScrollArea.Viewport aria-label="Rows">
        <ScrollArea.Content style={{ paddingInlineEnd: "var(--pui-space-4)" }}>
          <div style={{ display: "grid", gap: "var(--pui-space-2)" }}>
            {LINES.map((line) => (
              <p key={line} style={{ margin: 0 }}>
                {line}
              </p>
            ))}
          </div>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
