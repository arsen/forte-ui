"use client";

import { Button, Field, Input } from "@dofortech/forte-ui";

// Every class below resolves to a forte-ui token through the bridge:
// gap-4 is --forte-space-4, p-surface is --forte-surface-p, bg-panel is
// --forte-color-panel, text-3 is --forte-font-size-3 — and rounded-pill on the
// Button is a utility beating the component's own radius, no !important.
export default function TokenUtilities() {
  return (
    <form
      className="grid w-full max-w-xs gap-4 rounded-surface border border-border-muted bg-panel p-surface"
      onSubmit={(e) => e.preventDefault()}
    >
      <h3 className="m-0 text-3 font-semibold">Sign in</h3>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input placeholder="you@work.com" />
      </Field.Root>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" tone="neutral">
          Cancel
        </Button>
        <Button type="submit" className="rounded-pill">
          Continue
        </Button>
      </div>
    </form>
  );
}
