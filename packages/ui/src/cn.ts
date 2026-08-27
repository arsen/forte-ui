/**
 * `cn` — merge class lists, last writer wins, pre-configured for the bridge.
 * ---------------------------------------------------------------------------
 *   import { cn } from "@dofortech/pretty-ui/cn";
 *
 *   cn("p-4", condition && "p-6")   // -> "p-6" when condition holds
 *
 * `clsx` flattens conditionals; `tailwind-merge` resolves conflicts so the
 * last class actually wins instead of both surviving and the cascade
 * deciding. It is pre-configured with `tailwindMergeConfig`, because a stock
 * `twMerge` silently mishandles the bridge's renamed scales — see the header
 * of `./tailwind-merge` for the failure modes.
 *
 * This subpath is the reason `tailwind-merge` is an OPTIONAL peer dependency:
 * importing it requires tailwind-merge to be installed, while apps that skip
 * Tailwind (or bring their own merger) never pay for it. `clsx` ships with
 * the package either way.
 *
 * If your app adds its own `@theme` keys, do not use this `cn` — a helper
 * that does not know your names cannot merge them. Build your own from the
 * config instead, spreading your keys into its arrays the way
 * `tailwind-merge.ts`'s header shows.
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { tailwindMergeConfig } from "./tailwind-merge";

const twMerge = extendTailwindMerge(tailwindMergeConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
