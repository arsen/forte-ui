"use client";

import * as React from "react";
import { Reorderable, ScrollArea } from "@forte-ui/react";

const TRACKS = Array.from({ length: 100 }, (_, i) => ({
  id: `track-${i + 1}`,
  name: `Track ${String(i + 1).padStart(3, "0")}`,
}));

type Track = (typeof TRACKS)[number];

function Row({ track }: { track: Track }) {
  return (
    <>
      <span className="w-8 shrink-0 text-1 text-foreground-subtle tabular-nums">
        {track.id.replace("track-", "#")}
      </span>
      <span className="min-w-0 flex-1 truncate">{track.name}</span>
    </>
  );
}

const ROW = "flex items-center gap-2 px-3 py-2 text-2";

export default function ReorderableScrollArea() {
  const [tracks, setTracks] = React.useState(TRACKS);

  return (
    <ScrollArea.Root orientation="vertical" className="h-72 w-full max-w-xs rounded-surface border border-border bg-panel">
      <ScrollArea.Viewport aria-label="Queue">
        <Reorderable.Root
          aria-label="Queue"
          value={tracks.map((track) => track.id)}
          onValueChange={(order) => {
            const byId = new Map(tracks.map((track) => [track.id, track]));
            setTracks(order.map((id) => byId.get(id)!));
          }}
          className="divide-y divide-border-muted"
        >
          {tracks.map((track) => (
            <Reorderable.Item key={track.id} value={track.id} label={track.name} className={ROW}>
              <Row track={track} />
            </Reorderable.Item>
          ))}
          {/* The copy under the pointer is portalled out of the viewport, so
            * the edge fade and the clipping never cut it off while the list
            * auto-scrolls under it. The row stays behind, faded, to show
            * where the drop will land. */}
          <Reorderable.Preview className={ROW}>
            {(id) => <Row track={tracks.find((track) => track.id === id)!} />}
          </Reorderable.Preview>
        </Reorderable.Root>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
