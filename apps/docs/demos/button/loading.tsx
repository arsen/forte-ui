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
    <form onSubmit={handleSubmit} className="grid justify-items-start gap-3">
      <Button type="submit" loading={saving} loadingLabel="Saving notification settings">
        Save settings
      </Button>
      <p role="status" className="m-0 text-1 text-foreground-muted">
        {savedAt ? `Settings saved at ${savedAt}` : "No changes saved yet"}
      </p>
    </form>
  );
}
