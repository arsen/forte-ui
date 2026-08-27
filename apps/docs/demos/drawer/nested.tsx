"use client";

import * as React from "react";
import { Button, Drawer } from "@dofortech/pretty-ui";

type Plan = { id: string; name: string; price: string; seats: string };

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: "$0", seats: "up to 3 seats" },
  { id: "team", name: "Team", price: "$240 / mo", seats: "up to 20 seats" },
  { id: "business", name: "Business", price: "$480 / mo", seats: "up to 50 seats" },
];

const rows = "flex flex-col";

const row = "flex justify-between gap-4 border-t border-border-muted py-2";

const label = "text-foreground-muted";

const options = "flex flex-col gap-2";

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

          <div className={rows}>
            <div className={row}>
              <span className={label}>Plan</span>
              <span>{plan.name}</span>
            </div>
            <div className={row}>
              <span className={label}>Included</span>
              <span>{plan.seats}</span>
            </div>
            <div className={row}>
              <span className={label}>Next invoice</span>
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
                <div className={options}>
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
