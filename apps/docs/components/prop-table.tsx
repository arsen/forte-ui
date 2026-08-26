import props from "@dofortech/pretty-ui/docs-data/props.json";
import { cn } from "@/lib/cn";
import { TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "./styles";

type PropRow = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

type PropData = Record<string, { name: string; description: string; props: PropRow[] }>;

const DATA = props as PropData;

/**
 * Renders the prop table for a component straight from the library's
 * TypeScript source.
 *
 * Nothing here is hand-maintained: `packages/ui/scripts/docgen.mjs` reads the
 * real types and JSDoc at build time, so a renamed prop or a changed default
 * updates the docs automatically instead of silently going stale.
 */
export function PropTable({ component, only }: { component: string; only?: string[] }) {
  const entry = DATA[component];
  if (!entry) {
    throw new Error(
      `No generated prop data for "${component}". Known: ${Object.keys(DATA).join(", ")}`,
    );
  }
  const rows = only ? entry.props.filter((p) => only.includes(p.name)) : entry.props;

  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <caption className="pui-visually-hidden">Props for {component}</caption>
        <thead>
          <tr>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Prop</th>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Type</th>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Default</th>
            <th scope="col" className={cn(TABLE_HEAD, "whitespace-nowrap")}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              {/* A row header, so `font-normal` has to be said out loud — the
                * UA bolds every <th> and the name is not the emphasis here. */}
              <th
                scope="row"
                className={cn(TABLE_CELL, "font-normal whitespace-nowrap")}
              >
                <code className="font-mono text-[0.9em] text-primary-text">{row.name}</code>
                {row.required ? (
                  <span className="ms-[2px] text-danger-text" title="Required">*</span>
                ) : null}
              </th>
              <td className={TABLE_CELL}>
                {/* Long unions must wrap rather than force the whole table
                  * wide, and they break at no natural point — hence anywhere. */}
                <code className="font-mono text-[0.85em] text-foreground-muted wrap-anywhere">
                  {row.type}
                </code>
              </td>
              <td className={TABLE_CELL}>
                {row.defaultValue ? <code>{row.defaultValue}</code> : <span aria-hidden="true">—</span>}
              </td>
              <td className={TABLE_CELL}>{row.description || <span aria-hidden="true">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
