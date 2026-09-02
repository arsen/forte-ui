import { EYEBROW } from "./styles";
import { cn } from "@/lib/cn";

/**
 * One twelve-step colour ramp, as a strip of swatches.
 *
 * `name` is the token family — `accent`, `secondary`, `gray` — and each cell
 * paints `var(--forte-<name>-<n>)`, so the strip is a live readout of the
 * ramp as the page currently resolves it: change the seed and it recolours.
 * It is a `role="img"` with one label rather than twelve, because the
 * information is the gradient, not any single step.
 */
export function Ramp({ name, label }: { name: string; label: string }) {
  return (
    <div className="grid gap-2">
      <p className={cn(EYEBROW, "m-0")}>{label}</p>
      <div
        className="grid h-8 grid-cols-12 gap-[2px] overflow-hidden rounded-3"
        role="img"
        aria-label={`${label}: twelve steps`}
      >
        {Array.from({ length: 12 }, (_, i) => (
          // Colour is the entire content of a swatch — keep it in forced-colors.
          <span
            key={i}
            className="block [forced-color-adjust:none]"
            style={{ background: `var(--forte-${name}-${i + 1})` }}
          />
        ))}
      </div>
    </div>
  );
}
