"use client";

import * as React from "react";
import { Button, Drawer } from "@forte-ui/react";

const row =
  "flex items-center justify-between gap-3 rounded-control bg-panel px-3 py-2";

const ORDERS = [
  ["Order #1042", "Shipped"],
  ["Order #1041", "Delivered"],
  ["Order #1039", "Delivered"],
];

export default function DrawerIndent() {
  // The drawer portals in here rather than into <body>, so the scrim and the
  // sheet stay inside this frame — a demo of the whole-app effect, scoped to
  // one box. In an app the portal keeps its default and none of the
  // `absolute` overrides below are needed.
  const frame = React.useRef<HTMLDivElement>(null);

  return (
    <Drawer.Provider>
      {/* Square on purpose: the box stands in for a screen. A radius here
          would clip the flush sheet's bottom corners and the frame color
          behind them into notches no real viewport has. */}
      <div
        ref={frame}
        className="relative w-full overflow-hidden border border-border-muted"
      >
        {/* Fixed by default, for an indent that wraps the whole app. */}
        <Drawer.IndentBackground className="absolute" />
        <Drawer.Indent className="flex min-h-[20rem] flex-col">
          {/* Flush with the top and painted, like an app bar: the indent
              clips it to its rounded corners while the page steps back. */}
          <div className="flex items-center justify-between gap-3 border-b border-border-muted bg-panel px-surface py-3">
            <span className="text-3 font-semibold">Orders</span>
            <Drawer.Root side="bottom">
              <Drawer.Trigger render={<Button />}>Track order</Drawer.Trigger>
              <Drawer.Popup
                container={frame}
                viewportClassName="absolute"
                backdropClassName="absolute"
              >
                <Drawer.Handle />
                <Drawer.Content>
                  <Drawer.Title>Order #1042</Drawer.Title>
                  <Drawer.Description>
                    Out for delivery — arriving between 2 and 4 pm. The page
                    behind steps back while this sheet is open, and comes
                    forward again as you drag it away.
                  </Drawer.Description>
                  <Drawer.Footer>
                    <Drawer.Close render={<Button variant="soft" />}>
                      Done
                    </Drawer.Close>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Root>
          </div>
          <div className="flex flex-col gap-3 p-surface">
            {ORDERS.map(([order, status]) => (
              <div key={order} className={row}>
                <span>{order}</span>
                <span className="text-2 text-foreground-muted">{status}</span>
              </div>
            ))}
          </div>
        </Drawer.Indent>
      </div>
    </Drawer.Provider>
  );
}
