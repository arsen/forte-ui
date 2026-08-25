"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

export default function ButtonLoading() {
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: "var(--pui-space-3)", justifyItems: "start" }}
    >
      <Button type="submit" loading={saving} loadingLabel="Saving notification settings">
        Save settings
      </Button>
      <p
        role="status"
        style={{
          margin: 0,
          fontSize: "var(--pui-font-size-1)",
          color: "var(--pui-color-foreground-muted)",
        }}
      >
        {savedAt ? `Settings saved at ${savedAt}` : "No changes saved yet"}
      </p>
    </form>
  );
}
