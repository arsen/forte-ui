"use client";

import { Toggle, ToggleGroup, useTheme, type ThemeMode } from "@forte-ui/react";

export default function ThemeToggleUseTheme() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // A three-way picker is what the hook is for — `ThemeToggle` itself never
  // offers "system". `setTheme("system")` REMOVES the attribute and the
  // stored record, handing the page back to the OS preference; the group
  // value is `[theme]` because a ToggleGroup's value is the array of pressed
  // toggles. Pressing the pressed option would empty it, so that is ignored.
  return (
    <div className="grid justify-items-center gap-3">
      <ToggleGroup
        aria-label="Colour mode"
        segmented
        variant="solid"
        value={[theme]}
        onValueChange={(value: readonly ThemeMode[]) => {
          if (value[0]) setTheme(value[0]);
        }}
      >
        <Toggle value="light">Light</Toggle>
        <Toggle value="system">System</Toggle>
        <Toggle value="dark">Dark</Toggle>
      </ToggleGroup>
      <span className="text-1 text-foreground-muted">
        theme: {theme} · resolved: {resolvedTheme}
      </span>
    </div>
  );
}
