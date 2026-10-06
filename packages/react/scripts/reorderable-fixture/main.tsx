/*
 * The page check-reorderable.mjs loads: ONE list, configured by the query
 * string, so the script can walk every case without a build per case.
 *
 *   count        how many items (default 5; letters A… up to 26, then I0…)
 *   orientation  horizontal → a row of chips
 *   dir          rtl → a right-to-left document
 *   handles      1 → every item gets a Reorderable.Handle
 *   controls     1 → every row also holds a Button and a Menu trigger
 *   contextmenu  1 → every row is a ContextMenu.Trigger
 *   nested       1 → item B holds an inner list of its own
 *   scroll       1 → the list lives in a 300px ScrollArea
 *   preview      1 → a Reorderable.Preview follows the pointer
 *   disabled     an item id → that item is disabled
 *   handleOnly   1 → the mouse needs the handle too
 *   ignore       1 → onValueChange is logged but never applied
 *
 * Everything the list reports goes into `window.__log`, in order; rows log
 * their clicks and the announcer's text is logged as it changes, so the
 * script asserts on behavior, not on implementation. `window.__fx` lets the
 * script change the list from outside mid-drag, the way another user would.
 *
 * The real component from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { Reorderable, type ReorderableValue } from "../../src/components/reorderable";
import { ScrollArea } from "../../src/components/scroll-area";
import { Menu } from "../../src/components/menu";
import { ContextMenu } from "../../src/components/context-menu";
import { Button } from "../../src/components/button";

type Entry = { type: string } & Record<string, unknown>;

declare global {
  interface Window {
    __log: Entry[];
    __fx: {
      remove: (id: string) => void;
      insertTop: (id: string) => void;
      ids: () => string[];
    };
  }
}

const params = new URLSearchParams(location.search);
const flag = (key: string) => params.get(key) === "1";
const count = Number(params.get("count") ?? 5);
const horizontal = params.get("orientation") === "horizontal";
document.documentElement.dir = params.get("dir") === "rtl" ? "rtl" : "ltr";

window.__log = [];
const push = (type: string, data: Record<string, unknown> = {}) => window.__log.push({ type, ...data });

/* Registered before anything renders, so it is the FIRST document listener —
 * the case where a handler on the root container would run after it. */
document.addEventListener("keydown", (event) => {
  push("doc-key", { key: event.key, prevented: event.defaultPrevented });
});
window.addEventListener("keydown", (event) => {
  push("win-key", { key: event.key, prevented: event.defaultPrevented });
});

new MutationObserver(() => {
  const live = document.querySelector('[data-forte="reorderable-announcer"]');
  const text = live?.textContent ?? "";
  if (text) push("announce", { text });
}).observe(document.body, { subtree: true, childList: true, characterData: true });

const ids = (n: number, prefix = "") =>
  Array.from({ length: n }, (_, i) => (n <= 26 ? prefix + String.fromCharCode(65 + i) : `${prefix}I${i}`));

const rowStyle: React.CSSProperties = horizontal
  ? { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #ccc", marginInlineEnd: 8 }
  : { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid #ddd" };

function RowContent({ id }: { id: string }) {
  return (
    <>
      {flag("handles") ? <Reorderable.Handle data-testid={`handle-${id}`} /> : null}
      <span data-testid={`text-${id}`} style={{ flex: 1 }}>
        Item {id}
      </span>
      {flag("controls") ? (
        <>
          <Button size="sm" variant="outline" data-testid={`button-${id}`} onClick={() => push("button", { id })}>
            Rename
          </Button>
          <Menu.Root modal={false} onOpenChange={(open) => push("menu", { id, open })}>
            <Menu.Trigger data-testid={`menu-${id}`} aria-label={`More for ${id}`}>
              ⋯
            </Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Duplicate</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        </>
      ) : null}
    </>
  );
}

function List({ name, initial, depth = 0 }: { name: string; initial: string[]; depth?: number }) {
  const [order, setOrder] = React.useState(initial);
  if (depth === 0) {
    window.__fx = {
      remove: (id) => setOrder((current) => current.filter((x) => x !== id)),
      insertTop: (id) => setOrder((current) => [id, ...current]),
      ids: () => order,
    };
  }
  return (
    <Reorderable.Root
      data-testid={`list-${name}`}
      value={order}
      orientation={horizontal ? "horizontal" : "vertical"}
      handleOnly={flag("handleOnly")}
      style={horizontal ? undefined : { width: 320 }}
      onValueChange={(next, d) => {
        push("change", {
          list: name,
          next,
          id: d.id,
          overId: d.overId,
          placement: d.placement,
          from: d.from,
          to: d.to,
          pointerType: d.pointerType,
        });
        if (!flag("ignore")) setOrder(next as string[]);
      }}
      onDragStart={(d) => push("start", { list: name, id: d.id, from: d.from, pointerType: d.pointerType })}
      onDragEnd={(d) => push("end", { list: name, id: d.id, from: d.from, to: d.to })}
      onDragCancel={(d) => push("cancel", { list: name, id: d.id, reason: d.reason })}
    >
      {order.map((id: ReorderableValue) => {
        const key = String(id);
        const row = (
          <div style={rowStyle}>
            <RowContent id={key} />
          </div>
        );
        return (
          <Reorderable.Item
            key={key}
            value={key}
            label={`Item ${key}`}
            data-id={key}
            disabled={params.get("disabled") === key}
            onClick={() => push("click", { id: key })}
          >
            {flag("contextmenu") ? (
              <ContextMenu.Root onOpenChange={(open) => push("context", { id: key, open })}>
                <ContextMenu.Trigger>{row}</ContextMenu.Trigger>
                <ContextMenu.Popup>
                  <ContextMenu.Item>Delete</ContextMenu.Item>
                </ContextMenu.Popup>
              </ContextMenu.Root>
            ) : (
              row
            )}
            {flag("nested") && depth === 0 && key === "B" ? (
              <div style={{ paddingInlineStart: 24 }}>
                <List name="inner" initial={ids(3, "B")} depth={1} />
              </div>
            ) : null}
          </Reorderable.Item>
        );
      })}
      {flag("preview") ? (
        <Reorderable.Preview>
          {(id) => (
            <div style={rowStyle} data-testid="preview-content">
              Item {String(id)}
            </div>
          )}
        </Reorderable.Preview>
      ) : null}
    </Reorderable.Root>
  );
}

function App() {
  const list = <List name="outer" initial={ids(count)} />;
  if (!flag("scroll")) return <div style={{ padding: 16 }}>{list}</div>;
  return (
    <div style={{ padding: 16 }}>
      <ScrollArea.Root style={{ height: 300, width: 340 }}>
        <ScrollArea.Viewport data-testid="viewport" aria-label="Items">
          {list}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
