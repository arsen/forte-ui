"use client";

import { ThemeToggle } from "@forte-ui/react";

export default function ThemeToggleSizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
    </div>
  );
}
