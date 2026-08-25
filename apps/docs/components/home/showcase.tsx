"use client";

import * as React from "react";
import {
  Button, Checkbox, Dialog, Select, Switch, Tabs, Tooltip,
} from "@dofortech/pretty-ui";
import styles from "./showcase.module.css";

const TIMEZONES = [
  { value: "utc", label: "UTC" },
  { value: "cet", label: "Central European Time" },
  { value: "est", label: "Eastern Standard Time" },
  { value: "pst", label: "Pacific Standard Time" },
];

export function Showcase() {
  return (
    <Tabs.Root defaultValue="forms" variant="pill" className={styles.root}>
      <Tabs.List className={styles.list}>
        <Tabs.Tab value="forms">Form controls</Tabs.Tab>
        <Tabs.Tab value="overlays">Overlays</Tabs.Tab>
        <Tabs.Tab value="buttons">Buttons</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Panel value="forms" className={styles.panel}>
        <div className={styles.stack}>
          <Row label="Email notifications" hint="Weekly digest and mentions">
            <Switch defaultChecked />
          </Row>
          <Row label="Public profile" hint="Anyone can see your activity">
            <Switch />
          </Row>
          <div className={styles.field}>
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
          <label className={styles.check}>
            <Checkbox defaultChecked />
            <span>Send me product updates</span>
          </label>
          <label className={styles.check}>
            <Checkbox />
            <span>Share anonymous usage data</span>
          </label>
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="overlays" className={styles.panel}>
        <div className={styles.row}>
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
              Press <kbd>?</kbd> anywhere for shortcuts
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Root>
        </div>
        <p className={styles.note}>
          Open the dialog and press <kbd>Esc</kbd>, or close it mid-animation —
          the transition reverses instead of snapping.
        </p>
      </Tabs.Panel>

      <Tabs.Panel value="buttons" className={styles.panel}>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button tone="secondary">Secondary</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button tone="danger">Delete</Button>
        </div>
        <div className={styles.row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <SubmitButton />
          <Button disabled>Disabled</Button>
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
    <label className={styles.settingRow}>
      <span>
        <span className={styles.settingLabel}>{label}</span>
        <span className={styles.settingHint}>{hint}</span>
      </span>
      {children}
    </label>
  );
}
