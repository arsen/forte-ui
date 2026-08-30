"use client";

import { Button } from "@forte-ui/react";

// Plain, unlayered CSS: it beats the library's `@layer forte.components`
// regardless of specificity. `data-forte` and the `data-*` state attributes are
// the stable selectors — the hashed class names are not.
const css = `
  .demo-depth [data-forte="button"][data-variant="solid"] {
    box-shadow: var(--forte-shadow-2);
  }
  .demo-depth [data-forte="button"][data-variant="solid"]:active {
    box-shadow: none;
  }
`;

export default function PartSelectors() {
  return (
    <div className="demo-depth flex flex-wrap items-center gap-3">
      <style>{css}</style>
      <Button>Solid, with depth</Button>
      <Button tone="secondary">Every solid button</Button>
      <Button variant="soft">Soft, untouched</Button>
    </div>
  );
}
