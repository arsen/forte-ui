import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Bot, Palette, Paintbrush, Rocket, Zap } from "lucide-react";
import { CardRoot, CardHeader, CardTitle, CardDescription } from "@forte-ui/react";
import { cn } from "@/lib/cn";

/**
 * The "start here" row: one card per place a new reader might want to go.
 *
 * The cards are hand-picked rather than the whole nav — a landing page that
 * repeats the sidebar is a sidebar. Six, because the grid is three across
 * on a laptop and two on a tablet, and six is the first count that fills
 * both without a dangling card — which is why the columns are fixed steps
 * rather than `auto-fit`: a fourth column at desktop width would leave two.
 */
const ENTRIES: { title: string; body: string; href: string; icon: LucideIcon }[] = [
  {
    title: "Introduction",
    body: "What the library is, the three decisions behind it, and the two lines that get a themed component on screen.",
    href: "/getting-started/introduction/",
    icon: BookOpen,
  },
  {
    title: "Next.js",
    body: "From create-next-app to a themed component, with and without Tailwind.",
    href: "/getting-started/nextjs/",
    icon: Rocket,
  },
  {
    title: "Vite",
    body: "The same walkthrough for a Vite app, including the one line Vite's CSS pipeline needs.",
    href: "/getting-started/vite/",
    icon: Zap,
  },
  {
    title: "AI agents",
    body: "Point a coding agent at the component catalogue the package ships, so it picks the right part first time.",
    href: "/getting-started/ai-agents/",
    icon: Bot,
  },
  {
    title: "Theming",
    body: "The seed, the ramp it derives, and the scopes that let one page carry two themes.",
    href: "/customization/theming/",
    icon: Paintbrush,
  },
  {
    title: "Theme Studio",
    body: "Pick a colour, a font and a radius, watch the site rebuild, and export the CSS.",
    href: "/theme/",
    icon: Palette,
  },
];

/* A card that IS a link. The anchor wraps the card rather than sitting inside
 * it, so the whole surface is the target and there is no dead border to miss
 * by a pixel. The hover lift lives on the card and is driven by the anchor's
 * `group` state, so the focus ring — on the anchor — stays put while the
 * card moves. `hover:` is already `@media (hover: hover)` in v4, so a touch
 * screen never sticks the lift on the last thing tapped; the travel token
 * collapses to 0px under reduced motion on its own. */
export const LINK_CARD = "group block h-full rounded-surface forte-focus-ring";
export const LINK_CARD_SURFACE = cn(
  "h-full transition-[border-color,translate] duration-fast ease-standard",
  "group-hover:-translate-y-(--forte-travel-xs) group-hover:border-primary-border",
);

export function EntryCards() {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {ENTRIES.map(({ title, body, href, icon: Icon }) => (
        <li key={href}>
          <Link href={href} className={LINK_CARD}>
            <CardRoot className={LINK_CARD_SURFACE}>
              <CardHeader>
                <CardTitle>
                  <h3 className="flex items-center gap-2">
                    {/* The icon is a glyph for the title beside it, not
                      * content of its own; `size-5` is the space token
                      * rather than the library's numeric `size` prop. */}
                    <Icon className="size-5 shrink-0 text-primary-text" aria-hidden="true" />
                    {title}
                  </h3>
                </CardTitle>
                <CardDescription className="text-pretty">{body}</CardDescription>
              </CardHeader>
            </CardRoot>
          </Link>
        </li>
      ))}
    </ul>
  );
}
