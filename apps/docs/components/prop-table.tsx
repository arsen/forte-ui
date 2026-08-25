import props from "@dofortech/pretty-ui/docs-data/props.json";
import styles from "./prop-table.module.css";

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
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="pui-visually-hidden">Props for {component}</caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row" className={styles.nameCell}>
                <code>{row.name}</code>
                {row.required ? <span className={styles.required} title="Required">*</span> : null}
              </th>
              <td><code className={styles.type}>{row.type}</code></td>
              <td>{row.defaultValue ? <code>{row.defaultValue}</code> : <span aria-hidden="true">—</span>}</td>
              <td>{row.description || <span aria-hidden="true">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
