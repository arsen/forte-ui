/**
 * `cn` — merge class lists, last writer wins, pre-configured for the bridge.
 * ---------------------------------------------------------------------------
 *   import { cn } from "@forte-ui/react/cn";
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
 * An app that adds its own `@theme` keys cannot use the bare `cn` — a helper
 * that does not know a name never merges it — but does not have to rebuild
 * the config either:
 *
 *   export const cn = createCn({
 *     extend: { theme: { spacing: ["header"], animate: ["reveal"] } },
 *   });
 *
 * The extension goes through tailwind-merge's `mergeConfigs`, whose `extend`
 * APPENDS to a scale rather than replacing it — `spacing: ["header"]` lands
 * beside the library's `surface`, not instead of it. That is the reason this
 * factory exists: hand-spreading `tailwindMergeConfig` into your own
 * `extendTailwindMerge` call works too, but one forgotten spread silently
 * drops a library scale, and `p-surface` stops merging with nothing to say
 * why.
 */
import { clsx, type ClassValue } from "clsx";
import {
  extendTailwindMerge,
  mergeConfigs,
  type ConfigExtension,
} from "tailwind-merge";
import { tailwindMergeConfig } from "./tailwind-merge";

/**
 * Build a `cn` that knows the bridge's scales plus your own additions.
 * Accepts the same `{ extend, override }` shape as tailwind-merge itself.
 */
export function createCn(extension?: ConfigExtension<string, string>) {
  const twMerge = extension
    ? extendTailwindMerge(tailwindMergeConfig, (config) =>
        mergeConfigs(config, extension),
      )
    : extendTailwindMerge(tailwindMergeConfig);
  return (...inputs: ClassValue[]) => twMerge(clsx(inputs));
}

export const cn = createCn();
