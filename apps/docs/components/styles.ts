/**
 * Class strings shared by more than one component.
 *
 * Not a dumping ground for every repeated utility — only the ones where two
 * components have to AGREE. Anything used once stays at its point of use, where
 * it can be read next to the markup it applies to.
 */

/**
 * The one table look, shared by the three things that render tables: the prop
 * table, the keyboard table, and any markdown table an MDX page writes
 * (mapped in `mdx-components.tsx`).
 *
 * They were three copies of the same declarations before, and one of them —
 * the markdown one — had quietly stopped being applied at all: the rules for
 * it lived in globals.css under a `.table` class that nothing had put on an
 * element in a long time, so every table in the component docs rendered as
 * bare browser default. Naming the strings is what makes that visible.
 */

/** The scroll container. A wide table scrolls inside its own border rather
 *  than handing the whole page a horizontal scrollbar. */
export const TABLE_WRAP = "my-4 overflow-x-auto rounded-surface border border-border-muted";

/** The table itself. The last row drops its rule so it does not double up on
 *  the wrapper's bottom border. */
export const TABLE = "w-full border-collapse text-2 [&_tbody_tr:last-child>*]:border-b-0";

/** A body cell. `align-top` matters once one column wraps to three lines and
 *  the others do not. */
export const TABLE_CELL = "border-b border-border-muted px-3 py-2 text-start align-top";

/** A header cell. */
export const TABLE_HEAD = `${TABLE_CELL} bg-panel font-semibold`;


/**
 * What every prose heading carries.
 *
 * The root's `scroll-padding-top` already clears the sticky app bar when a
 * #fragment lands on a heading (WCAG SC 2.4.11); the `scroll-mt-6` here is
 * only the breathing room under it — the two ADD. It is also what the section
 * rail reads back to decide which heading is current, so the two can never
 * disagree about where a section starts — see `components/toc.tsx`.
 */
export const HEADING = "scroll-mt-6 font-semibold";

/**
 * The h2, whole.
 *
 * Two things render one: `mdx-components.tsx`, for every `##` a page writes,
 * and `component-index.tsx`, whose category headings are JSX and so never pass
 * through that mapping. They have to agree on more than looks — the rail
 * measures `scroll-mt` off the heading itself, so an index heading missing it
 * would come to rest in a different place from every other heading on the site
 * and take the rail's idea of "current section" with it.
 */
export const PROSE_H2 = `${HEADING} mt-8 mb-3 text-6 tracking-tight`;

/**
 * A card that IS a link — the entry cards on the home page, and every card in
 * the component index.
 *
 * The anchor wraps the card rather than sitting inside it, so the whole surface
 * is the target and there is no dead border to miss by a pixel. The hover state
 * lives on the card and is driven by the anchor's `group` state, so the focus
 * ring stays on the anchor. `hover:` is already `@media (hover: hover)` in v4,
 * so a touch screen never sticks it on the last thing tapped.
 *
 * It also means nothing inside the card can be a link of its own: an `<a>`
 * inside an `<a>` is invalid, and the browser closes the outer one early rather
 * than nesting. The component index wanted exactly that — its summaries name
 * sibling components — and does without, which costs nothing, because every
 * component named in a summary has its own card on the same page.
 *
 * `text-foreground` on the anchor is not cosmetic. The site's link reset in
 * globals.css is `a:not(.forte-focus-ring) { color: inherit }` — it skips
 * anything carrying the ring class, on the assumption that such a link is a
 * library part painting its own colour. This one is not, so without the
 * class it kept the browser's default link colour, a lavender blue in dark
 * mode. Nothing visible reads it directly, but it IS the anchor's
 * `currentColor`, which is what any descendant's colour or border falls
 * back to the moment its own value fails to resolve — and that is exactly
 * what a palette switch showed: a lavender border on the cards for the
 * length of the cross-fade.
 *
 * The card deliberately carries no transition. It used to say so out loud,
 * with `transition-none`, because the palette cross-fade was a blanket
 * `transition` on `.themeTransition *` and the card's border would otherwise
 * restart a 400ms one every frame of the fade — chasing a target that had
 * moved again before it arrived, so the edge lagged everything it sits
 * against. That rule is now two properties on `:root` alone (globals.css
 * says why at length), `Card` declares no transition of its own, and the
 * border simply follows the seed.
 *
 * No geometry on hover either — motion rule 7 in AGENTS.md: hover is a colour
 * cue, lift is opt-in.
 */
export const LINK_CARD = "group block h-full rounded-surface text-foreground forte-focus-ring";
export const LINK_CARD_SURFACE = "h-full group-hover:border-primary-border";

/**
 * An icon inside one of the header's controls.
 *
 * The size is a class rather than the icon library's own `size` prop for the
 * reason every other measure on this site is a class: `size-4` is
 * `--forte-space-4`, and a `size={16}` would be a number nothing can re-theme.
 * `shrink-0` because these all sit in flex rows that are tight on a phone,
 * and a squashed icon reads as a rendering bug.
 *
 * `.forte-icon` is deliberately NOT part of this and must not be added: it sets
 * `fill: currentColor`, which is right for the solid glyphs the library's own
 * components draw and fatal for the stroked outlines lucide and react-icons
 * ship — a declaration beats their `fill="none"` attribute and the icon fills
 * in as a solid blob.
 */
export const ICON = "size-4 shrink-0";

/**
 * The uppercase micro-label: sidebar group titles, ramp captions, the Theme
 * Studio's section headings.
 *
 * The tracking is not decoration. Letter-spacing has to come back at this size
 * or a short uppercase phrase closes up and reads as one word.
 */
export const EYEBROW =
  "text-1 font-semibold uppercase tracking-[0.06em] text-foreground-subtle";

/**
 * The page title and standfirst.
 *
 * Two pages need them: every MDX page, through the element mapping in
 * `mdx-components.tsx`, and the Theme Studio, whose header is hand-written JSX
 * and so never passes through that mapping. Margins are deliberately absent —
 * the spacing below a title differs between the two and belongs to the page.
 */
export const PROSE_H1 =
  "text-[clamp(2rem,1.4rem_+_2vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.02em]";

export const LEAD = "text-4 leading-[1.6] text-foreground-muted text-pretty";

/**
 * The two outer columns of the shell: the nav on one side, the table of
 * contents on the other. They have to stay the same shape — any disagreement
 * about the sticky offset shows up as one column tucking under the app bar
 * while the other does not. The offset is the bar's own height token,
 * `--forte-app-bar-h-md`, read straight from the library — the site keeps no
 * copy of it.
 *
 * It lives in this module, and not in `sidebar.tsx` where it is mostly used,
 * because the root layout is a SERVER component and `sidebar.tsx` is
 * `"use client"`. A plain string exported across that boundary does not arrive
 * as a string: it arrives as a client-reference proxy, and interpolating it
 * into a className puts the text of a thrown error into the class attribute.
 * It fails silently in the DOM — the column simply stops being sticky.
 */
export const STICKY_COLUMN =
  "sticky top-(--forte-app-bar-h-md) max-h-[calc(100dvh-var(--forte-app-bar-h-md))] self-start overflow-y-auto py-6 [scrollbar-width:thin]";
