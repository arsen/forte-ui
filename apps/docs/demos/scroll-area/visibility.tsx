"use client";

import { ScrollArea } from "@forte-ui/react";

const LINES = Array.from({ length: 12 }, (_, i) => `Row ${i + 1}`);

export default function ScrollAreaVisibility() {
  return (
    <ScrollArea.Root
      fade={false}
      scrollbarVisibility="always"
      orientation="vertical"
      className="max-h-[11rem] w-full max-w-[22rem]"
    >
      <ScrollArea.Viewport aria-label="Rows">
        <ScrollArea.Content className="pe-4">
          <div className="grid gap-2">
            {LINES.map((line) => (
              <p key={line} className="m-0">
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
