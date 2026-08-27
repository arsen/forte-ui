import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Kind = "note" | "a11y" | "warn";

const META: Record<Kind, { label: string; icon: string }> = {
  note: { label: "Note", icon: "i" },
  a11y: { label: "Accessibility", icon: "A" },
  warn: { label: "Careful", icon: "!" },
};

/* The kind is two coordinated colour changes — the surface and the badge — so
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
 * A labelled aside.
 *
 * The kind is announced as text rather than carried only by colour and an
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
        // Capped at the measure like the prose around it. A callout is running
        // text with a box drawn round it, so it follows the paragraphs rather
        // than the tables — and without the cap it would stretch the full
        // column while `max-w-measure` on its inner <p> held the text at 48rem,
        // leaving a short line adrift in a very wide box.
        "my-5 grid max-w-measure grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-surface border border-border-muted bg-panel p-4 text-2",
        tone.surface,
      )}
      data-kind={kind}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-(--pui-radius-full) font-mono text-1 font-bold",
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
