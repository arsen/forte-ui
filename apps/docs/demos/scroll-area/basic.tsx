"use client";

import { ScrollArea } from "@dofortech/pretty-ui";

const RELEASES = [
  ["4.2.0", "Scroll areas gained a gradient edge fade."],
  ["4.1.3", "Fixed a focus ring cropped inside tab strips."],
  ["4.1.2", "Select popups no longer measure while animating."],
  ["4.1.1", "Reduced motion now shortens rather than removes transitions."],
  ["4.1.0", "Added the drawer component and its swipe area."],
  ["4.0.4", "Radius presets restate the whole scale."],
  ["4.0.3", "Disabled controls paint GrayText under forced colors."],
  ["4.0.2", "Dialog exit transitions can be interrupted."],
  ["4.0.1", "Contrast harness widened to 119,108 seeds."],
  ["4.0.0", "Every colour now derives from one seed."],
];

export default function ScrollAreaBasic() {
  return (
    <ScrollArea.Root style={{ maxHeight: "13rem", width: "min(30rem, 100%)" }}>
      <ScrollArea.Viewport aria-label="Release notes">
        <ScrollArea.Content style={{ paddingInlineEnd: "var(--pui-space-4)" }}>
          <div style={{ display: "grid", gap: "var(--pui-space-3)" }}>
            {RELEASES.map(([version, note]) => (
              <div key={version}>
                <p style={{ margin: 0, fontWeight: "var(--pui-font-weight-medium)" }}>{version}</p>
                <p style={{ margin: 0, color: "var(--pui-color-foreground-muted)" }}>{note}</p>
              </div>
            ))}
          </div>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
