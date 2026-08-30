"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./NavList.module.css";

export type NavListSize = "sm" | "md" | "lg";
export type NavListMarker = "fill" | "rail";

type BaseGroupProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>;
type BaseGroupTriggerProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>;
type BaseGroupPanelProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>;

/* -------------------------------------------------------------------------
 * Section label wiring
 *
 * A `Section` is a `role="group"`, and a group is only announced if it has a
 * name. The name is the `SectionLabel` — but the label is an optional child
 * the section cannot see at render time, so it REGISTERS: the label reports
 * its id up through context, and the section writes `aria-labelledby` only
 * once a label has actually said it exists. Pointing at a hardcoded id
 * unconditionally would leave a dangling reference on every unlabelled
 * section, which audit tooling rightly flags.
 * ---------------------------------------------------------------------- */

const SectionLabelContext = React.createContext<
  ((id: string | undefined) => void) | null
>(null);

/* -------------------------------------------------------------------------
 * Icon
 *
 * Decorative: the open state is already on `aria-expanded`. A chevron
 * pointing DOWN that rotates 180°, not an inline-facing one rotating 90° —
 * rotation is physical and has no logical form, so the symmetric flip is the
 * one gesture that survives RTL without consulting `--forte-direction`.
 * ---------------------------------------------------------------------- */

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="m3.5 6 4.5 4.5L12.5 6" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface NavListRootProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "className"> {
  /**
   * Row height and text size for every link and group trigger inside.
   * @default "md"
   */
  size?: NavListSize;
  /**
   * How the current item is marked. `"fill"` is a tinted row. `"rail"` adds a
   * short accent bar along the row's inline-start edge on top of the fill —
   * the classic sidebar treatment, and a second, non-colour-only cue.
   * @default "fill"
   */
  marker?: NavListMarker;
  /**
   * Replaces the rendered `<nav>` with another element or component — pass
   * `render={<div />}` when the list sits inside a `<nav>` landmark you
   * already own, so the page does not grow a second one.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The list container. Renders a `<nav>` landmark.
 *
 * ```tsx
 * <NavList.Root aria-label="Documentation">
 *   <NavList.Section>
 *     <NavList.SectionLabel>Guides</NavList.SectionLabel>
 *     <NavList.List>
 *       <NavList.Item>
 *         <NavList.Link href="/intro" active>Introduction</NavList.Link>
 *       </NavList.Item>
 *     </NavList.List>
 *   </NavList.Section>
 * </NavList.Root>
 * ```
 *
 * Give it an `aria-label` (or `aria-labelledby`): a page routinely carries
 * more than one navigation landmark — a header, a sidebar, a table of
 * contents — and an unnamed one cannot be told from the others in a screen
 * reader's landmark list.
 *
 * Which item is current is the consumer's call, made per `Link` through its
 * `active` prop. The component deliberately does not read a router: matching
 * an href against a location is the app's business, and every framework does
 * it differently.
 */
export const NavListRoot = React.forwardRef<HTMLElement, NavListRootProps>(
  function NavListRoot(
    { size = "md", marker = "fill", render, className, ...props },
    ref,
  ) {
    return useRender({
      render,
      ref,
      defaultTagName: "nav",
      props: {
        className: clsx(styles.root, className),
        "data-forte": "nav-list",
        "data-size": size,
        "data-marker": marker,
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Section
 * ---------------------------------------------------------------------- */

export interface NavListSectionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One titled block of the list: a `SectionLabel` and a `List`. Renders a
 * `<div role="group">`, named by its label once one is present — which is
 * what lets a screen reader report "Components, group" instead of a run of
 * links with a stray line of text above them.
 *
 * Purely structural: sections do not collapse. For a block the reader can
 * fold away, use `NavList.Group` inside a `List` instead.
 */
export const NavListSection = React.forwardRef<HTMLDivElement, NavListSectionProps>(
  function NavListSection({ className, children, ...props }, ref) {
    const [labelId, setLabelId] = React.useState<string>();

    return (
      <SectionLabelContext.Provider value={setLabelId}>
        <div
          ref={ref}
          role="group"
          aria-labelledby={labelId}
          className={clsx(styles.section, className)}
          data-forte="nav-list-section"
          {...props}
        >
          {children}
        </div>
      </SectionLabelContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * SectionLabel
 * ---------------------------------------------------------------------- */

export interface NavListSectionLabelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The section's title. Renders a `<div>` — deliberately not a heading:
 * sidebars sit beside a document with its own outline, and a run of `<h2>`s
 * in the chrome would interleave with the page's real headings in a screen
 * reader's outline view. The enclosing `Section` picks the text up as its
 * accessible name instead, which conveys the same structure in the right
 * channel.
 */
export const NavListSectionLabel = React.forwardRef<
  HTMLDivElement,
  NavListSectionLabelProps
>(function NavListSectionLabel({ className, id: idProp, ...props }, ref) {
  const setLabelId = React.useContext(SectionLabelContext);
  const autoId = React.useId();
  const id = idProp ?? autoId;

  React.useEffect(() => {
    setLabelId?.(id);
    return () => setLabelId?.(undefined);
  }, [setLabelId, id]);

  return (
    <div
      ref={ref}
      id={id}
      className={clsx(styles.sectionLabel, className)}
      data-forte="nav-list-section-label"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

export interface NavListListProps
  extends Omit<React.ComponentPropsWithoutRef<"ul">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The `<ul>` holding the rows. A real list on purpose: screen readers
 * announce "list, N items", which is the count a reader wants before deciding
 * whether to walk it.
 *
 * Nest one inside a `GroupPanel` — or inside an `Item`, after its `Link` —
 * and it indents itself and draws the guide line. Depth is expressed by
 * nesting alone; there is no `level` prop to keep in sync with the markup.
 */
export const NavListList = React.forwardRef<HTMLUListElement, NavListListProps>(
  function NavListList({ className, ...props }, ref) {
    return (
      <ul
        ref={ref}
        className={clsx(styles.list, className)}
        data-forte="nav-list-list"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface NavListItemProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One row's `<li>`. Structural — the interactive element is the `Link` (or
 * `Group`) inside it. It exists as its own part rather than being fused into
 * `Link` so a row can hold more than a link: a link plus a nested `List` is
 * how a subtree with a navigable parent is written.
 */
export const NavListItem = React.forwardRef<HTMLLIElement, NavListItemProps>(
  function NavListItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={clsx(styles.item, className)}
        data-forte="nav-list-item"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Link
 * ---------------------------------------------------------------------- */

export interface NavListLinkProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "className"> {
  /**
   * Whether this row is where the reader currently is. Publishes
   * `data-active` for styling and `aria-current="page"`, so the cue is never
   * colour alone. For a same-page target — a table of contents — pass your
   * own `aria-current="location"` alongside it; an explicit value wins over
   * the derived one.
   * @default false
   */
  active?: boolean;
  /**
   * Disables the row. The default `<a>` drops its `href` (an anchor without
   * one is unfocusable and inert), `aria-disabled` is set, and clicks are
   * swallowed — which is also what covers an element supplied through
   * `render`, whose own `href` this component cannot remove.
   * @default false
   */
  disabled?: boolean;
  /**
   * Replaces the rendered `<a>` with another element or component —
   * `render={<Link href="/pricing" />}` is how a framework's router link goes
   * in without losing the row's styling and states.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The navigable row. Renders an `<a>`.
 *
 * Children lay out on a flex row, so an icon in front of the text and a
 * `NavList.Badge` after it need no wrapper — the badge floats itself to the
 * inline-end edge.
 */
export const NavListLink = React.forwardRef<HTMLAnchorElement, NavListLinkProps>(
  function NavListLink(
    { active = false, disabled = false, render, className, href, onClick, ...props },
    ref,
  ) {
    return useRender({
      render,
      ref,
      defaultTagName: "a",
      props: {
        className: clsx(styles.link, "forte-focus-ring", className),
        "data-forte": "nav-list-link",
        // Inset, always: the list's usual home is a scroll container hard
        // against the viewport edge, where an outset ring's leading side is
        // clipped off (SC 2.4.11).
        "data-focus-inset": "",
        "data-active": active ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "aria-current": active ? ("page" as const) : undefined,
        "aria-disabled": disabled || undefined,
        href: disabled ? undefined : href,
        ...props,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        },
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

export interface NavListGroupProps extends Omit<BaseGroupProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A collapsible subtree: a `GroupTrigger` and a `GroupPanel` holding a nested
 * `List`. Built on Base UI's `Collapsible`, so it takes the same state props —
 * `defaultOpen` uncontrolled, `open` plus `onOpenChange` controlled, and
 * `disabled`.
 *
 * Renders an `<li>` (via `render`, which you can still override), so it sits
 * in a `List` as a sibling of ordinary `Item`s.
 */
export const NavListGroup = React.forwardRef<HTMLLIElement, NavListGroupProps>(
  function NavListGroup({ className, render, ...props }, ref) {
    return (
      <BaseCollapsible.Root
        // Base UI types the ref for its default <div> even when `render`
        // swaps the element; ours renders an <li>, so the public prop type
        // stays honest and the widening happens here.
        ref={ref as React.Ref<HTMLDivElement>}
        className={clsx(styles.group, className)}
        data-forte="nav-list-group"
        render={render ?? <li />}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * GroupTrigger
 * ---------------------------------------------------------------------- */

export interface NavListGroupTriggerProps
  extends Omit<BaseGroupTriggerProps, "className"> {
  /**
   * Whether the reader is currently somewhere INSIDE this group — the cue
   * that keeps the current location visible while the group is closed over
   * it. Styling only (`data-active`): no `aria-current`, because the current
   * page is a link, and this is the button that reveals it.
   * @default false
   */
  active?: boolean;
  /**
   * The marker at the inline-end edge. Defaults to a chevron that rotates as
   * the panel opens. Pass your own node — it goes in the same rotating,
   * `aria-hidden` box — or `null` to drop it.
   * @default a chevron
   */
  icon?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The row that opens and closes its group. Renders a `<button>` styled like a
 * `Link`, carrying `aria-expanded` and an `aria-controls` pointing at the
 * panel.
 *
 * Keep the text as the accessible name — `aria-expanded` already announces
 * open and closed, so the label needs no "show/hide" of its own.
 */
export const NavListGroupTrigger = React.forwardRef<
  HTMLButtonElement,
  NavListGroupTriggerProps
>(function NavListGroupTrigger(
  { active = false, icon = <ChevronDownIcon />, className, children, ...props },
  ref,
) {
  return (
    <BaseCollapsible.Trigger
      ref={ref}
      className={clsx(styles.groupTrigger, "forte-focus-ring", className)}
      data-forte="nav-list-group-trigger"
      data-focus-inset=""
      data-active={active ? "" : undefined}
      {...props}
    >
      {/* The row is `justify-content: space-between`, so two loose children
        * would fly to opposite ends. The label box keeps icon-plus-text
        * reading as one word group, with the chevron alone at the far edge. */}
      <span className={styles.groupLabel} data-forte="nav-list-group-label">
        {children}
      </span>
      {icon === null ? null : (
        <span
          className={styles.groupIcon}
          data-forte="nav-list-group-icon"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </BaseCollapsible.Trigger>
  );
});

/* -------------------------------------------------------------------------
 * GroupPanel
 * ---------------------------------------------------------------------- */

export interface NavListGroupPanelProps
  extends Omit<BaseGroupPanelProps, "className"> {
  /**
   * Keep the panel in the DOM while closed. On by default — the opposite of
   * Base UI's — because these are NAVIGATION links: unmounted, they are
   * invisible to crawlers and to find-in-page, and a closed group is exactly
   * where the page a crawler wants usually is. `hidden` keeps the closed
   * copy out of the accessibility tree and the tab order either way.
   * @default true
   */
  keepMounted?: BaseGroupPanelProps["keepMounted"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The collapsible region under a `GroupTrigger` — put a `NavList.List` in it.
 * Base UI measures it and publishes `--collapsible-panel-height`, which the
 * stylesheet transitions.
 */
export const NavListGroupPanel = React.forwardRef<
  HTMLDivElement,
  NavListGroupPanelProps
>(function NavListGroupPanel(
  { keepMounted = true, className, children, ...props },
  ref,
) {
  return (
    <BaseCollapsible.Panel
      ref={ref}
      keepMounted={keepMounted}
      className={clsx(styles.groupPanel, className)}
      data-forte="nav-list-group-panel"
      {...props}
    >
      {/* The fade-and-settle runs on this box while the outer one is busy
        * animating its height — same split as Collapsible, minus the padding
        * (rows carry their own). */}
      <div className={styles.groupContent} data-forte="nav-list-group-content">
        {children}
      </div>
    </BaseCollapsible.Panel>
  );
});

/* -------------------------------------------------------------------------
 * Badge
 * ---------------------------------------------------------------------- */

export interface NavListBadgeProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A small pill at the row's inline-end edge — "New", "Beta", a count. Drop it
 * inside a `Link` or `GroupTrigger` after the text; `margin-inline-start:
 * auto` walks it to the far edge on its own.
 *
 * It reads in the row's flow, so a screen reader announces "Changelog, New" —
 * no extra wiring. Drawn from the secondary ramp rather than the accent, so
 * it stays legible sitting on the active row's accent fill.
 */
export const NavListBadge = React.forwardRef<HTMLSpanElement, NavListBadgeProps>(
  function NavListBadge({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={clsx(styles.badge, className)}
        data-forte="nav-list-badge"
        {...props}
      />
    );
  },
);

/**
 * A sidebar-style list of navigation links: titled sections, collapsible
 * groups, nested levels with a guide line, and a controlled notion of "where
 * you are".
 *
 * ```tsx
 * <NavList.Root aria-label="Documentation">
 *   <NavList.Section>
 *     <NavList.SectionLabel>Components</NavList.SectionLabel>
 *     <NavList.List>
 *       <NavList.Item>
 *         <NavList.Link href="/button" active>Button</NavList.Link>
 *       </NavList.Item>
 *       <NavList.Group defaultOpen>
 *         <NavList.GroupTrigger>Forms</NavList.GroupTrigger>
 *         <NavList.GroupPanel>
 *           <NavList.List>…</NavList.List>
 *         </NavList.GroupPanel>
 *       </NavList.Group>
 *     </NavList.List>
 *   </NavList.Section>
 * </NavList.Root>
 * ```
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-nav-list-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[active]:...`) without wrapping.
 */
export const NavList = {
  Root: NavListRoot,
  Section: NavListSection,
  SectionLabel: NavListSectionLabel,
  List: NavListList,
  Item: NavListItem,
  Link: NavListLink,
  Group: NavListGroup,
  GroupTrigger: NavListGroupTrigger,
  GroupPanel: NavListGroupPanel,
  Badge: NavListBadge,
};
