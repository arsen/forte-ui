import { cn } from "@/lib/cn";
import { STICKY_COLUMN } from "./styles";
import { NavLinks } from "./nav";

/**
 * The page list — the shell's left column.
 *
 * The list itself lives in `nav.tsx`, because the navigation DRAWER renders
 * the same one below `--breakpoint-nav`, where this column is gone.
 */
export function Sidebar() {
  return (
    <aside className={cn(STICKY_COLUMN, "max-nav:hidden")}>
      <NavLinks />
    </aside>
  );
}
