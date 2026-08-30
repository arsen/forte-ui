"use client";

import { Resizable } from "@dofortech/forte-ui";

const ITEMS = [
  { icon: "◫", label: "Files" },
  { icon: "⌕", label: "Search" },
  { icon: "⎇", label: "Branches" },
];

/* `collapsedSize` does not have to be zero. A collapsed panel that keeps a
 * `56px` rail is the editor-sidebar pattern: the icons stay reachable, so the
 * panel is never hidden from assistive technology and never made inert. */
export default function ResizableIconRail() {
  return (
    <Resizable.Group
      orientation="horizontal"
      className="h-52 w-full max-w-2xl overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={32} minSize="180px" collapsible collapsedSize="56px">
        <ul className="m-0 flex h-full list-none flex-col gap-1 p-2">
          {ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3 rounded-2 px-3 py-2 text-2 text-foreground-muted"
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-center">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel>
        <div className="h-full p-4 text-2 text-foreground-muted">
          Drag the divider all the way left: the sidebar stops at the rail rather than disappearing.
        </div>
      </Resizable.Panel>
    </Resizable.Group>
  );
}
