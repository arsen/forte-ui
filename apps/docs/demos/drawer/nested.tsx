"use client";

import * as React from "react";
import { Button, Drawer } from "@dofortech/pretty-ui";

type Plan = { id: string; name: string; price: string; seats: string };

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: "$0", seats: "up to 3 seats" },
  { id: "team", name: "Team", price: "$240 / mo", seats: "up to 20 seats" },
  { id: "business", name: "Business", price: "$480 / mo", seats: "up to 50 seats" },
];

const rows = { display: "flex", flexDirection: "column" } as const;

const row = {
  display: "flex",
  justifyContent: "space-between",
  gap: "var(--pui-space-4)",
  paddingBlock: "var(--pui-space-2)",
  borderBlockStart: "1px solid var(--pui-color-border-muted)",
} as const;

const label = { color: "var(--pui-color-foreground-muted)" } as const;

const options = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-2)",
} as const;

export default function DrawerNested() {
  const [plan, setPlan] = React.useState<Plan>(PLANS[1]!);

  return (
    <Drawer.Root side="bottom">
      <Drawer.Trigger render={<Button variant="outline" />}>
        Manage billing
      </Drawer.Trigger>
      <Drawer.Popup>
        <Drawer.Handle />
        <Drawer.Content>
          <Drawer.Title>Billing</Drawer.Title>
          <Drawer.Description>
            Renews on 3 September, billed to the card ending 4242.
          </Drawer.Description>

          <div style={rows}>
            <div style={row}>
              <span style={label}>Plan</span>
              <span>{plan.name}</span>
            </div>
            <div style={row}>
              <span style={label}>Included</span>
              <span>{plan.seats}</span>
            </div>
            <div style={row}>
              <span style={label}>Next invoice</span>
              <span>{plan.price}</span>
            </div>
          </div>

          {/* A Root inside a Popup is what makes the drawer nested. */}
          <Drawer.Root side="bottom">
            <Drawer.Trigger render={<Button variant="soft" />}>
              Change plan
            </Drawer.Trigger>
            <Drawer.Popup size="sm">
              <Drawer.Handle />
              <Drawer.Content>
                <Drawer.Title>Choose a plan</Drawer.Title>
                <Drawer.Description>
                  The change takes effect at the next renewal.
                </Drawer.Description>
                <div style={options}>
                  {PLANS.map((p) => (
                    // Drawer.Close both dismisses this sheet and hands the
                    // choice back to the parent. Swiping the sheet away or
                    // pressing Escape never runs onClick, so an abandoned
                    // sheet returns nothing and the plan above is unchanged.
                    <Drawer.Close
                      key={p.id}
                      onClick={() => setPlan(p)}
                      render={
                        <Button
                          variant={p.id === plan.id ? "solid" : "outline"}
                          tone={p.id === plan.id ? "primary" : "neutral"}
                        />
                      }
                    >
                      {p.name} — {p.price}
                    </Drawer.Close>
                  ))}
                </div>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Root>

          <Drawer.Footer>
            <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
              Close
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
