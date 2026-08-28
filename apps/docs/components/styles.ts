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
 * An icon inside one of the header's controls.
 *
 * The size is a class rather than the icon library's own `size` prop for the
 * reason every other measure on this site is a class: `size-4` is
 * `--pui-space-4`, and a `size={16}` would be a number nothing can re-theme.
 * `shrink-0` because these all sit in flex rows that are tight on a phone,
 * and a squashed icon reads as a rendering bug.
 *
 * `.pui-icon` is deliberately NOT part of this and must not be added: it sets
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
 * about the sticky offset shows up as one column tucking under the header
 * while the other does not.
 *
 * It lives in this module, and not in `sidebar.tsx` where it is mostly used,
 * because the root layout is a SERVER component and `sidebar.tsx` is
 * `"use client"`. A plain string exported across that boundary does not arrive
 * as a string: it arrives as a client-reference proxy, and interpolating it
 * into a className puts the text of a thrown error into the class attribute.
 * It fails silently in the DOM — the column simply stops being sticky.
 */
export const STICKY_COLUMN =
  "sticky top-header max-h-[calc(100dvh-var(--spacing-header))] self-start overflow-y-auto py-6 [scrollbar-width:thin]";
