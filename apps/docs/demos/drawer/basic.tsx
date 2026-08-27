"use client";

import { Button, Drawer, Switch } from "@dofortech/pretty-ui";

const row = "flex items-center gap-3";

export default function DrawerBasic() {
  return (
    <Drawer.Root side="right">
      <Drawer.Trigger render={<Button variant="outline" />}>
        Filters
      </Drawer.Trigger>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>
            Narrow the result list. Changes apply as you make them.
          </Drawer.Description>
          <label className={row}>
            <Switch defaultChecked />
            Only show open issues
          </label>
          <label className={row}>
            <Switch />
            Assigned to me
          </label>
          <label className={row}>
            <Switch />
            Has a linked pull request
          </label>
          <Drawer.Footer>
            <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
              Reset
            </Drawer.Close>
            <Drawer.Close render={<Button />}>Done</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
