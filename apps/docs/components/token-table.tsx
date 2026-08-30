import tokens from "@forte-ui/react/docs-data/tokens.json";
import { cn } from "@/lib/cn";
import { inline } from "./theming-table";
import { TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "./styles";

type Declaration = {
  value: string;
  selector: string;
  file: string;
  media?: string;
  supports?: string;
};

type Token = {
  name: string;
  family: string;
  value: string;
  description?: string;
  file?: string;
  generated?: boolean;
  declarations: Declaration[];
};

const DATA = tokens as Record<string, Token>;

/**
 * Renders a slice of the GLOBAL token inventory, straight from the generated
 * manifest — the styles-directory sibling of `ThemingTable`, which does the
 * same for per-component knobs.
 *
 * Nothing here is hand-maintained: `packages/react/scripts/tokens-docgen.mjs`
 * reads every declaration in `src/styles/*.css` at build time, so a token
 * added, renamed or re-valued updates these tables automatically instead of
 * silently going stale — the failure mode that already cost the hand-written
 * inventory `--forte-direction`.
 *
 * The Notes column is derived, not written: the manifest records every
 * selector that redeclares a token, so "rewritten by the `data-forte-radius`
 * presets" or "retuned under `prefers-contrast: more`" comes from the CSS
 * itself. A `/** … *\/` doc comment above a declaration adds prose the same
 * way it does for component knobs.
 */
export function TokenTable({
  families,
  prefixes,
  names,
  exclude = [],
  label,
}: {
  /** Include every token in these families (the segment after `--forte-`). */
  families?: string[];
  /** Include every token whose name starts with any of these. */
  prefixes?: string[];
  /** Include exactly these tokens, in this order. */
  names?: string[];
  /** Drop these names from whatever the other filters matched. */
  exclude?: string[];
  /** Accessible caption — "Spacing tokens", "Semantic colour tokens". */
  label: string;
}) {
  let rows: Token[];
  if (names) {
    rows = names.map((n) => {
      const t = DATA[n];
      // A renamed token would otherwise render as a silent gap in the table —
      // fail the build instead, the way ThemingTable does for a renamed part.
      if (!t) throw new Error(`TokenTable: no token "${n}" in the generated manifest`);
      return t;
    });
  } else {
    rows = Object.values(DATA).filter(
      (t) =>
        (families?.includes(t.family) ?? false) ||
        (prefixes?.some((p) => t.name.startsWith(p)) ?? false),
    );
  }
  rows = rows.filter((t) => !exclude.includes(t.name));
  if (!rows.length) {
    throw new Error(`TokenTable: no tokens matched for "${label}"`);
  }

  const notes = new Map(rows.map((t) => [t.name, notesFor(t)]));
  // Families like spacing carry no prose and no preset behaviour; a permanently
  // empty column would just push the values around for nothing.
  const hasNotes = rows.some((t) => notes.get(t.name)?.length);

  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <caption className="forte-visually-hidden">{label}</caption>
        <thead>
          <tr>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Token</th>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Default</th>
            {hasNotes ? (
              <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Notes</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.name}>
              <th scope="row" className={cn(TABLE_CELL, "font-normal")}>
                <code className="font-mono text-[0.9em] text-primary-text break-words">
                  {t.name}
                </code>
              </th>
              <td className={TABLE_CELL}>
                <code className="wrap-anywhere">{t.value}</code>
              </td>
              {hasNotes ? (
                <td className={TABLE_CELL}>{inline(notes.get(t.name)!.join(" · "))}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The doc comment, then everything the declaration list can prove. */
function notesFor(t: Token): string[] {
  const notes: string[] = t.description ? [t.description] : [];
  const some = (pred: (d: Declaration) => boolean | undefined) => t.declarations.some(pred);

  if (some((d) => d.selector.includes("[data-forte-radius")))
    notes.push("rewritten by the `data-forte-radius` presets");
  if (some((d) => d.selector.includes("[data-forte-density")))
    notes.push("rewritten by the `data-forte-density` presets");
  if (some((d) => d.media?.includes("prefers-contrast")))
    notes.push("retuned under `prefers-contrast: more`");
  if (some((d) => d.media?.includes("forced-colors")))
    notes.push("retuned under forced colours");
  if (some((d) => d.media?.includes("prefers-reduced-transparency")))
    notes.push("retuned under `prefers-reduced-transparency`");
  if (some((d) => d.media?.includes("prefers-reduced-motion")))
    notes.push("collapsed under reduced motion");
  return notes;
}
