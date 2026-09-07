"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, Toolbar } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

const zoomLevels = {
  "50": "50%",
  "100": "100%",
  "150": "150%",
  "200": "200%",
};

export default function ToolbarText() {
  const [page, setPage] = React.useState(3);
  const zoomLabelId = React.useId();

  return (
    <Toolbar.Root aria-label="Document">
      <Toolbar.Group aria-label="Page">
        <Toolbar.Button
          iconOnly
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage((current) => current - 1)}
        >
          <ChevronLeft className={ICON} />
        </Toolbar.Button>

        {/* A readout. Not an item: it takes no focus and the arrow keys pass
          * over it, so the two buttons either side of it are still one press
          * apart. */}
        <Toolbar.Text>
          Page {page} of 12
        </Toolbar.Text>

        <Toolbar.Button
          iconOnly
          aria-label="Next page"
          disabled={page === 12}
          onClick={() => setPage((current) => current + 1)}
        >
          <ChevronRight className={ICON} />
        </Toolbar.Button>
      </Toolbar.Group>

      <Toolbar.Separator />

      {/* A label. Static text is skipped while arrowing, so on the way to the
        * select nothing would announce what it is for — the `id` and
        * `aria-labelledby` pair is what makes the visible word the control's
        * name. */}
      <Toolbar.Text id={zoomLabelId}>Zoom</Toolbar.Text>
      <Select.Root items={zoomLevels} defaultValue="100">
        <Toolbar.Button render={<Select.Trigger />} aria-labelledby={zoomLabelId}>
          <Select.Value />
          <Select.Icon />
        </Toolbar.Button>
        <Select.Popup>
          {Object.entries(zoomLevels).map(([value, label]) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </Toolbar.Root>
  );
}
