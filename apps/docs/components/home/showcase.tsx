"use client";

import * as React from "react";
import {
  Button, Checkbox, Dialog, Kbd, Select, Switch, Tabs, Tooltip,
} from "@forte-ui/react";

const TIMEZONES = [
  { value: "utc", label: "UTC" },
  { value: "cet", label: "Central European Time" },
  { value: "est", label: "Eastern Standard Time" },
  { value: "pst", label: "Pacific Standard Time" },
];

const ROW = "flex flex-wrap items-center gap-3";

export function Showcase() {
  return (
    <Tabs.Root
      defaultValue="forms"
      variant="line"
      className="overflow-hidden rounded-surface border border-border-muted bg-panel gap-0"
    >
      <Tabs.List className="border-b rounded-none border-border-muted px-3 py-2">
        <Tabs.Tab value="forms">Form controls</Tabs.Tab>
        <Tabs.Tab value="overlays">Overlays</Tabs.Tab>
        <Tabs.Tab value="buttons">Buttons</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Panel value="forms" className="bg-background p-6 rounded-none">
        <div className="grid max-w-[30rem] gap-4">
          <Row label="Email notifications" hint="Weekly digest and mentions">
            <Switch defaultChecked />
          </Row>
          <Row label="Public profile" hint="Anyone can see your activity">
            <Switch />
          </Row>
          <div className="grid gap-1">
            <Select.Root defaultValue="cet" items={TIMEZONES}>
              <Select.Label>Time zone</Select.Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Icon />
              </Select.Trigger>
              <Select.Popup>
                {TIMEZONES.map((tz) => (
                  <Select.Item key={tz.value} value={tz.value}>
                    {tz.label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Root>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-2">
            <Checkbox defaultChecked />
            <span>Send me product updates</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-2">
            <Checkbox />
            <span>Share anonymous usage data</span>
          </label>
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="overlays" className="bg-background p-6 rounded-none">
        <div className={ROW}>
          <Dialog.Root>
            <Dialog.Trigger render={<Button />}>Open dialog</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Rename workspace</Dialog.Title>
              <Dialog.Description>
                This changes the workspace name for everyone on the team.
              </Dialog.Description>
              <Dialog.Footer align="end">
                <Dialog.Close render={<Button variant="ghost" tone="neutral" />}>
                  Cancel
                </Dialog.Close>
                <Dialog.Close render={<Button />}>Save</Dialog.Close>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Root>

          <Tooltip.Root>
            <Tooltip.Trigger render={<Button variant="outline" aria-label="Keyboard shortcuts" />}>
              Hover me
            </Tooltip.Trigger>
            <Tooltip.Popup>
              Press <Kbd>?</Kbd> anywhere for shortcuts
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Root>
        </div>
        <p className="mt-4 text-2 text-foreground-muted">
          Open the dialog and press <Kbd>Esc</Kbd>, or close it mid-animation —
          the transition reverses instead of snapping.
        </p>
      </Tabs.Panel>

      <Tabs.Panel value="buttons" className="bg-background p-6 rounded-none">
        {/* The gap between the two rows was a `.row + .row` margin; a grid says
          * the same thing without a sibling selector. */}
        <div className="grid gap-4">
          <div className={ROW}>
            <Button>Primary</Button>
            <Button tone="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button tone="danger">Delete</Button>
          </div>
          <div className={ROW}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <SubmitButton />
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Tabs.Panel>
    </Tabs.Root>
  );
}

function SubmitButton() {
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, [loading]);
  return (
    <Button loading={loading} onClick={() => setLoading(true)}>
      {loading ? "Saving" : "Click to load"}
    </Button>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="grid gap-[2px]">
        <span className="text-2 font-medium">{label}</span>
        <span className="text-1 text-foreground-muted">{hint}</span>
      </span>
      {children}
    </label>
  );
}
