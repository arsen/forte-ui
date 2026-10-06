"use client";

import * as React from "react";
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Ellipsis } from "lucide-react";
import { Button, Menu, Reorderable } from "@forte-ui/react";

/* A layers panel: top-most first, the shape of the request that started this
 * component. Each row holds a thumbnail, a name, a "⋯" menu and a grip. */
const LAYERS = [
  { id: "headline", name: "Headline", swatch: "bg-primary" },
  { id: "button", name: "Call to action", swatch: "bg-secondary" },
  { id: "badge", name: "Badge", swatch: "bg-warning" },
  { id: "photo", name: "Photo", swatch: "bg-success" },
  { id: "background", name: "Background", swatch: "bg-accent-4" },
];

type Layer = (typeof LAYERS)[number];

function moveTo(list: Layer[], id: string, to: number) {
  const from = list.findIndex((layer) => layer.id === id);
  const next = list.slice();
  const [layer] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, list.length - 1)), 0, layer!);
  return next;
}

export default function ReorderableLayers() {
  const [layers, setLayers] = React.useState(LAYERS);
  const move = (id: string, to: number) => setLayers((list) => moveTo(list, id, to));

  return (
    <Reorderable.Root
      aria-label="Layers"
      value={layers.map((layer) => layer.id)}
      onValueChange={(order) => {
        const byId = new Map(layers.map((layer) => [layer.id, layer]));
        setLayers(order.map((id) => byId.get(id)!));
      }}
      className="flex w-full max-w-xs flex-col gap-1 rounded-surface border border-border bg-panel p-1"
    >
      {layers.map((layer, index) => (
        <Reorderable.Item
          key={layer.id}
          value={layer.id}
          label={layer.name}
          // A mouse drags from anywhere on the row — the menu button excepted,
          // since a press on a control is always the control's.
          className="flex items-center gap-2 rounded-2 py-1 ps-1 pe-1 text-2 hover:bg-panel-hover"
        >
          <Reorderable.Handle />
          <span aria-hidden="true" className={`size-5 shrink-0 rounded-1 ${layer.swatch}`} />
          <span className="min-w-0 flex-1 truncate">{layer.name}</span>
          {/* The single-pointer route to the same moves (WCAG 2.5.7): a drag
            * is a gesture some people cannot make, and a keyboard is not
            * what a switch or a head pointer sends. */}
          <Menu.Root>
            <Menu.Trigger
              render={<Button variant="ghost" size="sm" iconOnly />}
              aria-label={`${layer.name} actions`}
            >
              <Ellipsis aria-hidden="true" />
            </Menu.Trigger>
            <Menu.Popup>
              <Menu.Item disabled={index === 0} onClick={() => move(layer.id, 0)}>
                <ArrowUpToLine aria-hidden="true" />
                Bring to front
              </Menu.Item>
              <Menu.Item disabled={index === 0} onClick={() => move(layer.id, index - 1)}>
                <ChevronUp aria-hidden="true" />
                Bring forward
              </Menu.Item>
              <Menu.Item disabled={index === layers.length - 1} onClick={() => move(layer.id, index + 1)}>
                <ChevronDown aria-hidden="true" />
                Send backward
              </Menu.Item>
              <Menu.Item
                disabled={index === layers.length - 1}
                onClick={() => move(layer.id, layers.length - 1)}
              >
                <ArrowDownToLine aria-hidden="true" />
                Send to back
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        </Reorderable.Item>
      ))}
    </Reorderable.Root>
  );
}
