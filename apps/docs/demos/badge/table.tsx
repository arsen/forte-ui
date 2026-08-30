"use client";

import { Badge } from "@dofortech/forte-ui";

const ROWS = [
  { id: "INV-2041", plan: "Scale", tone: "success", label: "Paid" },
  { id: "INV-2040", plan: "Team", tone: "warning", label: "Due today" },
  { id: "INV-2039", plan: "Team", tone: "danger", label: "Failed" },
  { id: "INV-2038", plan: "Starter", tone: "neutral", label: "Draft" },
] as const;

const cell = "border-b border-border-muted px-3 py-2 text-start align-middle";

export default function BadgeTable() {
  return (
    <div className="w-full overflow-x-auto rounded-surface border border-border-muted">
      <table className="w-full border-collapse text-2 [&_tbody_tr:last-child>*]:border-b-0">
        <thead>
          <tr>
            <th className={`${cell} bg-panel font-semibold`}>Invoice</th>
            <th className={`${cell} bg-panel font-semibold`}>Plan</th>
            <th className={`${cell} bg-panel font-semibold`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.id}>
              <td className={`${cell} font-mono text-1`}>{row.id}</td>
              <td className={cell}>{row.plan}</td>
              <td className={cell}>
                {/* `soft` down a whole column on purpose: four solid chips in
                  * a row out-shout the invoice numbers they annotate. */}
                <Badge tone={row.tone} size="sm" dot>
                  {row.label}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
