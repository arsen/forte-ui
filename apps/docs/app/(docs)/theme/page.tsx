import type { Metadata } from "next";
import { ThemeStudio } from "@/components/theme-studio/theme-studio";
import { LEAD, PROSE_H1 } from "@/components/styles";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Theme Studio",
  description:
    "Pick a brand color and watch the entire design system rebuild around it — twelve accent steps, tinted neutrals and a readable text color, derived in pure CSS.",
};

export default function ThemePage() {
  return (
    <div>
      {/* Hand-written JSX, so it does not go through the MDX element mapping —
        * the shared constants are what keep this heading the same size as the
        * one on every component page. */}
      <h1 className={cn(PROSE_H1, "mb-3")}>Theme Studio</h1>
      <p className={cn(LEAD, "mb-4")}>
        One variable re-skins everything. Pick a color and the whole ramp
        rebuilds — twelve accent steps, brand-tinted neutrals, and a text color
        chosen to stay readable on top of your fill. No JavaScript runs in the
        library to make this happen; it is relative color syntax in plain CSS.
      </p>
      <ThemeStudio />
    </div>
  );
}
