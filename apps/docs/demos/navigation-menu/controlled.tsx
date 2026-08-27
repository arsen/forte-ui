"use client";

import * as React from "react";
import { Button, NavigationMenu } from "@dofortech/pretty-ui";

const PANELS = {
  product: ["Overview", "Integrations", "Changelog"],
  company: ["About", "Careers", "Press"],
};

type PanelValue = keyof typeof PANELS;

export default function NavigationMenuControlled() {
  const [value, setValue] = React.useState<PanelValue | null>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <NavigationMenu.Root<PanelValue>
        aria-label="Controlled"
        value={value}
        onValueChange={setValue}
      >
        <NavigationMenu.List>
          {(Object.keys(PANELS) as PanelValue[]).map((key) => (
            /* `value` is what `Root`'s `value` names. Without it Base UI
              * generates an id, which is fine until something outside the bar
              * has to open a particular panel. */
            <NavigationMenu.Item key={key} value={key}>
              <NavigationMenu.Trigger className="capitalize">{key}</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                {PANELS[key].map((item) => (
                  <NavigationMenu.Link key={item} href="/components/navigation-menu" closeOnClick>
                    <NavigationMenu.LinkTitle>{item}</NavigationMenu.LinkTitle>
                  </NavigationMenu.Link>
                ))}
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>

        <NavigationMenu.Popup />
      </NavigationMenu.Root>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setValue("product")}>
          Open product
        </Button>
        <Button variant="outline" size="sm" onClick={() => setValue("company")}>
          Open company
        </Button>
        {/* `null` is closed — the value being nullish IS the closed state, so
          * there is no separate `open` prop to keep in step with it. */}
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          Close
        </Button>
      </div>

      <p className="m-0 text-1 text-foreground-muted">
        value: <code>{value === null ? "null" : `"${value}"`}</code>
      </p>
    </div>
  );
}
