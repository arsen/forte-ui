"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import styles from "./Tabs.module.css";

export type TabsVariant = "line" | "pill";

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Root>;
type BaseListProps = React.ComponentPropsWithoutRef<typeof BaseTabs.List>;
type BaseTabProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
type BaseIndicatorProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

/**
 * The variant is chosen on `Tabs.Root` but has to reach List, Tab and
 * Indicator, which are the parts that actually paint it. Passing it through
 * context keeps the consumer-facing API to a single prop instead of five that
 * have to be kept in sync — and a mismatched pair (pill list, line indicator)
 * is not a state anyone wants to be able to express.
 */
const TabsVariantContext = React.createContext<TabsVariant>("line");

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface TabsRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Which indicator treatment the tab strip uses. `"line"` draws a rail with a
   * sliding underline; `"pill"` draws a filled pill that slides behind the
   * active tab. Both are the same indicator element moved by the same CSS
   * variables — only the geometry differs.
   * @default "line"
   */
  variant?: TabsVariant;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups the tab strip and its panels.
 *
 * Note the Base UI default: `defaultValue` is `0`, an *index*, not the first
 * tab's string value. With string values and no `defaultValue`, Base UI emits
 * an automatic `onValueChange` with reason `'initial'` to correct itself, so
 * always pass `defaultValue` (or `value`) pointing at an **enabled** tab —
 * during server rendering a disabled first tab is not skipped. `null` is a
 * legal "nothing active" value and is deliberately not normalised away.
 */
const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { variant = "line", className, children, ...props },
  ref,
) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root
        ref={ref}
        className={clsx(styles.root, className)}
        data-variant={variant}
        {...props}
      >
        {children}
      </BaseTabs.Root>
    </TabsVariantContext.Provider>
  );
});

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

export interface TabsListProps
  extends Omit<BaseListProps, "className" | "activateOnFocus" | "loopFocus"> {
  /**
   * Whether arrow-key focus also activates the tab it lands on. Left `false`
   * so arrow keys only move focus and activation happens on Enter or Space —
   * automatic activation loads every panel the user arrows past, which is
   * hostile when a panel fetches data.
   * @default false
   */
  activateOnFocus?: boolean;
  /**
   * Whether arrow-key focus wraps from the last tab back to the first.
   * @default true
   */
  loopFocus?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The tab strip. Must contain the `Indicator`, which is positioned against
 * this element — the stylesheet gives it `position: relative` for exactly that
 * reason.
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { activateOnFocus = false, loopFocus = true, className, children, ...props },
  ref,
) {
  const variant = React.useContext(TabsVariantContext);

  return (
    <BaseTabs.List
      ref={ref}
      className={clsx(styles.list, className)}
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      data-variant={variant}
      {...props}
    >
      {children}
    </BaseTabs.List>
  );
});

/* -------------------------------------------------------------------------
 * Tab
 * ---------------------------------------------------------------------- */

export interface TabsTabProps extends Omit<BaseTabProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One tab button. Its `value` must match the `value` of exactly one `Panel`;
 * that pairing is what wires up `aria-controls`/`aria-labelledby`, so both
 * sides are required.
 */
const TabsTab = React.forwardRef<HTMLElement, TabsTabProps>(function TabsTab(
  { className, children, ...props },
  ref,
) {
  const variant = React.useContext(TabsVariantContext);

  return (
    <BaseTabs.Tab
      ref={ref}
      className={clsx(styles.tab, "pui-focus-ring", className)}
      // The strip is a clipping context — a pill list has padding and a line
      // list can scroll — so the ring is flipped inward and cannot be cropped.
      data-focus-inset=""
      data-variant={variant}
      {...props}
    >
      {children}
    </BaseTabs.Tab>
  );
});

/* -------------------------------------------------------------------------
 * Indicator
 * ---------------------------------------------------------------------- */

export interface TabsIndicatorProps
  extends Omit<BaseIndicatorProps, "className" | "renderBeforeHydration"> {
  /**
   * Whether to emit a tiny inline script that positions the indicator before
   * React hydrates. Defaults to `true` here rather than Base UI's `false`:
   * without it a server-rendered tab strip shows no indicator at all until
   * hydration finishes, which reads as a broken selection.
   * @default true
   */
  renderBeforeHydration?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The sliding marker. Base UI publishes the active tab's geometry on this
 * element as `--active-tab-left` / `--active-tab-top` / `--active-tab-width` /
 * `--active-tab-height` (already px values, consumed directly, never wrapped
 * in `calc()` as raw numbers) and the stylesheet turns those into a `translate`
 * + size transition.
 *
 * Renders inside `Tabs.List`, never outside it.
 */
const TabsIndicator = React.forwardRef<HTMLSpanElement, TabsIndicatorProps>(
  function TabsIndicator({ renderBeforeHydration = true, className, ...props }, ref) {
    const variant = React.useContext(TabsVariantContext);

    return (
      <BaseTabs.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        renderBeforeHydration={renderBeforeHydration}
        data-variant={variant}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface TabsPanelProps extends Omit<BasePanelProps, "className" | "keepMounted"> {
  /**
   * Whether the panel stays in the DOM while hidden. Required if you want the
   * exit transition to play, or if the panel holds scroll position or
   * uncommitted form state that should survive a round trip.
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The content region for one tab. Base UI gives it `tabIndex={0}` so keyboard
 * users can reach the content directly after the strip — which is why it
 * carries the focus ring as well as the Tab does.
 */
const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { keepMounted = false, className, children, ...props },
  ref,
) {
  const variant = React.useContext(TabsVariantContext);

  return (
    <BaseTabs.Panel
      ref={ref}
      className={clsx(styles.panel, "pui-focus-ring", className)}
      keepMounted={keepMounted}
      data-variant={variant}
      {...props}
    >
      {children}
    </BaseTabs.Panel>
  );
});

/**
 * Tabs built on Base UI's unstyled `Tabs` primitive.
 *
 * ```tsx
 * <Tabs.Root defaultValue="overview" variant="pill">
 *   <Tabs.List>
 *     <Tabs.Tab value="overview">Overview</Tabs.Tab>
 *     <Tabs.Tab value="activity">Activity</Tabs.Tab>
 *     <Tabs.Indicator />
 *   </Tabs.List>
 *   <Tabs.Panel value="overview">…</Tabs.Panel>
 *   <Tabs.Panel value="activity">…</Tabs.Panel>
 * </Tabs.Root>
 * ```
 *
 * Arrow keys move focus along the strip; Enter or Space activates. Styling is
 * driven entirely by `data-*` attributes and `--pui-tabs-*` custom properties,
 * so it can be re-skinned from plain CSS or targeted with Tailwind arbitrary
 * variants (`data-[variant=pill]:...`) without wrapping.
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
};
