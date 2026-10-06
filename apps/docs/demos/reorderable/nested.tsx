"use client";

import * as React from "react";
import { Folder, Image, Type } from "lucide-react";
import { Reorderable } from "@forte-ui/react";

type Layer = { id: string; name: string; children?: Layer[] };

const LAYERS: Layer[] = [
  { id: "title", name: "Title" },
  {
    id: "card",
    name: "Card",
    children: [
      { id: "card-photo", name: "Photo" },
      { id: "card-heading", name: "Heading" },
      { id: "card-caption", name: "Caption" },
    ],
  },
  { id: "footer", name: "Footer" },
  { id: "background", name: "Background" },
];

const reorder = (list: Layer[], order: readonly string[]) => {
  const byId = new Map(list.map((layer) => [layer.id, layer]));
  return order.map((id) => byId.get(id)!);
};

const ROW = "flex items-center gap-2 rounded-2 py-1 ps-1 pe-3 text-2";
const ICON = "size-4 shrink-0 text-foreground-muted";

function Layers({ layers, onChange, label }: { layers: Layer[]; onChange: (next: Layer[]) => void; label: string }) {
  return (
    // Each list owns its own drag. A press inside the group's member list
    // belongs to that list, so dragging a member never moves the group —
    // and the group still drags as one row, members and all, by its grip.
    <Reorderable.Root
      aria-label={label}
      value={layers.map((layer) => layer.id)}
      onValueChange={(order) => onChange(reorder(layers, order))}
      className="flex flex-col gap-1"
    >
      {layers.map((layer) => (
        <Reorderable.Item key={layer.id} value={layer.id} label={layer.name} className="rounded-2">
          <div className={ROW}>
            <Reorderable.Handle />
            {layer.children ? (
              <Folder aria-hidden="true" className={ICON} />
            ) : layer.name === "Photo" ? (
              <Image aria-hidden="true" className={ICON} />
            ) : (
              <Type aria-hidden="true" className={ICON} />
            )}
            {layer.name}
          </div>
          {layer.children ? (
            <div className="ms-6 border-s border-border-muted ps-1 pb-1">
              <Layers
                label={`${layer.name} layers`}
                layers={layer.children}
                onChange={(children) =>
                  onChange(layers.map((l) => (l.id === layer.id ? { ...l, children } : l)))
                }
              />
            </div>
          ) : null}
        </Reorderable.Item>
      ))}
    </Reorderable.Root>
  );
}

export default function ReorderableNested() {
  const [layers, setLayers] = React.useState(LAYERS);
  return (
    <div className="w-full max-w-xs rounded-surface border border-border bg-panel p-1">
      <Layers label="Layers" layers={layers} onChange={setLayers} />
    </div>
  );
}
