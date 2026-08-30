"use client";

import { Bold, Italic, Link, Underline } from "lucide-react";
import { Button, Tooltip } from "@dofortech/forte-ui";

const ACTIONS = [
  { label: "Bold", keys: "⌘B", ariaKeys: "Meta+B", Icon: Bold },
  { label: "Italic", keys: "⌘I", ariaKeys: "Meta+I", Icon: Italic },
  { label: "Underline", keys: "⌘U", ariaKeys: "Meta+U", Icon: Underline },
  { label: "Insert link", keys: "⌘K", ariaKeys: "Meta+K", Icon: Link },
] as const;

export default function TooltipShortcut() {
  return (
    <Tooltip.Provider delay={400}>
      <div className="flex gap-1">
        {ACTIONS.map(({ label, keys, ariaKeys, Icon }) => (
          <Tooltip.Root key={label}>
            {/* The tooltip is not announced, so both halves of what it shows
              * have to reach a screen reader from the trigger itself: the name
              * from `aria-label`, the keys from `aria-keyshortcuts` — spelled
              * in words, since ⌘B is read as "place of interest sign B". */}
            <Tooltip.Trigger
              aria-label={label}
              aria-keyshortcuts={ariaKeys}
              render={<Button variant="ghost" tone="neutral" iconOnly />}
            >
              <Icon aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Popup>
              <Tooltip.Arrow />
              {label}
              <Tooltip.Shortcut>{keys}</Tooltip.Shortcut>
            </Tooltip.Popup>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  );
}
