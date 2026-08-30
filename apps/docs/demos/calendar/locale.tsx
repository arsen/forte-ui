"use client";

import * as React from "react";
import { Button, Calendar } from "@dofortech/forte-ui";

/* `weekStartsOn` is a separate prop because it cannot be read from the locale
 * in every browser — so the pairing is stated here rather than guessed. */
const LOCALES = [
  { tag: "en-US", label: "English", weekStartsOn: 0 },
  { tag: "fr-FR", label: "Français", weekStartsOn: 1 },
  { tag: "ja-JP", label: "日本語", weekStartsOn: 0 },
  { tag: "ar-EG", label: "العربية", weekStartsOn: 6 },
] as const;

export default function CalendarLocale() {
  const [locale, setLocale] = React.useState<(typeof LOCALES)[number]>(LOCALES[0]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {LOCALES.map((entry) => (
          <Button
            key={entry.tag}
            size="sm"
            tone="neutral"
            variant={entry.tag === locale.tag ? "soft" : "ghost"}
            aria-pressed={entry.tag === locale.tag}
            onClick={() => setLocale(entry)}
          >
            {entry.label}
          </Button>
        ))}
      </div>
      <Calendar
        locale={locale.tag}
        weekStartsOn={locale.weekStartsOn}
        defaultMonth={new Date(2026, 7, 1)}
      />
    </div>
  );
}
