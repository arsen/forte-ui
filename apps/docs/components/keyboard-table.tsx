import { Kbd } from "@forte-ui/react";
import { cn } from "@/lib/cn";
import { TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "./styles";

export type KeyRow = { keys: string[]; description: string };

/**
 * Keyboard interaction reference.
 *
 * Every interactive component gets one of these. Keyboard behavior is the
 * part of an accessible component that is easiest to implement and easiest to
 * forget to document, and a reader cannot discover it by looking at a demo.
 */
export function KeyboardTable({ rows }: { rows: KeyRow[] }) {
  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <caption className="forte-visually-hidden">Keyboard interactions</caption>
        <thead>
          <tr>
            <th scope="col" className={TABLE_HEAD}>Key</th>
            <th scope="col" className={TABLE_HEAD}>Behavior</th>
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
                    <Kbd>{k}</Kbd>
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
