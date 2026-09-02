"use client";

import * as React from "react";
import { Button, Drawer } from "@forte-ui/react";
import { Palette, X } from "lucide-react";
import { ICON } from "./styles";
import { useSystemThemeSync } from "./theme-mode";
import { ThemeConfigurator } from "./theme-studio/theme-configurator";
import { useThemeConfig } from "./theme-studio/theme-config";

/**
 * The header's theme control. It used to flip light/dark on the spot; it now
 * opens the whole configurator — the same component the Theme Studio page
 * shows beside its preview — so every knob the studio has is reachable from
 * any page, with the light/dark strip at the top where the old toggle's one
 * job went. The two mounts share their state through `theme-config.ts`, so a
 * seed picked in here is what the studio page shows when you get there.
 *
 * The trigger wears a palette, not the old sun/moon: the glyph should name
 * what pressing it does, and this button no longer changes the mode — it
 * opens the panel where the mode is one control among many. A state-carrying
 * icon would also promise state this button does not act on.
 *
 * The drawer is deliberately NON-modal, floating, and scrimless. The whole
 * point of opening it is to watch the page restyle as you drag a slider, so
 * the page must stay live — visible (no backdrop), scrollable and clickable
 * (`modal={false}`). `disablePointerDismissal` is the other half of that:
 * a non-modal drawer otherwise closes the moment a press or focus lands
 * outside it, which would end the session on the first "let me try this
 * button" click. With outside-press dismissal gone, the explicit close
 * button is the way out a pointer can see; Escape and the trigger still
 * work too.
 */
export function ThemeDrawer() {
  // The OS listener lives on this component because the header is on every
  // page — see the hook's own comment for what it does and when it yields.
  // It yields, among other times, while the studio pins a scheme, which is
  // why it is handed the config's answer.
  const [cfg] = useThemeConfig();
  useSystemThemeSync(cfg.scheme);

  return (
    <Drawer.Root side="right" modal={false} disablePointerDismissal>
      <Drawer.Trigger
        render={<Button variant="ghost" iconOnly />}
        aria-label="Theme settings"
        title="Theme settings"
      >
        <Palette className={ICON} aria-hidden="true" />
      </Drawer.Trigger>
      {/* `md`, not the shell drawers' `sm`: this one holds a control panel
        * tuned for the studio's 19rem column, and an 18rem drawer minus its
        * own padding would pinch the four-segment strips below the width they
        * were sized against. */}
      <Drawer.Popup size="md" variant="floating" backdrop={false}>
        <Drawer.Content>
          <div className="flex items-center justify-between gap-3">
            <Drawer.Title>Theme</Drawer.Title>
            <Drawer.Close
              aria-label="Close theme settings"
              render={<Button variant="ghost" size="sm" iconOnly />}
            >
              <X className={ICON} aria-hidden="true" />
            </Drawer.Close>
          </div>
          <ThemeConfigurator />
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
