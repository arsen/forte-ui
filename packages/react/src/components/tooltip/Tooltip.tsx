"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import { Kbd, type KbdProps } from "../kbd";
import styles from "./Tooltip.module.css";

/* -------------------------------------------------------------------------
 * Provider
 * ---------------------------------------------------------------------- */

export interface TooltipProviderProps extends BaseTooltip.Provider.Props {
  /**
   * How long to wait before opening a tooltip, in milliseconds. Applies to
   * every tooltip below this provider; an individual `Tooltip.Trigger` can
   * still override it.
   * @default 600
   */
  delay?: BaseTooltip.Provider.Props["delay"];
  /**
   * How long to wait before closing a tooltip, in milliseconds.
   * @default 0
   */
  closeDelay?: BaseTooltip.Provider.Props["closeDelay"];
  /**
   * Grouping window, in milliseconds. If one tooltip closes and another opens
   * within this window, the second one appears instantly instead of waiting
   * out `delay` again — which is what makes a row of icon buttons feel like a
   * single toolbar rather than a series of separate waits.
   * @default 400
   */
  timeout?: BaseTooltip.Provider.Props["timeout"];
  /**
   * The subtree that shares this delay.
   */
  children?: BaseTooltip.Provider.Props["children"];
}

/**
 * Shares one hover delay across every tooltip beneath it. Renders no DOM
 * element.
 *
 * Mount it once near the root of the app. Without it each tooltip waits out
 * its own delay, so sweeping across a toolbar feels sticky.
 */
function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />;
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface TooltipRootProps<Payload = unknown>
  extends BaseTooltip.Root.Props<Payload> {
  /**
   * Whether the tooltip is open when it first mounts. For a controlled
   * tooltip use `open` instead.
   * @default false
   */
  defaultOpen?: BaseTooltip.Root.Props<Payload>["defaultOpen"];
  /**
   * Whether the tooltip is currently open. Pass this together with
   * `onOpenChange` to control the tooltip.
   */
  open?: BaseTooltip.Root.Props<Payload>["open"];
  /**
   * Called when the tooltip wants to open or close. The second argument
   * carries the reason (`'trigger-hover'`, `'trigger-focus'`,
   * `'trigger-press'`, `'outside-press'`, `'escape-key'`, `'disabled'`,
   * `'imperative-action'`, `'none'`) and can `cancel()` the change.
   */
  onOpenChange?: BaseTooltip.Root.Props<Payload>["onOpenChange"];
  /**
   * Called after the open or close transition has finished. Use this rather
   * than a timer when work has to wait for the popup to actually leave.
   */
  onOpenChangeComplete?: BaseTooltip.Root.Props<Payload>["onOpenChangeComplete"];
  /**
   * Whether this tooltip is disabled. Disables the tooltip only — the trigger
   * element stays fully interactive and does not receive the `disabled`
   * attribute.
   * @default false
   */
  disabled?: BaseTooltip.Root.Props<Payload>["disabled"];
  /**
   * Which axis the tooltip follows the cursor on. `'both'` turns it into a
   * cursor-tracking label; combine with `side="bottom"` for the usual feel.
   * @default "none"
   */
  trackCursorAxis?: BaseTooltip.Root.Props<Payload>["trackCursorAxis"];
  /**
   * Whether the popup can be hovered without closing. Off by default: a
   * tooltip is not meant to hold interactive content, and a hoverable popup
   * gets in the way of the content beneath it.
   * @default false
   */
  disableHoverablePopup?: BaseTooltip.Root.Props<Payload>["disableHoverablePopup"];
  /**
   * Imperative escape hatch. `unmount()` forces the popup out of the DOM (use
   * it when an exit animation is driven externally); `close()` closes the
   * tooltip.
   */
  actionsRef?: BaseTooltip.Root.Props<Payload>["actionsRef"];
  /**
   * Associates this tooltip with detached triggers created through
   * `Tooltip.createHandle()`, so one popup can serve several triggers that
   * live elsewhere in the tree.
   */
  handle?: BaseTooltip.Root.Props<Payload>["handle"];
  /**
   * The trigger the tooltip is attached to, for controlled multi-trigger
   * setups. There is no separate `onTriggerIdChange` — derive the new id from
   * `eventDetails.trigger` inside `onOpenChange`.
   */
  triggerId?: BaseTooltip.Root.Props<Payload>["triggerId"];
  /**
   * The initially attached trigger id. Pairs with `defaultOpen` the way
   * `triggerId` pairs with `open`.
   */
  defaultTriggerId?: BaseTooltip.Root.Props<Payload>["defaultTriggerId"];
  /**
   * The trigger and popup for this tooltip. May also be a render function
   * receiving `{ payload }` from the trigger that opened the tooltip.
   */
  children?: BaseTooltip.Root.Props<Payload>["children"];
}

/**
 * Groups one tooltip's trigger and popup. Renders no DOM element, so it takes
 * no `className`, `style` or `ref`.
 */
function TooltipRoot<Payload = unknown>(props: TooltipRootProps<Payload>) {
  return <BaseTooltip.Root<Payload> {...props} />;
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface TooltipTriggerProps<Payload = unknown>
  extends Omit<BaseTooltip.Trigger.Props<Payload>, "className"> {
  /**
   * How long to wait before opening, in milliseconds. Overrides the
   * provider's `delay` for this trigger only.
   * @default 600
   */
  delay?: BaseTooltip.Trigger.Props<Payload>["delay"];
  /**
   * How long to wait before closing, in milliseconds.
   * @default 0
   */
  closeDelay?: BaseTooltip.Trigger.Props<Payload>["closeDelay"];
  /**
   * Whether clicking the trigger closes the tooltip. Leave it on for triggers
   * that do something on click — the tooltip has served its purpose by then
   * and would otherwise sit over the result.
   * @default true
   */
  closeOnClick?: BaseTooltip.Trigger.Props<Payload>["closeOnClick"];
  /**
   * Stops this trigger from opening the tooltip. It does **not** apply the
   * `disabled` attribute to the element, so the button stays focusable and
   * clickable; style the difference from `data-trigger-disabled`. To disable
   * the control itself, pass `disabled` through `render`.
   * @default false
   */
  disabled?: BaseTooltip.Trigger.Props<Payload>["disabled"];
  /**
   * Associates a detached trigger with a `Tooltip.Root` that carries the same
   * handle, created once outside render with `Tooltip.createHandle()`.
   */
  handle?: BaseTooltip.Trigger.Props<Payload>["handle"];
  /**
   * Data handed to the tooltip when this trigger opens it, so one popup can
   * render different content per trigger.
   */
  payload?: BaseTooltip.Trigger.Props<Payload>["payload"];
  /**
   * Replaces the rendered `<button>` with another element or component —
   * `render={<Button variant="ghost" />}` is the common case. Note there is
   * no `nativeButton` prop on this part: it always renders button semantics.
   */
  render?: BaseTooltip.Trigger.Props<Payload>["render"];
  /**
   * Forwarded to the underlying element.
   */
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The element the tooltip is attached to. Renders a `<button>`.
 *
 * **This trigger must carry its own accessible name.** The tooltip is a
 * visual affordance only — see the note on {@link Tooltip} — so an icon-only
 * trigger needs an `aria-label` that closely matches the tooltip's text.
 * Screen reader users get the `aria-label` and nothing else.
 *
 * Unlike `Popover.Trigger` and `Menu.Trigger`, this part has **no
 * `nativeButton` prop**; it always renders button semantics. Compose it with
 * an existing control through `render` instead.
 */
function TooltipTrigger<Payload = unknown>({
  className,
  ...props
}: TooltipTriggerProps<Payload>) {
  return (
    <BaseTooltip.Trigger<Payload>
      className={clsx(styles.trigger, "forte-focus-ring", className)}
      data-forte="tooltip-trigger"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type PositionerProps = BaseTooltip.Positioner.Props;

export interface TooltipPopupProps
  extends Omit<BaseTooltip.Popup.Props, "className"> {
  /**
   * Which side of the trigger to place the tooltip on. Flips automatically to
   * avoid collisions. `"inline-start"` / `"inline-end"` follow writing
   * direction.
   * @default "top"
   */
  side?: PositionerProps["side"];
  /**
   * How the tooltip lines up with the trigger along the chosen side.
   * @default "center"
   */
  align?: PositionerProps["align"];
  /**
   * Gap between trigger and tooltip, in pixels, or a function returning one.
   * When an `Arrow` is rendered this must exceed the arrow's height or the
   * arrow will overlap the trigger; the default leaves room for the default
   * arrow.
   * @default 8
   */
  sideOffset?: PositionerProps["sideOffset"];
  /**
   * Shifts the tooltip along the alignment axis, in pixels, or a function
   * returning one.
   * @default 0
   */
  alignOffset?: PositionerProps["alignOffset"];
  /**
   * Minimum distance, in pixels, the arrow keeps from the tooltip's corners
   * before it is allowed to sit off-center (`data-uncentered`).
   * @default 5
   */
  arrowPadding?: PositionerProps["arrowPadding"];
  /**
   * The element the tooltip positions against, when it should not be the
   * trigger.
   */
  anchor?: PositionerProps["anchor"];
  /**
   * The boundary the tooltip tries to stay inside of.
   * @default "clipping-ancestors"
   */
  collisionBoundary?: PositionerProps["collisionBoundary"];
  /**
   * Space, in pixels, kept between the tooltip and the collision boundary.
   * @default 5
   */
  collisionPadding?: PositionerProps["collisionPadding"];
  /**
   * How the tooltip reacts when it would overflow the boundary — whether it
   * flips, shifts, or stays put.
   */
  collisionAvoidance?: PositionerProps["collisionAvoidance"];
  /**
   * Keeps the tooltip glued to the trigger while it scrolls out of view
   * instead of letting it detach.
   * @default false
   */
  sticky?: PositionerProps["sticky"];
  /**
   * Whether the tooltip is positioned with `position: absolute` or
   * `position: fixed`.
   * @default "absolute"
   */
  positionMethod?: PositionerProps["positionMethod"];
  /**
   * Stops the tooltip re-measuring the anchor on scroll and resize. Cheaper,
   * but the tooltip drifts if the anchor moves.
   * @default false
   */
  disableAnchorTracking?: PositionerProps["disableAnchorTracking"];
  /**
   * Keeps the portal in the DOM while the tooltip is closed.
   * @default false
   */
  keepMounted?: BaseTooltip.Portal.Props["keepMounted"];
  /**
   * Where the portal renders. Defaults to `document.body`; point it at a
   * container when the tooltip has to live inside a specific stacking or
   * shadow root.
   */
  container?: BaseTooltip.Portal.Props["container"];
  /**
   * Additional class name(s) for the positioner element, which owns
   * placement and `z-index`. Use it to re-stack a single tooltip.
   */
  positionerClassName?: string;
  /**
   * Forwarded to the popup element.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The tooltip surface. Renders the portal, the positioner and the popup in
 * one part, so the common case is a single element in consumer markup.
 *
 * Keep the content to a short visual label. Anything a user must read to
 * operate the UI belongs in the page or in a `Popover` — see {@link Tooltip}.
 */
const TooltipPopup = React.forwardRef<HTMLDivElement, TooltipPopupProps>(
  function TooltipPopup(
    {
      side = "top",
      align = "center",
      sideOffset = 8,
      alignOffset,
      arrowPadding,
      anchor,
      collisionBoundary,
      collisionPadding,
      collisionAvoidance,
      sticky,
      positionMethod,
      disableAnchorTracking,
      keepMounted,
      container,
      positionerClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <BaseTooltip.Portal keepMounted={keepMounted} container={container}>
        <BaseTooltip.Positioner
          className={clsx(styles.positioner, positionerClassName)}
          data-forte="tooltip-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          arrowPadding={arrowPadding}
          anchor={anchor}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          collisionAvoidance={collisionAvoidance}
          sticky={sticky}
          positionMethod={positionMethod}
          disableAnchorTracking={disableAnchorTracking}
        >
          {/* .forte-hc-surface carries a transparent border. `transparent` is
           * not preserved in forced-colors mode, so it becomes the visible
           * system-colored boundary that replaces the stripped shadow. */}
          <BaseTooltip.Popup
            ref={ref}
            className={clsx(styles.popup, "forte-hc-surface", className)}
            data-forte="tooltip-popup"
            {...props}
          >
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Arrow
 * ---------------------------------------------------------------------- */

export interface TooltipArrowProps
  extends Omit<BaseTooltip.Arrow.Props, "className"> {
  /**
   * Replaces the built-in wedge. The default SVG inherits the popup's colors
   * through `--forte-tooltip-bg`, so a custom skin usually needs nothing here.
   */
  children?: React.ReactNode;
  /**
   * Forwarded to the arrow element.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The wedge pointing back at the trigger. Render it as the first child of
 * `Tooltip.Popup`.
 *
 * It is an SVG rather than the traditional CSS-border triangle on purpose: in
 * forced-colors mode every border color is forced to `CanvasText`, and a
 * border triangle degrades into a filled rectangle. Two flat paths cannot
 * fail that way.
 */
const TooltipArrow = React.forwardRef<HTMLDivElement, TooltipArrowProps>(
  function TooltipArrow({ className, children, ...props }, ref) {
    return (
      <BaseTooltip.Arrow
        ref={ref}
        className={clsx("forte-popup-arrow", className)}
        data-forte="tooltip-arrow"
        {...props}
      >
        {children ?? <ArrowSvg />}
      </BaseTooltip.Arrow>
    );
  },
);

/**
 * Points up in its own coordinate space; the stylesheet rotates it per side.
 * Two paths, not one: the larger one sits underneath and is transparent
 * normally, giving forced-colors mode an outline to paint that matches the
 * popup's own border.
 */
function ArrowSvg() {
  return (
    <svg
      className="forte-popup-arrow-svg"
      data-forte="tooltip-arrow-svg"
      viewBox="0 0 20 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="forte-popup-arrow-border" d="M0 10 L10 0 L20 10 Z" />
      <path className="forte-popup-arrow-fill" d="M2.12 10 L10 2.12 L17.88 10 Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Shortcut
 * ---------------------------------------------------------------------- */

export interface TooltipShortcutProps extends KbdProps {
  /**
   * The keys, written the way they are printed — `⌘B`, `Ctrl+B`, `⇧⌘P`.
   */
  children?: React.ReactNode;
}

/**
 * The keyboard shortcut printed beside the label, as a key cap. It IS a
 * `Kbd` — the same cap you would drop into running text, re-tuned through
 * the popup's `--forte-tooltip-shortcut-*` knobs — so it renders a `<kbd>`
 * and carries `data-forte="kbd"`, scoped from outside as
 * `[data-forte="tooltip-popup"] [data-forte="kbd"]`. It is not a Base UI
 * part; it is the same convenience `Menu.Shortcut` is, for the other half of
 * the pattern: the command that lives in a menu shows its keys there, and
 * the toolbar button that runs the same command shows them here.
 *
 * Its presence turns the popup into a row, so a label and its keys sit on one
 * line without the consumer laying anything out.
 *
 * Unlike `Menu.Shortcut` this part is **not** `aria-hidden`, because there is
 * nothing to hide it from: the popup carries no `role="tooltip"` and the
 * trigger is not wired to it with `aria-describedby`, so no part of a tooltip
 * is announced. The shortcut still has to reach assistive technology by
 * another route, and that route is `aria-keyshortcuts` on the control itself —
 * the same place a menu puts it, spelled in words rather than glyphs:
 *
 * ```tsx
 * <Tooltip.Trigger
 *   aria-label="Bold"
 *   aria-keyshortcuts="Meta+B"
 *   render={<Button iconOnly />}
 * >
 *   <BoldIcon aria-hidden="true" />
 * </Tooltip.Trigger>
 * <Tooltip.Popup>
 *   Bold
 *   <Tooltip.Shortcut>⌘B</Tooltip.Shortcut>
 * </Tooltip.Popup>
 * ```
 */
const TooltipShortcut = React.forwardRef<HTMLElement, TooltipShortcutProps>(
  function TooltipShortcut({ className, ...props }, ref) {
    return <Kbd ref={ref} className={clsx(styles.shortcut, className)} {...props} />;
  },
);

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A tooltip built on Base UI's unstyled `Tooltip` primitive.
 *
 * ```tsx
 * <Tooltip.Provider>
 *   <Tooltip.Root>
 *     <Tooltip.Trigger aria-label="Bold">
 *       <BoldIcon aria-hidden="true" />
 *     </Tooltip.Trigger>
 *     <Tooltip.Popup>
 *       <Tooltip.Arrow />
 *       Bold
 *     </Tooltip.Popup>
 *   </Tooltip.Root>
 * </Tooltip.Provider>
 * ```
 *
 * ## Accessibility: a tooltip is VISUAL ONLY
 *
 * This is the single most important thing to know about this component, and
 * it is a property of tooltips in general, not of this implementation.
 *
 * - **It is not available to screen readers.** Nothing in the popup is
 *   announced. The trigger therefore needs its own `aria-label` that closely
 *   matches the tooltip's text, so the two audiences get the same
 *   information and the same words for it.
 * - **It is disabled on touch devices.** There is no discoverable way to
 *   reveal a tooltip before tapping its trigger; iOS has no equivalent
 *   affordance, and on Android long-press collides with the browser's own
 *   context menu. Base UI therefore does not open tooltips on touch at all.
 * - **Never put important information only in a tooltip.** If a user who
 *   never sees it would be unable to operate or understand the UI, it does
 *   not belong here. Put it inline, or in a `Popover` if space is tight.
 * - **For an info affordance — the little "i" icon — use {@link Popover} with
 *   `openOnHover` on its trigger instead.** That version is reachable by
 *   touch and by assistive technology. The rule of thumb: if the trigger's
 *   purpose *is* to open the popup, it is a popover; if the trigger's purpose
 *   is unrelated to the popup, it is a tooltip.
 * - For transient feedback ("Copied!"), prefer an anchored `Toast`, which is
 *   announced.
 *
 * Styling is driven by `data-*` attributes and `--forte-tooltip-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[side=top]:...`) without wrapping.
 *
 * @summary A short label shown on hover or focus naming a control — never the
 *   only carrier of essential content; for interactive content use Popover.
 * @category Overlays
 */
export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  Shortcut: TooltipShortcut,
  /** Creates a handle that connects a `Tooltip.Root` to detached triggers. */
  createHandle: BaseTooltip.createHandle,
};
