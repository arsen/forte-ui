"use client";

import { ThemeToggle } from "@forte-ui/react";

export default function ThemeToggleVariants() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ThemeToggle variant="ghost" />
      <ThemeToggle variant="soft" />
      <ThemeToggle variant="outline" />
    </div>
  );
}
