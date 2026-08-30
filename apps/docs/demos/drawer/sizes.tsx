"use client";

import { Button, Drawer, type DrawerSize } from "@forte-ui/react";

const SIZES: { size: DrawerSize; label: string; extent: string }[] = [
  { size: "sm", label: "Small", extent: "18rem" },
  { size: "md", label: "Medium", extent: "24rem" },
  { size: "lg", label: "Large", extent: "32rem" },
  { size: "full", label: "Full", extent: "the whole viewport" },
];

export default function DrawerSizes() {
  return (
    <>
      {SIZES.map(({ size, label, extent }) => (
        <Drawer.Root key={size} side="right">
          <Drawer.Trigger render={<Button variant="outline" />}>
            {label}
          </Drawer.Trigger>
          <Drawer.Popup size={size}>
            <Drawer.Content>
              <Drawer.Title>size=&quot;{size}&quot;</Drawer.Title>
              <Drawer.Description>
                A right-hand drawer measures {extent} across. The same scale
                becomes a height on a top or bottom drawer.
              </Drawer.Description>
              <Drawer.Footer>
                <Drawer.Close render={<Button />}>Close</Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Root>
      ))}
    </>
  );
}
