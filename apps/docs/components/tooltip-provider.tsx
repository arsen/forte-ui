"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@dofortech/forte-ui";

/**
 * A real client component wrapping Tooltip.Provider.
 *
 * Re-exporting the `Tooltip` namespace from a "use client" module is NOT
 * enough: a compound namespace cannot cross the RSC boundary. The server
 * layout would receive a client-reference proxy and `Tooltip.Provider` would
 * read as `undefined` — which surfaces as "Element type is invalid", with no
 * hint about which element. The property access has to happen INSIDE the
 * client module, so the layout only ever imports a plain function.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <Tooltip.Provider>{children}</Tooltip.Provider>;
}
