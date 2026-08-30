"use client";

import { Button } from "@dofortech/forte-ui";

const variants = ["solid", "soft", "outline", "ghost"] as const;
const tones = ["primary", "secondary", "danger", "neutral"] as const;

export default function ButtonTones() {
  return (
    <div className="grid gap-3">
      {variants.map((variant) => (
        <div key={variant} className="flex gap-2">
          {tones.map((tone) => (
            <Button key={tone} variant={variant} tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
