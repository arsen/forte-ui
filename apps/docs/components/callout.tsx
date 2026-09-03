import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Kind = "note" | "a11y" | "warn";

const META: Record<Kind, { label: string; icon: string }> = {
  note: { label: "Note", icon: "i" },
  a11y: { label: "Accessibility", icon: "A" },
  warn: { label: "Careful", icon: "!" },
};

/* The kind is two coordinated color changes — the surface and the badge — so
 * they are declared together rather than as two lookups that could drift. */
const TONE: Record<Kind, { surface: string; badge: string }> = {
  note: { surface: "", badge: "bg-panel-active" },
  a11y: {
    surface: "border-primary-border bg-primary-soft",
    badge: "bg-primary text-on-primary",
  },
  warn: {
    surface: "border-danger-border bg-danger-soft",
    badge: "bg-danger text-on-danger",
  },
};

/**
 * A labeled aside.
 *
 * The kind is announced as text rather than carried only by color and an
 * icon — WCAG SC 1.4.1 (Use of Color). The glyph itself is aria-hidden.
 */
export function Callout({ kind = "note", children }: { kind?: Kind; children: ReactNode }) {
  const meta = META[kind];
  const tone = TONE[kind];

  return (
    // `data-kind` stays on the element even though nothing styles from it any
    // more: it is how a reader inspecting the page tells the three apart.
    <aside
      className={cn(
        // Full column, like the prose around it. The cap this used to carry
        // existed to match the paragraphs' own 48rem; those span the column
        // now, so a narrower callout would be the one box on the page stopping
        // short — the exact mismatch the cap was there to avoid.
        "my-5 grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-surface border border-border-muted bg-panel p-4 text-2",
        tone.surface,
      )}
      data-kind={kind}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-(--forte-radius-full) font-mono text-1 font-bold",
          tone.badge,
        )}
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      {/* The last child drops its bottom margin so the callout closes evenly —
        * MDX gives every paragraph and list one. */}
      <div className="[&>*:last-child]:mb-0">
        <p className="mb-1 font-semibold">{meta.label}</p>
        {children}
      </div>
    </aside>
  );
}
