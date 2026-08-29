"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import { ScrollArea } from "../scroll-area";
import styles from "./Tabs.module.css";

export type TabsVariant = "line" | "pill";
export type TabsOverflow = "scroll" | "visible";

const useIsoLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Root>;
type BaseListProps = React.ComponentPropsWithoutRef<typeof BaseTabs.List>;
type BaseTabProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
type BaseIndicatorProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

/**
 * Two things chosen on `Tabs.Root` are acted on further down. `variant` has to
 * reach List, Tab and Indicator, which are the parts that actually paint it;
 * `overflow` decides whether `List` wraps itself in a `ScrollArea`. Passing
 * both through context keeps the consumer-facing API to two props on the root
 * instead of six spread across the parts that have to be kept in sync — and a
 * mismatched pair (pill list, line indicator) is not a state anyone wants to
 * be able to express.
 */
const TabsContext = React.createContext<{
  variant: TabsVariant;
  overflow: TabsOverflow;
}>({ variant: "line", overflow: "scroll" });

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
   * What a strip with more tabs than room does. `"scroll"` puts the tabs in a
   * `ScrollArea` that only engages once they stop fitting — the overflowing
   * end fades out, a swipe or a drag brings it back, and activating a tab
   * scrolls it into view. `"visible"` restores the plain flex row, which
   * spills out of its container instead; take it when the strip sits in a
   * layout that already handles the overflow.
   *
   * A vertical strip needs a height to scroll against: the scroller is capped
   * at the height of `Tabs.Root`, so give the root one (or a `max-height`) and
   * the strip scrolls beside a panel that does not.
   * @default "scroll"
   */
  overflow?: TabsOverflow;
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
  { variant = "line", overflow = "scroll", className, children, ...props },
  ref,
) {
  // Stable across renders unless one of the two actually changes, so a root
  // that sets neither never re-renders its subtree for this.
  const context = React.useMemo(() => ({ variant, overflow }), [variant, overflow]);

  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        ref={ref}
        className={clsx(styles.root, className)}
        data-pui="tabs"
        data-variant={variant}
        data-overflow={overflow}
        {...props}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
});

/* -------------------------------------------------------------------------
 * Keeping the active tab in view
 * ---------------------------------------------------------------------- */

const px = (value: string) => parseFloat(value) || 0;

/**
 * Scroll `viewport` the shortest distance that brings `tab` fully inside it.
 *
 * Deliberately not `tab.scrollIntoView({ inline: "nearest" })`, which walks
 * every scrollable ancestor: a tab strip halfway down a long page would scroll
 * the PAGE to itself on mount, and again on every tab click. Doing the
 * arithmetic here keeps the movement inside the strip, which is the only box
 * the reader asked to move.
 *
 * The clearance is read off the CSS rather than fixed, so the result matches
 * what the browser already does when the same tab is reached with the arrow
 * keys instead: `scroll-margin` on the tab — the stylesheet sets it from
 * `--pui-tabs-scroll-peek`, deliberately wider than the ScrollArea's fade so
 * the neighbouring tab stays partly painted instead of the strip looking as
 * though it ended — plus any `scroll-padding` a consumer has put on the
 * container.
 *
 * Every value here is physical: `getBoundingClientRect`, `scrollBy`, and the
 * physical sides `getComputedStyle` resolves the logical properties onto. That
 * is what makes RTL need no special case — unlike `scrollLeft`, whose origin
 * moves to the inline start and goes negative there.
 */
function scrollTabIntoView(
  viewport: HTMLElement,
  tab: HTMLElement,
  behavior: ScrollBehavior,
) {
  const view = viewport.getBoundingClientRect();
  const box = tab.getBoundingClientRect();
  const pad = getComputedStyle(viewport);
  const margin = getComputedStyle(tab);

  // Negative while the tab hangs off the start edge, positive while it hangs
  // off the end. The start is tested first, so a tab wider than the viewport
  // shows its beginning — where its label starts — rather than its end.
  const startX =
    box.left - px(margin.scrollMarginLeft) - (view.left + px(pad.scrollPaddingLeft));
  const endX =
    box.right + px(margin.scrollMarginRight) - (view.right - px(pad.scrollPaddingRight));
  const startY =
    box.top - px(margin.scrollMarginTop) - (view.top + px(pad.scrollPaddingTop));
  const endY =
    box.bottom + px(margin.scrollMarginBottom) - (view.bottom - px(pad.scrollPaddingBottom));

  const left = startX < 0 ? startX : Math.max(endX, 0);
  const top = startY < 0 ? startY : Math.max(endY, 0);

  // `scrollBy` clamps for us, so an overshoot at either end is not our problem.
  if (left !== 0 || top !== 0) viewport.scrollBy({ left, top, behavior });
}

/**
 * `smooth`, unless motion is suppressed.
 *
 * Read off `--pui-motion-ok` rather than
 * `matchMedia("(prefers-reduced-motion: reduce)")`, because the token carries
 * both the OS preference AND a `data-pui-motion="reduce"` scope — so the
 * in-page motion toggle turns this off along with everything else, which a
 * media query alone would not. It is registered as a `<number>`, so the
 * computed value is always exactly `"1"` or `"0"`.
 */
function scrollBehavior(element: HTMLElement): ScrollBehavior {
  return getComputedStyle(element).getPropertyValue("--pui-motion-ok").trim() === "0"
    ? "auto"
    : "smooth";
}

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
 *
 * Under the root's `overflow="scroll"` default it also wraps itself in a
 * `ScrollArea` and keeps the active tab inside it — see the two notes below.
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { activateOnFocus = false, loopFocus = true, className, children, ...props },
  ref,
) {
  const { variant, overflow } = React.useContext(TabsContext);

  // The box that scrolls is the ScrollArea's viewport, not the strip, so both
  // ends of the measurement need a ref. `viewportRef` is only ever attached on
  // the `scroll` branch, which is what makes every hook below inert under
  // `overflow="visible"` without any of them being conditional.
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const align = React.useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return;
    // Our own marker rather than `[data-active]` alone: that attribute is
    // generic enough that a consumer's own element inside a tab could carry
    // it, and the indicator would then be measured against the wrong box.
    const tab = list.querySelector<HTMLElement>('[data-pui="tabs-tab"][data-active]');
    if (tab) scrollTabIntoView(viewport, tab, behavior);
  }, []);

  // Before the first paint, and with no animation: a strip that scrolls itself
  // on load reads as a glitch rather than as a response, because the reader has
  // not asked for anything yet.
  useIsoLayoutEffect(() => {
    align("auto");
  }, [align]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return;

    /* Which tab is active is not something this component is ever told. Base UI
     * owns the value and it moves for reasons no prop of ours sees: a click, an
     * arrow key followed by Enter, a controlled `value` changed from outside,
     * and the automatic corrections Base UI makes when `defaultValue` names a
     * disabled or a missing tab. `data-active` in the DOM is the single place
     * all of them land, so that is what is watched — the alternative is a
     * second copy of Base UI's value resolution, living here, free to disagree
     * with the one that actually decides what is rendered. */
    const selection = new MutationObserver(() => align(scrollBehavior(viewport)));
    selection.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active"],
    });

    /* A strip that fitted a moment ago stops fitting when its column narrows,
     * and the active tab is then off the end with nothing having "changed".
     * Instant, never smooth: this fires on every frame of a drag-resize, and
     * animating each one would leave the strip permanently chasing the pointer.
     * Scrolling does not resize anything, so there is no loop to guard. */
    const resize = new ResizeObserver(() => align("auto"));
    resize.observe(viewport);

    return () => {
      selection.disconnect();
      resize.disconnect();
    };
  }, [align]);

  const list = (
    <BaseTabs.List
      ref={setRefs}
      className={clsx(styles.list, className)}
      data-pui="tabs-list"
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      data-variant={variant}
      {...props}
    >
      {children}
    </BaseTabs.List>
  );

  if (overflow !== "scroll") return list;

  /* A real `ScrollArea`, not an `overflow-x: auto` of our own, for the one
   * thing a bare scroll container cannot do: say that it scrolls. Its edge fade
   * is a MASK driven off Base UI's scroll-distance properties, so it opens as
   * the strip moves under it, closes flush at either end, and is correct on any
   * background — the cue a half-cropped tab does not give on its own. It also
   * brings `overscroll-behavior: contain`, so a sideways swipe at the end of
   * the strip does not drag the page with it, and a viewport Base UI makes
   * focusable only while there is in fact something to scroll.
   *
   * No `ScrollArea.Scrollbar`, deliberately. It overlays the content rather
   * than insetting it, so on a one-line strip it is painted across the bottom
   * of the tabs — over the rail in the `line` variant, which is the one place
   * a horizontal bar already means something — and reserving a strip to keep it
   * off them makes every scrollable tab set taller than every other one. Base
   * UI hides the native scrollbars on the viewport itself, so leaving the part
   * out is all it takes.
   *
   * No `data-pui` on these parts: rule 9 — a composed pretty-ui component tags
   * its own root, and consumers scope with a descendant selector. */
  return (
    <ScrollArea.Root className={styles.scroller}>
      <ScrollArea.Viewport ref={viewportRef}>
        {/* Content is sized to its content rather than stretched to the
          * viewport, which is what lets the nowrap row of `flex: 0 0 auto` tabs
          * overflow and scroll instead of being clipped — and `styles.content`
          * puts back the half of that a table box loses, so a strip that FITS
          * still fills the viewport. See the note on `.content`. */}
        <ScrollArea.Content className={styles.content}>{list}</ScrollArea.Content>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
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
  const { variant } = React.useContext(TabsContext);

  return (
    <BaseTabs.Tab
      ref={ref}
      className={clsx(styles.tab, "pui-focus-ring", className)}
      data-pui="tabs-tab"
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
    const { variant } = React.useContext(TabsContext);

    return (
      <BaseTabs.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        data-pui="tabs-indicator"
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
  const { variant } = React.useContext(TabsContext);

  return (
    <BaseTabs.Panel
      ref={ref}
      className={clsx(styles.panel, "pui-focus-ring", className)}
      data-pui="tabs-panel"
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
 * Arrow keys move focus along the strip; Enter or Space activates. A strip
 * with more tabs than room scrolls rather than spilling out of its container,
 * and activating a tab that is off the edge brings it into view — set
 * `overflow="visible"` on `Tabs.Root` to opt out. Styling is driven entirely by
 * `data-*` attributes and `--pui-tabs-*` custom properties, so it can be
 * re-skinned from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[variant=pill]:...`) without wrapping.
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
};
