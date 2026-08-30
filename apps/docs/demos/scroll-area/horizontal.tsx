"use client";

import { ScrollArea } from "@dofortech/forte-ui";

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
    <ScrollArea.Root className="w-full max-w-[30rem]">
      <ScrollArea.Viewport aria-label="Deployment regions">
        <ScrollArea.Content className="pb-4">
          <div className="flex gap-3">
            {REGIONS.map(([id, city]) => (
              <div
                key={id}
                className="w-[9rem] flex-none rounded-surface bg-panel p-4"
              >
                <p className="m-0 font-medium">{city}</p>
                <p className="m-0 font-mono text-1 text-foreground-muted">
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
