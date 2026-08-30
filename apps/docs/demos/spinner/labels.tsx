"use client";

import { Spinner } from "@forte-ui/react";

export default function SpinnerLabels() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* The default. The words are still in the accessibility tree — they are
       * only kept out of the paint — so this is announced exactly like the two
       * beside it. */}
      <Spinner label="Loading invoices" />

      <Spinner label="Loading invoices" labelPlacement="end" />

      <Spinner label="Loading invoices" labelPlacement="bottom" size="lg" />
    </div>
  );
}
