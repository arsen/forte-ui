"use client";

import * as React from "react";
import { Combobox } from "@dofortech/pretty-ui";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = Array.from({ length: 10000 }, (_, index) => {
  const id = String(index + 1);
  return { id, name: `Item ${id.padStart(5, "0")}` };
});

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

export default function ComboboxVirtualized() {
  const id = React.useId();
  const virtualizerRef = React.useRef<Virtualizer | null>(null);
  // State, not a ref: the popup (and the list inside it) mounts on open, and
  // the virtualizer has to re-render against the real scroll element then.
  const [listElement, setListElement] = React.useState<HTMLDivElement | null>(
    null,
  );

  return (
    <Combobox.Root
      // Tells Base UI the DOM holds only a window of the items, so highlight
      // and ARIA bookkeeping run on indexes instead of rendered elements.
      virtualized
      items={items}
      itemToStringLabel={(item: Item) => item.name}
      onItemHighlighted={(item, { reason, index }) => {
        const virtualizer = virtualizerRef.current;
        if (!item || !virtualizer) {
          return;
        }
        // Keyboard highlight can land on an index that is not rendered yet —
        // scroll it into the window ourselves.
        const isStart = index === 0;
        const isEnd = index === virtualizer.options.count - 1;
        if (reason === "none" || (reason === "keyboard" && (isStart || isEnd))) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(index, { align: isEnd ? "start" : "end" });
          });
        }
      }}
    >
      <div>
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Search 10,000 items
        </label>
        <Combobox.InputGroup>
          <Combobox.Input id={id} placeholder="e.g. 04213" />
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup>
        <Combobox.Empty>No items found.</Combobox.Empty>
        {/* The list is already the component's scroll container, so it is the
            element the virtualizer windows against — no inner scroller. */}
        <Combobox.List ref={setListElement} className="max-h-[20rem]">
          <VirtualizedItems
            scrollElement={listElement}
            virtualizerRef={virtualizerRef}
          />
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}

function VirtualizedItems({
  scrollElement,
  virtualizerRef,
}: {
  scrollElement: HTMLDivElement | null;
  virtualizerRef: React.RefObject<Virtualizer | null>;
}) {
  // The items Base UI's own filtering let through — this is what the
  // virtualizer measures, so typing re-windows the shortened list.
  const filteredItems = Combobox.useFilteredItems<Item>();

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 32,
    overscan: 20,
  });

  React.useImperativeHandle(virtualizerRef, () => virtualizer);

  if (!filteredItems.length) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const item = filteredItems[virtualItem.index];
        if (!item) {
          return null;
        }
        return (
          <Combobox.Item
            key={virtualItem.key}
            index={virtualItem.index}
            ref={virtualizer.measureElement}
            // `measureElement` reads the row's index back off the DOM node it
            // is handed, from `data-index` — it warns and measures nothing
            // without it. Two attributes for one number is not duplication:
            // `index` is what Base UI navigates and announces by, this is what
            // the virtualizer sizes by.
            data-index={virtualItem.index}
            value={item}
            aria-setsize={filteredItems.length}
            aria-posinset={virtualItem.index + 1}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {item.name}
          </Combobox.Item>
        );
      })}
    </div>
  );
}
