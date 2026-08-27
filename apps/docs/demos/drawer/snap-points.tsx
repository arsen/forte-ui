"use client";

import * as React from "react";
import {
  Button,
  Drawer,
  type DrawerSnapPoint,
} from "@dofortech/pretty-ui";

// A peek, a half sheet, and the whole screen. Strings carry their own unit;
// numbers at or below 1 are read as a fraction of the viewport.
const SNAP_POINTS: DrawerSnapPoint[] = ["10rem", 0.55, 1];

const list = "m-0 flex list-none flex-col gap-2 p-0";

const item = "rounded-control bg-panel p-3";

export default function DrawerSnapPoints() {
  const [snapPoint, setSnapPoint] = React.useState<DrawerSnapPoint | null>(
    SNAP_POINTS[0]!,
  );

  return (
    <Drawer.Root
      side="bottom"
      snapPoints={SNAP_POINTS}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
    >
      <Drawer.Trigger render={<Button variant="outline" />}>
        Nearby stops
      </Drawer.Trigger>
      <Drawer.Popup size="full">
        <Drawer.Handle />
        <Drawer.Content>
          <Drawer.Title>Nearby stops</Drawer.Title>
          <Drawer.Description>
            Drag the sheet up for the full list, or down to put it away.
          </Drawer.Description>
          <ul className={list}>
            {[
              "Ostbahnhof — 2 min",
              "Rosenheimer Platz — 4 min",
              "Isartor — 6 min",
              "Marienplatz — 9 min",
              "Karlsplatz — 12 min",
              "Hauptbahnhof — 15 min",
            ].map((stop) => (
              <li key={stop} className={item}>
                {stop}
              </li>
            ))}
          </ul>
          <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
            Close
          </Drawer.Close>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
