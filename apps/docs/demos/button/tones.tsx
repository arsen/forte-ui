"use client";

import { Button } from "@dofortech/pretty-ui";

const variants = ["solid", "soft", "outline", "ghost"] as const;

export default function ButtonTones() {
  return (
    <div className="grid gap-3">
      {variants.map((variant) => (
        <div key={variant} className="flex gap-2">
          <Button variant={variant} tone="primary">
            Publish
          </Button>
          <Button variant={variant} tone="secondary">
            Save draft
          </Button>
          <Button variant={variant} tone="danger">
            Delete post
          </Button>
          <Button variant={variant} tone="neutral">
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
