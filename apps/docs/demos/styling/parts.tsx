"use client";

import { Button } from "@dofortech/pretty-ui";

// Plain, unlayered CSS: it beats the library's `@layer pretty-ui.components`
// regardless of specificity. `data-pui` and the `data-*` state attributes are
// the stable selectors — the hashed class names are not.
const css = `
  .demo-depth [data-pui="button"][data-variant="solid"] {
    box-shadow: var(--pui-shadow-2);
  }
  .demo-depth [data-pui="button"][data-variant="solid"]:active {
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
