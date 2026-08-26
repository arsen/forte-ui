import { cn } from "@/lib/cn";
import { TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "./styles";

export type KeyRow = { keys: string[]; description: string };

/* A key cap. The heavier bottom border is the whole illusion — without it this
 * reads as an inline code chip, which is what it is not. */
const KBD =
  "inline-block rounded-2 border border-border border-b-2 bg-panel px-[0.45em] py-[0.1em] font-mono text-[0.85em] leading-[1.6]";

/**
 * Keyboard interaction reference.
 *
 * Every interactive component gets one of these. Keyboard behaviour is the
 * part of an accessible component that is easiest to implement and easiest to
 * forget to document, and a reader cannot discover it by looking at a demo.
 */
export function KeyboardTable({ rows }: { rows: KeyRow[] }) {
  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <caption className="pui-visually-hidden">Keyboard interactions</caption>
        <thead>
          <tr>
            <th scope="col" className={TABLE_HEAD}>Key</th>
            <th scope="col" className={TABLE_HEAD}>Behaviour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.keys.join("+")}>
              <th scope="row" className={cn(TABLE_CELL, "font-normal whitespace-nowrap")}>
                {row.keys.map((k, i) => (
                  <span key={k}>
                    {i > 0 ? (
                      <span className="text-[0.85em] text-foreground-muted"> then </span>
                    ) : null}
                    <kbd className={KBD}>{k}</kbd>
                  </span>
                ))}
              </th>
              <td className={TABLE_CELL}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
