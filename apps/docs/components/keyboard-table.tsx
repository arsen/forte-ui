import styles from "./keyboard-table.module.css";

export type KeyRow = { keys: string[]; description: string };

/**
 * Keyboard interaction reference.
 *
 * Every interactive component gets one of these. Keyboard behaviour is the
 * part of an accessible component that is easiest to implement and easiest to
 * forget to document, and a reader cannot discover it by looking at a demo.
 */
export function KeyboardTable({ rows }: { rows: KeyRow[] }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="pui-visually-hidden">Keyboard interactions</caption>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Behaviour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.keys.join("+")}>
              <th scope="row" className={styles.keyCell}>
                {row.keys.map((k, i) => (
                  <span key={k}>
                    {i > 0 ? <span className={styles.sep}> then </span> : null}
                    <kbd className={styles.kbd}>{k}</kbd>
                  </span>
                ))}
              </th>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
