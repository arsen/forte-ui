import type { ReactNode } from "react";
import theming from "@dofortech/pretty-ui/docs-data/theming.json";
import { cn } from "@/lib/cn";
import { TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "./styles";

type TokenRow = {
  name: string;
  value: string;
  description: string;
  part: string;
  overrides: { selector: string; value: string }[];
};

type ThemingData = Record<string, { name: string; tokens: TokenRow[] }>;

const DATA = theming as ThemingData;

/**
 * Renders a component's theming-token table straight from its stylesheet.
 *
 * Nothing here is hand-maintained: `packages/ui/scripts/theming-docgen.mjs`
 * reads the real `.module.css` at build time — a `/**` doc comment above a
 * custom-property declaration publishes it — so a renamed knob or a
 * changed default updates the docs automatically instead of silently going
 * stale. The description is the doc comment; the Default column is the
 * declared value itself.
 */
export function ThemingTable({
  component,
  part,
  declaredOn = false,
  variantColumn,
}: {
  component: string;
  /** Show only the tokens declared on this part's base rule (e.g. "group"). */
  part?: string;
  /**
   * Render a "Declared on" column — `Field.Label` for a token declared on
   * `.label` — for components whose knobs live on more than one part.
   */
  declaredOn?: boolean;
  /**
   * Extra default column fed by the generator's override records: the value
   * a token is redeclared to under the first selector containing `match`
   * (e.g. Collapsible's `contained` variant), or an em dash where the
   * variant leaves the default alone.
   */
  variantColumn?: { header: string; baseHeader?: string; match: string };
}) {
  const entry = DATA[component];
  if (!entry) {
    throw new Error(
      `No generated theming data for "${component}". Known: ${Object.keys(DATA).join(", ")}`,
    );
  }
  const rows = part ? entry.tokens.filter((t) => t.part === part) : entry.tokens;
  if (!rows.length) {
    // A renamed part would otherwise render an empty table and read as "no
    // tokens" — fail the build instead, the way an unknown component does.
    throw new Error(`No ${component} tokens declared on part "${part}"`);
  }

  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <caption className="pui-visually-hidden">Theming tokens for {component}</caption>
        <thead>
          <tr>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Property</th>
            {declaredOn ? (
              <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Declared on</th>
            ) : null}
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Controls</th>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>
              {variantColumn?.baseHeader ? inline(variantColumn.baseHeader) : "Default"}
            </th>
            {variantColumn ? (
              <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>
                {inline(variantColumn.header)}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const variantValue = variantColumn
              ? row.overrides.find((o) => o.selector.includes(variantColumn.match))?.value
              : undefined;
            return (
              <tr key={row.name}>
                {/* A row header, so `font-normal` has to be said out loud — the
                  * UA bolds every <th> and the name is not the emphasis here. */}
                <th scope="row" className={cn(TABLE_CELL, "font-normal")}>
                  {/* Long token names must wrap rather than force the table
                    * wide; break at the hyphens they are guaranteed to have. */}
                  <code className="font-mono text-[0.9em] text-primary-text break-words">
                    {row.name}
                  </code>
                </th>
                {declaredOn ? (
                  <td className={cn(TABLE_CELL, "whitespace-nowrap")}>
                    <code>
                      {component}.{row.part.charAt(0).toUpperCase() + row.part.slice(1)}
                    </code>
                  </td>
                ) : null}
                <td className={TABLE_CELL}>{inline(row.description)}</td>
                <td className={TABLE_CELL}>
                  <code className="wrap-anywhere">{row.value}</code>
                </td>
                {variantColumn ? (
                  <td className={TABLE_CELL}>
                    {variantValue ? (
                      <code className="wrap-anywhere">{variantValue}</code>
                    ) : (
                      <span aria-hidden="true">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The doc comments carry the same two inline markers the hand-written tables
 * used — `code` and *emphasis* — and nothing else on purpose: they are CSS
 * comments first, and anything richer belongs in the page's prose.
 */
export function inline(text: string): ReactNode {
  return text.split("`").map((chunk, i) =>
    i % 2 === 1 ? (
      <code key={i}>{chunk}</code>
    ) : (
      chunk.split(/\*([^*]+)\*/).map((part, j) =>
        j % 2 === 1 ? <em key={`${i}-${j}`}>{part}</em> : part,
      )
    ),
  );
}
