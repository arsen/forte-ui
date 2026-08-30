"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, ButtonGroup } from "@dofortech/forte-ui";

const ICON = "size-4 shrink-0";

export default function ButtonGroupNested() {
  return (
    // A group whose direct children are themselves groups switches from
    // fusing to spacing: each inner group fuses its own controls, and the
    // outer one only lays them out — one object per decision, one gap
    // between decisions.
    <ButtonGroup.Root aria-label="Pagination">
      <ButtonGroup.Root role="presentation">
        <Button variant="outline" tone="neutral" iconOnly aria-label="Previous page">
          <ChevronLeft className={ICON} />
        </Button>
        <Button variant="outline" tone="neutral" iconOnly aria-label="Next page">
          <ChevronRight className={ICON} />
        </Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root role="presentation">
        <Button variant="outline" tone="neutral">1</Button>
        <Button variant="outline" tone="neutral">2</Button>
        <Button variant="outline" tone="neutral">3</Button>
      </ButtonGroup.Root>
    </ButtonGroup.Root>
  );
}
