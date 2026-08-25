import type { Metadata } from "next";
import { ThemeStudio } from "@/components/theme-studio/theme-studio";

export const metadata: Metadata = {
  title: "Theme Studio",
  description:
    "Pick a brand colour and watch the entire design system rebuild around it — twelve accent steps, tinted neutrals and a readable text colour, derived in pure CSS.",
};

export default function ThemePage() {
  return (
    <div>
      <div className="prose">
        <h1>Theme Studio</h1>
        <p className="lead">
          One variable re-skins everything. Pick a colour and the whole ramp
          rebuilds — twelve accent steps, brand-tinted neutrals, and a text
          colour chosen to stay readable on top of your fill. No JavaScript runs
          in the library to make this happen; it is relative colour syntax in
          plain CSS.
        </p>
      </div>
      <ThemeStudio />
    </div>
  );
}
