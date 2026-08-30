"use client";

import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { clsx } from "clsx";
import styles from "./PreviewCard.module.css";

export type PreviewCardSize = "sm" | "md" | "lg";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface PreviewCardRootProps<Payload = unknown>
  extends BasePreviewCard.Root.Props<Payload> {
  /**
   * Whether the card is open when it first mounts. For a controlled card use
   * `open` instead.
   * @default false
   */
  defaultOpen?: BasePreviewCard.Root.Props<Payload>["defaultOpen"];
  /**
   * Whether the card is currently open. Pass this together with
   * `onOpenChange` to control the card.
   */
  open?: BasePreviewCard.Root.Props<Payload>["open"];
  /**
   * Called when the card wants to open or close. The second argument carries
   * the reason (`'trigger-hover'`, `'trigger-focus'`, `'trigger-press'`,
   * `'outside-press'`, `'escape-key'`, `'imperative-action'`, `'none'`), the
   * trigger involved, and can `cancel()` the change.
   */
  onOpenChange?: BasePreviewCard.Root.Props<Payload>["onOpenChange"];
  /**
   * Called after the open or close transition has finished. Use this rather
   * than a timer when work has to wait for the card to actually leave.
   */
  onOpenChangeComplete?: BasePreviewCard.Root.Props<Payload>["onOpenChangeComplete"];
  /**
   * Imperative escape hatch. `close()` closes the card; `unmount()` forces the
   * popup out of the DOM, for when an exit animation is driven externally.
   */
  actionsRef?: BasePreviewCard.Root.Props<Payload>["actionsRef"];
  /**
   * Associates this card with detached triggers created through
   * `PreviewCard.createHandle()`, so one popup can serve triggers that live
   * elsewhere in the tree.
   */
  handle?: BasePreviewCard.Root.Props<Payload>["handle"];
  /**
   * Which trigger the card is currently attached to, for controlled
   * multi-trigger setups. There is no separate `onTriggerIdChange` — read the
   * new id off `eventDetails.trigger` inside `onOpenChange`.
   */
  triggerId?: BasePreviewCard.Root.Props<Payload>["triggerId"];
  /**
   * The initially attached trigger id. Pairs with `defaultOpen` the way
   * `triggerId` pairs with `open`.
   */
  defaultTriggerId?: BasePreviewCard.Root.Props<Payload>["defaultTriggerId"];
  /**
   * The trigger and popup for this card. May also be a render function
   * receiving `{ payload }` from the trigger that opened it.
   */
  children?: BasePreviewCard.Root.Props<Payload>["children"];
}

/**
 * Groups one preview card's trigger and popup, and owns its open state.
 * Renders no DOM element, so it takes no `className`, `style` or `ref`.
 */
function PreviewCardRoot<Payload = unknown>(
  props: PreviewCardRootProps<Payload>,
) {
  return <BasePreviewCard.Root<Payload> {...props} />;
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface PreviewCardTriggerProps<Payload = unknown>
  extends Omit<BasePreviewCard.Trigger.Props<Payload>, "className"> {
  /**
   * Where the link goes. Not optional in practice: the card is an enrichment
   * of a link, and an `<a>` without `href` is neither focusable nor
   * announced as a link — so leaving it off strands every keyboard user,
   * who is also the one person for whom the card is not the point.
   */
  href?: BasePreviewCard.Trigger.Props<Payload>["href"];
  /**
   * How long the pointer must rest on the link before the card opens, in
   * milliseconds. Also the wait before a focused link opens it.
   * @default 600
   */
  delay?: BasePreviewCard.Trigger.Props<Payload>["delay"];
  /**
   * How long the card lingers after the pointer leaves, in milliseconds. The
   * pointer only has to reach the popup within this window along a direct
   * path — Base UI grants the diagonal — so this is the tolerance for
   * overshooting, not the whole journey.
   * @default 300
   */
  closeDelay?: BasePreviewCard.Trigger.Props<Payload>["closeDelay"];
  /**
   * Associates a detached trigger with the `PreviewCard.Root` carrying the
   * same handle, created once outside render with
   * `PreviewCard.createHandle()`.
   */
  handle?: BasePreviewCard.Trigger.Props<Payload>["handle"];
  /**
   * Data handed to the card when this trigger opens it, so one popup can
   * render a different profile per link. Read it from the render-function
   * form of `PreviewCard.Root`'s children.
   */
  payload?: BasePreviewCard.Trigger.Props<Payload>["payload"];
  /**
   * Identifies the trigger. Also how `PreviewCard.Root`'s `triggerId` names
   * the active trigger in controlled multi-trigger mode.
   */
  id?: BasePreviewCard.Trigger.Props<Payload>["id"];
  /**
   * Replaces the rendered `<a>` with another element or component —
   * `render={<Link href="/u/ada" />}` for a router link is the common case.
   * The trigger's own link styling steps aside when this is present, so the
   * two never fight over the cascade.
   */
  render?: BasePreviewCard.Trigger.Props<Payload>["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * `React.forwardRef` erases generics, so the exported value is re-typed with a
 * generic call signature — the same shape Base UI itself exports — to keep
 * `payload` and `handle` inferring together.
 */
interface PreviewCardTriggerComponent {
  <Payload>(
    props: PreviewCardTriggerProps<Payload> &
      React.RefAttributes<HTMLAnchorElement>,
  ): React.JSX.Element;
}

/**
 * The link the card previews. Renders an `<a>`.
 *
 * It carries no `aria-haspopup`, `aria-controls` or `aria-describedby`, and
 * that is deliberate on Base UI's part: the card is supplementary, so the link
 * is announced as an ordinary link and the card never interrupts. What follows
 * from that is the one rule for the content — see `PreviewCard.Popup`.
 *
 * A link that wraps across lines anchors the card to the line the pointer is
 * actually on, rather than to the union rectangle of all its lines. That
 * happens without configuration.
 */
const PreviewCardTrigger = React.forwardRef(function PreviewCardTrigger<
  Payload,
>(
  { className, render, ...props }: PreviewCardTriggerProps<Payload>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <BasePreviewCard.Trigger<Payload>
      ref={ref}
      render={render}
      className={clsx(
        render === undefined && styles.trigger,
        "forte-focus-ring",
        "forte-link",
        className,
      )}
      data-forte="preview-card-trigger"
      {...props}
    />
  );
}) as PreviewCardTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type PositionerProps = BasePreviewCard.Positioner.Props;

export interface PreviewCardPopupProps
  extends Omit<BasePreviewCard.Popup.Props, "className"> {
  /**
   * Width cap for the card. The card shrinks to fit its content and only grows
   * to this width when the content asks for it, so this is a ceiling rather
   * than a fixed measure. Further clamped to the space the positioner reports
   * as available.
   * @default "md"
   */
  size?: PreviewCardSize;
  /**
   * Which side of the link to place the card on. Flips automatically to avoid
   * collisions. `"inline-start"` / `"inline-end"` follow writing direction.
   * @default "bottom"
   */
  side?: PositionerProps["side"];
  /**
   * How the card lines up with the link along the chosen side.
   * @default "center"
   */
  align?: PositionerProps["align"];
  /**
   * Gap between link and card, in pixels, or a function returning one. When an
   * `Arrow` is rendered this must exceed the arrow's height or the arrow
   * overlaps the link; the default leaves room for the default arrow.
   *
   * It is also the gap the pointer crosses on its way in. Base UI covers the
   * trip with a safe polygon, so a wider offset is safe — but it is the one
   * number that makes the card feel out of reach if it grows much past the
   * text it belongs to.
   * @default 8
   */
  sideOffset?: PositionerProps["sideOffset"];
  /**
   * Shifts the card along the alignment axis, in pixels, or a function
   * returning one.
   * @default 0
   */
  alignOffset?: PositionerProps["alignOffset"];
  /**
   * Minimum distance, in pixels, the arrow keeps from the card's corners
   * before it is allowed to sit off-centre (`data-uncentered`).
   * @default 5
   */
  arrowPadding?: PositionerProps["arrowPadding"];
  /**
   * The element the card positions against, when it should not be the link.
   * Accepts an element, a ref, a getter, or a virtual element.
   */
  anchor?: PositionerProps["anchor"];
  /**
   * The boundary the card tries to stay inside of.
   * @default "clipping-ancestors"
   */
  collisionBoundary?: PositionerProps["collisionBoundary"];
  /**
   * Space, in pixels, kept between the card and the collision boundary.
   * @default 5
   */
  collisionPadding?: PositionerProps["collisionPadding"];
  /**
   * How the card reacts when it would overflow the boundary — whether it
   * flips, shifts, or stays put.
   */
  collisionAvoidance?: PositionerProps["collisionAvoidance"];
  /**
   * Keeps the card glued to the link while it scrolls out of view instead of
   * letting it detach.
   * @default false
   */
  sticky?: PositionerProps["sticky"];
  /**
   * Whether the card is positioned with `position: absolute` or
   * `position: fixed`.
   * @default "absolute"
   */
  positionMethod?: PositionerProps["positionMethod"];
  /**
   * Stops the card re-measuring the anchor on scroll and resize. Cheaper, but
   * the card drifts if the anchor moves.
   * @default false
   */
  disableAnchorTracking?: PositionerProps["disableAnchorTracking"];
  /**
   * Keeps the portal — and therefore the card — in the DOM while it is closed.
   * Needed when something inside must stay mounted (an iframe, a media
   * element).
   * @default false
   */
  keepMounted?: BasePreviewCard.Portal.Props["keepMounted"];
  /**
   * Where the portal renders. Defaults to `document.body`; point it at a
   * container when the card has to live inside a specific stacking or shadow
   * root.
   */
  container?: BasePreviewCard.Portal.Props["container"];
  /**
   * Additional class name(s) for the positioner element, which owns placement
   * and `z-index`. Use it to re-stack a single card through
   * `--forte-preview-card-z-index`.
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
 * The card surface, together with the wrappers it always needs:
 * `Portal` → `Positioner` → `Popup`. Collapsing them into one component keeps
 * the common case to a single element while leaving every Base UI `Popup` prop
 * (`render`, `keepMounted`, …) available.
 *
 * The card stays open while the pointer is inside it, so links in it are
 * clickable. Keyboard focus is a different story: the popup is portalled to
 * the end of `<body>` and nothing moves focus into it, so Tab from the link
 * continues into the page. Treat everything in here as **supplementary** — a
 * summary of where the link goes — and make sure anything actionable exists on
 * the destination too.
 */
const PreviewCardPopup = React.forwardRef<
  HTMLDivElement,
  PreviewCardPopupProps
>(function PreviewCardPopup(
  {
    size = "md",
    side = "bottom",
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
    <BasePreviewCard.Portal keepMounted={keepMounted} container={container}>
      <BasePreviewCard.Positioner
        className={clsx(styles.positioner, positionerClassName)}
        data-forte="preview-card-positioner"
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
        {/* No `.forte-focus-ring` here, unlike `Popover.Popup`: nothing ever
          * focuses this element, so a ring on it could only be a lie.
          * `.forte-hc-surface` carries a transparent border, and `transparent`
          * is not preserved in forced-colors mode, so it becomes the visible
          * system-coloured boundary that replaces the stripped shadow. */}
        <BasePreviewCard.Popup
          ref={ref}
          className={clsx(styles.popup, "forte-hc-surface", className)}
          data-forte="preview-card-popup"
          data-size={size}
          {...props}
        >
          {children}
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
});

/* -------------------------------------------------------------------------
 * Arrow
 * ---------------------------------------------------------------------- */

export interface PreviewCardArrowProps
  extends Omit<BasePreviewCard.Arrow.Props, "className"> {
  /**
   * Replaces the built-in wedge. The default SVG inherits the card's colours
   * through `--forte-preview-card-bg`, so a custom skin usually needs nothing
   * here.
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
 * The wedge pointing back at the link. Render it as a child of
 * `PreviewCard.Popup`.
 *
 * It is an SVG rather than the traditional CSS-border triangle on purpose: in
 * forced-colors mode every border colour is forced to `CanvasText`, and a
 * border triangle degrades into a filled rectangle. Two flat paths cannot fail
 * that way.
 */
const PreviewCardArrow = React.forwardRef<
  HTMLDivElement,
  PreviewCardArrowProps
>(function PreviewCardArrow({ className, children, ...props }, ref) {
  return (
    <BasePreviewCard.Arrow
      ref={ref}
      className={clsx(styles.arrow, className)}
      data-forte="preview-card-arrow"
      {...props}
    >
      {children ?? <ArrowSvg />}
    </BasePreviewCard.Arrow>
  );
});

/**
 * Points up in its own coordinate space; the stylesheet rotates it per side.
 * Two paths, not one: the larger sits underneath and is transparent normally,
 * giving forced-colors mode an outline to paint that matches the card's own
 * border.
 */
function ArrowSvg() {
  return (
    <svg
      className={styles.arrowSvg}
      viewBox="0 0 20 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.arrowBorder} d="M0 10 L10 0 L20 10 Z" />
      <path className={styles.arrowFill} d="M2.12 10 L10 2.12 L17.88 10 Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface PreviewCardViewportProps
  extends Omit<BasePreviewCard.Viewport.Props, "className"> {
  /**
   * The content that changes from link to link.
   */
  children?: BasePreviewCard.Viewport.Props["children"];
  /**
   * Forwarded to the viewport element.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Animates the swap when one popup serves several links and its content
 * changes between them.
 *
 * Wrap the changing content in it, inside `PreviewCard.Popup`. Base UI keeps a
 * clone of the outgoing content mounted for the length of the transition; the
 * stylesheet slides the two past each other in the direction the new link
 * lies, and resizes the card to follow. Without it the content simply replaces
 * itself, which is fine — this part is only needed when the swap should be
 * animated.
 *
 * Leave the `Arrow` outside it, as a direct child of the popup: the viewport
 * clips, and the arrow lives beyond the card's edge.
 */
const PreviewCardViewport = React.forwardRef<
  HTMLDivElement,
  PreviewCardViewportProps
>(function PreviewCardViewport({ className, ...props }, ref) {
  return (
    <BasePreviewCard.Viewport
      ref={ref}
      className={clsx(styles.viewport, className)}
      data-forte="preview-card-viewport"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A card that previews where a link goes, revealed by resting on it. Built on
 * Base UI's unstyled `PreviewCard` primitive.
 *
 * ```tsx
 * <PreviewCard.Root>
 *   <PreviewCard.Trigger href="/u/ada">@ada</PreviewCard.Trigger>
 *   <PreviewCard.Popup>
 *     <PreviewCard.Arrow />
 *     …
 *   </PreviewCard.Popup>
 * </PreviewCard.Root>
 * ```
 *
 * ## Preview card, popover, or tooltip?
 *
 * All three are anchored surfaces; what separates them is who the content is
 * for and how it is reached.
 *
 * - A `PreviewCard` enriches a **link**. It opens on hover or focus after a
 *   long delay, it is not announced, and it can hold a whole layout — but only
 *   as a summary of the destination, because a keyboard user never enters it.
 * - A `Popover` is for content that **matters**: announced, tabbable, and
 *   openable by touch. Anything the user has to read or act on goes here.
 * - A `Tooltip` labels a control that already does something else.
 *
 * The test is what happens if the surface never appears. A preview card that
 * would be missed is a popover in the wrong component.
 *
 * Styling is driven by `data-*` attributes and `--forte-preview-card-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[side=top]:...`) without wrapping.
 */
export const PreviewCard = {
  Root: PreviewCardRoot,
  Trigger: PreviewCardTrigger,
  Popup: PreviewCardPopup,
  Arrow: PreviewCardArrow,
  Viewport: PreviewCardViewport,
  /** Creates a handle that connects a `PreviewCard.Root` to detached triggers. */
  createHandle: BasePreviewCard.createHandle,
};
