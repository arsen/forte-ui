"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@forte-ui/react";

const VARIANTS = ["solid", "soft", "outline", "ghost"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export default function ButtonIconOnly() {
  return (
    <div className="grid gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-[3.5rem] font-mono text-1 text-foreground-subtle">{variant}</span>
          {SIZES.map((size) => (
            <Button
              key={size}
              iconOnly
              variant={variant}
              size={size}
              /* Every button in a sweep needs its OWN name — a screen reader
               * user tabbing through twelve buttons all called "Rename
               * document" has no way to tell them apart. */
              aria-label={`Rename document (${variant}, ${size})`}
            >
              {/* No size on the icon: Button sizes a direct `svg` child from
                * `--forte-button-icon-size`, so lucide's 24px default does not
                * decide how big the square is. */}
              <Pencil aria-hidden="true" />
            </Button>
          ))}
          {/* One tone that is not the default, to show `iconOnly` is orthogonal
            * to both other axes — a row action's delete is the case that
            * actually comes up. */}
          <Button
            iconOnly
            variant={variant}
            tone="danger"
            aria-label={`Delete document (${variant})`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}
