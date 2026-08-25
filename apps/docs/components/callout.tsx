import type { ReactNode } from "react";
import styles from "./callout.module.css";

type Kind = "note" | "a11y" | "warn";

const META: Record<Kind, { label: string; icon: string }> = {
  note: { label: "Note", icon: "i" },
  a11y: { label: "Accessibility", icon: "A" },
  warn: { label: "Careful", icon: "!" },
};

/**
 * A labelled aside.
 *
 * The kind is announced as text rather than carried only by colour and an
 * icon — WCAG SC 1.4.1 (Use of Color). The glyph itself is aria-hidden.
 */
export function Callout({ kind = "note", children }: { kind?: Kind; children: ReactNode }) {
  const meta = META[kind];
  return (
    <aside className={styles.root} data-kind={kind}>
      <span className={styles.icon} aria-hidden="true">{meta.icon}</span>
      <div className={styles.body}>
        <p className={styles.label}>{meta.label}</p>
        {children}
      </div>
    </aside>
  );
}
