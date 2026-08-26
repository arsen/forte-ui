"use client";

import { Spinner } from "@dofortech/pretty-ui";

export default function SpinnerLabels() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--pui-space-6)",
        alignItems: "center",
      }}
    >
      {/* The default. The words are still in the accessibility tree — they are
       * only kept out of the paint — so this is announced exactly like the two
       * beside it. */}
      <Spinner label="Loading invoices" />

      <Spinner label="Loading invoices" labelPlacement="end" />

      <Spinner label="Loading invoices" labelPlacement="bottom" size="lg" />
    </div>
  );
}
