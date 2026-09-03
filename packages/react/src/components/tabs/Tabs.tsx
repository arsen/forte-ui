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
 * Three things chosen on `Tabs.Root` are acted on further down. `variant` has
 * to reach List, Tab and Indicator, which are the parts that actually paint
 * it; `overflow` decides whether `List` wraps itself in a `ScrollArea`; and
 * `orientation` — Base UI's own prop, passed through untouched — is repeated
 * here because that `ScrollArea` needs it too, to scroll on the strip's axis
 * only. Passing them through context keeps the consumer-facing API to props
 * on the root instead of copies spread across the parts that have to be kept
 * in sync — and a mismatched pair (pill list, line indicator; a vertical
 * strip scrolling sideways) is not a state anyone wants to be able to
 * express.
 */
const TabsContext = React.createContext<{
  variant: TabsVariant;
  overflow: TabsOverflow;
  orientation: "horizontal" | "vertical";
}>({ variant: "line", overflow: "scroll", orientation: "horizontal" });

/* -------------------------------------------------------------------------
 * Auto height
 * ---------------------------------------------------------------------- */

/** The active panel's measured height, consumed by the root's panel track. */
const AUTO_HEIGHT = "--forte-tabs-auto-height";

/* The panel that is actually in flow.
 *
 * `inert` is the marker rather than `hidden` or `data-ending-style` because it
 * is derived straight from the active value while the panel renders — Base UI
 * writes `inert` on every panel it is not showing, which is both the ones held
 * back by `keepMounted` and the outgoing one on its way out — so it cannot
 * disagree with what is on screen, and one selector covers all of them.
 *
 * Scoped to direct children, and that part is load-bearing: a nested tab set's
 * own panel is not inert either, and it would be found FIRST, because it sits
 * inside the outgoing panel and the outgoing panel precedes the incoming one in
 * document order. The docs' own demo frame is a tab set with a tab set in it. */
const IN_FLOW_PANEL = ':scope > [data-forte="tabs-panel"]:not([inert])';

/**
 * How long the root's height transition runs, in ms.
 *
 * Read off the element rather than off the token so everything already folded
 * into the computed value stays folded in: the in-page motion toggle, a subtree
 * `data-forte-motion`, and a consumer's own override of the duration knob.
 * Under reduced motion `--forte-duration-move` is 1ms, so the clip below is
 * released about as soon as it is applied — which is correct, since there is no
 * longer an animation for it to hide.
 */
function resizeDuration(element: HTMLElement) {
  return Math.max(
    0,
    ...getComputedStyle(element)
      .transitionDuration.split(",")
      .map((value) => parseFloat(value) * 1000 || 0),
  );
}

/**
 * Size the panel track to the active panel, so switching to a taller or shorter
 * panel grows or shrinks the component instead of snapping.
 *
 * The measurement is written to the ROOT, and that is the whole design. The
 * panel is a different element on every switch — Base UI unmounts the outgoing
 * one unless `keepMounted` is set — and a transition never runs on an element's
 * first computed style, so a height animated on the panel would simply not
 * play. The root is the one box that survives the switch, and its
 * `grid-template-rows` interpolates track by track as long as only the
 * `<length>` ones differ: the strip's `auto` track passes through untouched
 * while the panel's track travels.
 *
 * What is measured is the panel's own natural height, never the root's. The
 * stylesheet composes the rest — strip, gap, padding — for free, and reading a
 * value the transition does not own is what lets a measurement land mid-flight
 * without disturbing the transition already running. `align-self: start` under
 * `[data-auto-height]` is what keeps that reading honest: a stretched panel
 * would report the track it was just given rather than the height it wants, and
 * the ResizeObserver below would never fire again, because a box pinned to the
 * track does not change size when the content inside it does.
 */
function useAutoHeight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  orientation: "horizontal" | "vertical",
) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    /* Vertical puts the strip in the SAME row as the panel, so the row is the
     * taller of the two. Measuring the panel alone there would shrink the row
     * under a strip that is longer than the panel — and, because the scroller
     * is capped at the row, put that strip into a scroll it does not need. */
    const strip =
      orientation === "vertical"
        ? root.querySelector<HTMLElement>('[data-forte="tabs-list"]')
        : null;

    let panel: HTMLElement | null = null;
    let timer = 0;

    const measure = () => {
      const height = Math.max(panel?.offsetHeight ?? 0, strip?.offsetHeight ?? 0);

      /* A panel that measures nothing while it has no offset parent is not an
       * empty panel, it is a panel nobody is laying out — the whole tab set is
       * under a `display: none`, which is where a kept-mounted panel of some
       * OTHER component puts it. Writing that 0 would collapse the track, and
       * the tab set would then animate itself open the first time it is shown,
       * on top of whatever enter transition the thing revealing it is already
       * playing. Leaving the property alone means the first measurement that
       * can see anything is the one that lands, with nothing to travel from.
       * An empty panel that IS laid out still measures 0 and still collapses
       * the track, which is what it should do. */
      if (height === 0 && panel && panel.offsetParent === null) return;

      const next = `${height}px`;
      const previous = root.style.getPropertyValue(AUTO_HEIGHT);
      if (previous === next) return;
      root.style.setProperty(AUTO_HEIGHT, next);

      /* Clip, but only while a GROWING track is behind its content, and only
       * for as long as that takes.
       *
       * A growing track is shorter than the panel standing in it for the length
       * of the transition, and an unclipped panel spills its content over
       * whatever the page puts under the tabs. A shrinking one never does: the
       * incoming panel is already the smaller height before the track starts
       * traveling, and the outgoing panel is out of flow and at `opacity: 0`
       * within a millisecond.
       *
       * Permanent would be the easy version and it is the wrong one. The panel
       * has no padding of its own by default, so a card filling it sits flush
       * against the root's edges and a clip that outlives the animation cuts the
       * card's shadow off on every side — plus the focus ring of anything
       * against the panel's edge, and a strip left spilling on purpose with
       * `overflow="visible"`. None of that is worth paying for at rest, when
       * the track is exactly the height of the panel and there is nothing to
       * clip in the first place.
       *
       * `previous` empty is the first measurement of this tab set: there is no
       * old height to travel from, so nothing is mid-flight and nothing spills. */
      if (previous && height > parseFloat(previous)) {
        root.setAttribute("data-resizing", "");
        window.clearTimeout(timer);
        timer = window.setTimeout(
          () => root.removeAttribute("data-resizing"),
          resizeDuration(root),
        );
      }
    };

    /* The panel's own box, which stays at its natural height (see above), so
     * this fires for content that arrives after the switch — an image that has
     * loaded, a fetch that has resolved, a disclosure the reader opened — and
     * the track follows it with the same transition. In the vertical case the
     * strip is measured too, since it shares the row. */
    const resize = new ResizeObserver(measure);
    if (strip) resize.observe(strip);

    /* Which panel is in flow is not something this component is ever told: Base
     * UI owns the value, and it moves for reasons no prop of ours sees. The DOM
     * is where all of them land, so that is what is watched — the same bargain
     * `Tabs.List` makes to keep the active tab scrolled into view.
     *
     * `subtree` is on because the attribute that flips is the panels' and not
     * the root's, and it costs nothing: the callback is one direct-child query
     * and an identity check, so the extra calls a busy panel generates return
     * before doing any work. Content that changes SIZE is the ResizeObserver's
     * business, not this one's. */
    const sync = () => {
      const next = root.querySelector<HTMLElement>(IN_FLOW_PANEL);
      if (next === panel) return;
      if (panel) resize.unobserve(panel);
      panel = next;
      if (panel) resize.observe(panel);
      measure();
    };

    sync();
    const switches = new MutationObserver(sync);
    switches.observe(root, {
      childList: true,
      subtree: true,
      attributeFilter: ["inert"],
    });

    return () => {
      switches.disconnect();
      resize.disconnect();
      window.clearTimeout(timer);
      root.style.removeProperty(AUTO_HEIGHT);
      root.removeAttribute("data-resizing");
    };
  }, [rootRef, enabled, orientation]);
}

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
   * Whether the component animates between panel heights. Off by default: the
   * panel area snaps to whatever the new panel needs, which is what a tab set
   * has always done and what a page of equal-height panels should keep doing.
   *
   * Turn it on when the panels differ in height enough for the switch to look
   * like a jump. The track is sized from the active panel and transitioned, and
   * it keeps following that panel afterwards — content that arrives late, an
   * image that has loaded or a disclosure the reader opened, moves the height
   * with the same transition rather than snapping.
   *
   * Two things change while it is on. The panel is aligned to the start of its
   * track rather than stretched, so it no longer fills a `Tabs.Root` that has
   * been given a height of its own; and the component clips itself for the
   * length of a *growing* transition, so anything a panel deliberately paints
   * outside its own box is cut off for those frames.
   * @default false
   */
  autoHeight?: boolean;
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
 * legal "nothing active" value and is deliberately not normalized away.
 */
const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { variant = "line", overflow = "scroll", autoHeight = false, className, children, ...props },
  ref,
) {
  // Base UI owns `orientation` and defaults it to "horizontal"; the default is
  // restated here only because the context needs the resolved value before
  // Base UI sees the prop.
  const orientation = props.orientation ?? "horizontal";

  // The root is the element the panel track is measured onto, so the component
  // needs its own handle on it whether or not the consumer asked for one.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useAutoHeight(rootRef, autoHeight, orientation);

  // Stable across renders unless one of the three actually changes, so a root
  // that sets none of them never re-renders its subtree for this.
  const context = React.useMemo(
    () => ({ variant, overflow, orientation }),
    [variant, overflow, orientation],
  );

  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        ref={setRefs}
        className={clsx(styles.root, className)}
        data-forte="tabs"
        data-variant={variant}
        data-overflow={overflow}
        data-auto-height={autoHeight ? "" : undefined}
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
 * `--forte-tabs-scroll-peek`, deliberately wider than the ScrollArea's fade so
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
 * Read off `--forte-motion-ok` rather than
 * `matchMedia("(prefers-reduced-motion: reduce)")`, because the token carries
 * both the OS preference AND a `data-forte-motion="reduce"` scope — so the
 * in-page motion toggle turns this off along with everything else, which a
 * media query alone would not. It is registered as a `<number>`, so the
 * computed value is always exactly `"1"` or `"0"`.
 */
function scrollBehavior(element: HTMLElement): ScrollBehavior {
  return getComputedStyle(element).getPropertyValue("--forte-motion-ok").trim() === "0"
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
  const { variant, overflow, orientation } = React.useContext(TabsContext);

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
    const tab = list.querySelector<HTMLElement>('[data-forte="tabs-tab"][data-active]');
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
      data-forte="tabs-list"
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
   * No `data-forte` on these parts: rule 9 — a composed forte-ui component tags
   * its own root, and consumers scope with a descendant selector.
   *
   * `orientation` is the strip's own axis: it turns the viewport's other axis
   * off, so a wheel gesture across the strip — vertical, over horizontal
   * tabs — scrolls the page instead of rubber-banding a viewport that has
   * nothing to scroll that way. */
  return (
    <ScrollArea.Root className={styles.scroller} orientation={orientation}>
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
      className={clsx(styles.tab, "forte-focus-ring", className)}
      data-forte="tabs-tab"
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
        data-forte="tabs-indicator"
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
      className={clsx(styles.panel, "forte-focus-ring", className)}
      data-forte="tabs-panel"
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
 * `overflow="visible"` on `Tabs.Root` to opt out. Panels of different heights
 * snap from one to the next; `autoHeight` transitions between them instead.
 * Styling is driven entirely by `data-*` attributes and `--forte-tabs-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[variant=pill]:...`) without wrapping.
 *
 * @summary Switches between panels of related content in the same place, with
 *   a sliding active indicator.
 * @category Navigation
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
};
