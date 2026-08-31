"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { clsx } from "clsx";
import styles from "./Popover.module.css";

export type PopoverSize = "sm" | "md" | "lg";
export type PopoverFooterAlign = "start" | "center" | "end" | "between";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface PopoverRootProps<Payload = unknown>
  extends BasePopover.Root.Props<Payload> {
  /**
   * Whether the popover is open when it first mounts. For a controlled
   * popover use `open` instead.
   * @default false
   */
  defaultOpen?: BasePopover.Root.Props<Payload>["defaultOpen"];
  /**
   * Whether the popover is currently open. Pass this together with
   * `onOpenChange` to control the popover.
   */
  open?: BasePopover.Root.Props<Payload>["open"];
  /**
   * Called when the popover wants to open or close. The second argument
   * carries the reason (`'trigger-press'`, `'trigger-hover'`,
   * `'trigger-focus'`, `'outside-press'`, `'escape-key'`, `'close-press'`,
   * `'focus-out'`, `'imperative-action'`, `'none'`), the trigger involved,
   * and can `cancel()` the change — which is how a popover holding an
   * unsaved form asks before it closes.
   */
  onOpenChange?: BasePopover.Root.Props<Payload>["onOpenChange"];
  /**
   * Called after the open or close transition has finished. Use this rather
   * than a timer when work has to wait for the popup to actually leave.
   */
  onOpenChangeComplete?: BasePopover.Root.Props<Payload>["onOpenChangeComplete"];
  /**
   * Whether the popover takes the page over while it is open.
   *
   * - `false` — the rest of the page stays scrollable and clickable.
   * - `true` — page scroll is locked and pointer interaction outside the
   *   popup is disabled.
   * - `'trap-focus'` — focus is trapped inside the popup, but scrolling and
   *   outside pointer interaction still work.
   *
   * With `true` or `'trap-focus'`, render a `Popover.Close` inside the popup:
   * it is what a touch screen-reader user uses to get out, and with `true` it
   * is also what switches focus trapping on.
   * @default false
   */
  modal?: BasePopover.Root.Props<Payload>["modal"];
  /**
   * Imperative escape hatch. `close()` closes the popover; `unmount()` forces
   * the popup out of the DOM, for when an exit animation is driven
   * externally.
   */
  actionsRef?: BasePopover.Root.Props<Payload>["actionsRef"];
  /**
   * Associates this popover with detached triggers created through
   * `Popover.createHandle()`, so one popup can serve triggers that live
   * elsewhere in the tree.
   */
  handle?: BasePopover.Root.Props<Payload>["handle"];
  /**
   * Which trigger the popover is currently attached to, for controlled
   * multi-trigger setups. There is no separate `onTriggerIdChange` — read the
   * new id off `eventDetails.trigger` inside `onOpenChange`.
   */
  triggerId?: BasePopover.Root.Props<Payload>["triggerId"];
  /**
   * The initially attached trigger id. Pairs with `defaultOpen` the way
   * `triggerId` pairs with `open`.
   */
  defaultTriggerId?: BasePopover.Root.Props<Payload>["defaultTriggerId"];
  /**
   * The trigger and popup for this popover. May also be a render function
   * receiving `{ payload }` from the trigger that opened it.
   */
  children?: BasePopover.Root.Props<Payload>["children"];
}

/**
 * Groups one popover's trigger and popup, and owns its open state. Renders no
 * DOM element, so it takes no `className`, `style` or `ref`.
 */
function PopoverRoot<Payload = unknown>(props: PopoverRootProps<Payload>) {
  return <BasePopover.Root<Payload> {...props} />;
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface PopoverTriggerProps<Payload = unknown>
  extends Omit<BasePopover.Trigger.Props<Payload>, "className"> {
  /**
   * Also open the popover when the trigger is hovered. This is the setting
   * that turns an "i" info icon into the accessible alternative to a tooltip:
   * hover reveals it for pointer users while press still reveals it for
   * everyone else.
   * @default false
   */
  openOnHover?: BasePopover.Trigger.Props<Payload>["openOnHover"];
  /**
   * How long the pointer must rest on the trigger before the popover opens,
   * in milliseconds. Requires `openOnHover`.
   * @default 300
   */
  delay?: BasePopover.Trigger.Props<Payload>["delay"];
  /**
   * How long the popover lingers after the pointer leaves, in milliseconds.
   * Requires `openOnHover`.
   * @default 0
   */
  closeDelay?: BasePopover.Trigger.Props<Payload>["closeDelay"];
  /**
   * Whether the rendered element is a real `<button>`. Set it to `false` when
   * `render` replaces the button with something else (a `<div>`, a table
   * row), so Base UI supplies the keyboard and role behaviour the element
   * does not have natively.
   * @default true
   */
  nativeButton?: BasePopover.Trigger.Props<Payload>["nativeButton"];
  /**
   * Associates a detached trigger with the `Popover.Root` carrying the same
   * handle, created once outside render with `Popover.createHandle()`.
   */
  handle?: BasePopover.Trigger.Props<Payload>["handle"];
  /**
   * Data handed to the popover when this trigger opens it, so one popup can
   * render different content per trigger. Read it from the render-function
   * form of `Popover.Root`'s children.
   */
  payload?: BasePopover.Trigger.Props<Payload>["payload"];
  /**
   * Identifies the trigger. Also how `Popover.Root`'s `triggerId` names the
   * active trigger in controlled multi-trigger mode.
   */
  id?: BasePopover.Trigger.Props<Payload>["id"];
  /**
   * Replaces the rendered `<button>` with another element or component —
   * `render={<Button variant="outline" />}` is the common case. The trigger's
   * own neutral styling steps aside when this is present, so the two never
   * fight over the cascade.
   */
  render?: BasePopover.Trigger.Props<Payload>["render"];
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
interface PopoverTriggerComponent {
  <Payload>(
    props: PopoverTriggerProps<Payload> &
      React.RefAttributes<HTMLButtonElement>,
  ): React.JSX.Element;
}

/**
 * The button that opens the popover. Renders a `<button>`.
 *
 * Unlike a tooltip trigger, this one needs no separate `aria-label` standing
 * in for the popup: Base UI wires the trigger to the popup with
 * `aria-haspopup` and `aria-controls`, and the popup is announced when it
 * opens. An icon-only trigger still needs a name of its own, as any icon-only
 * button does.
 */
const PopoverTrigger = React.forwardRef(function PopoverTrigger<Payload>(
  { className, render, ...props }: PopoverTriggerProps<Payload>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BasePopover.Trigger<Payload>
      ref={ref}
      render={render}
      className={clsx(
        render === undefined && styles.trigger,
        "forte-focus-ring",
        className,
      )}
      data-forte="popover-trigger"
      {...props}
    />
  );
}) as PopoverTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type PositionerProps = BasePopover.Positioner.Props;

export interface PopoverPopupProps
  extends Omit<BasePopover.Popup.Props, "className"> {
  /**
   * Width cap for the popup. The popup shrinks to fit its content and only
   * grows to this width when the content asks for it, so this is a ceiling
   * rather than a fixed measure. Further clamped to the space the positioner
   * reports as available.
   * @default "md"
   */
  size?: PopoverSize;
  /**
   * Which side of the trigger to place the popup on. Flips automatically to
   * avoid collisions. `"inline-start"` / `"inline-end"` follow writing
   * direction.
   * @default "bottom"
   */
  side?: PositionerProps["side"];
  /**
   * How the popup lines up with the trigger along the chosen side.
   * @default "center"
   */
  align?: PositionerProps["align"];
  /**
   * Gap between trigger and popup, in pixels, or a function returning one.
   * When an `Arrow` is rendered this must exceed the arrow's height or the
   * arrow overlaps the trigger; the default leaves room for the default
   * arrow.
   * @default 8
   */
  sideOffset?: PositionerProps["sideOffset"];
  /**
   * Shifts the popup along the alignment axis, in pixels, or a function
   * returning one.
   * @default 0
   */
  alignOffset?: PositionerProps["alignOffset"];
  /**
   * Minimum distance, in pixels, the arrow keeps from the popup's corners
   * before it is allowed to sit off-centre (`data-uncentered`).
   * @default 5
   */
  arrowPadding?: PositionerProps["arrowPadding"];
  /**
   * The element the popup positions against, when it should not be the
   * trigger. Accepts an element, a ref, a getter, or a virtual element — a
   * text selection or a right-click point.
   */
  anchor?: PositionerProps["anchor"];
  /**
   * The boundary the popup tries to stay inside of.
   * @default "clipping-ancestors"
   */
  collisionBoundary?: PositionerProps["collisionBoundary"];
  /**
   * Space, in pixels, kept between the popup and the collision boundary.
   * @default 5
   */
  collisionPadding?: PositionerProps["collisionPadding"];
  /**
   * How the popup reacts when it would overflow the boundary — whether it
   * flips, shifts, or stays put.
   */
  collisionAvoidance?: PositionerProps["collisionAvoidance"];
  /**
   * Keeps the popup glued to the trigger while it scrolls out of view instead
   * of letting it detach.
   * @default false
   */
  sticky?: PositionerProps["sticky"];
  /**
   * Whether the popup is positioned with `position: absolute` or
   * `position: fixed`.
   * @default "absolute"
   */
  positionMethod?: PositionerProps["positionMethod"];
  /**
   * Stops the popup re-measuring the anchor on scroll and resize. Cheaper,
   * but the popup drifts if the anchor moves.
   * @default false
   */
  disableAnchorTracking?: PositionerProps["disableAnchorTracking"];
  /**
   * Render a scrim behind the popup. Off by default — a popover normally
   * leaves the page visible and usable. Turn it on with `modal` on
   * `Popover.Root`, where the page is already inert and the scrim is what
   * says so.
   * @default false
   */
  backdrop?: boolean;
  /**
   * Keeps the portal — and therefore the popup — in the DOM while the popover
   * is closed. Needed when something inside must stay mounted (an iframe, a
   * media element, uncommitted form state).
   * @default false
   */
  keepMounted?: BasePopover.Portal.Props["keepMounted"];
  /**
   * Where the portal renders. Defaults to `document.body`; point it at a
   * container when the popup has to live inside a specific stacking or shadow
   * root.
   */
  container?: BasePopover.Portal.Props["container"];
  /**
   * Additional class name(s) for the backdrop element. The popup's own
   * `className` cannot reach it, since the backdrop is a sibling rendered
   * inside this component. Also where `--forte-popover-backdrop-z-index` goes.
   */
  backdropClassName?: string;
  /**
   * Additional class name(s) for the positioner element, which owns placement
   * and `z-index`. Use it to re-stack a single popover through
   * `--forte-popover-z-index`.
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
 * The popover surface, together with the wrappers it always needs:
 * `Portal` → `Backdrop` + `Positioner` → `Popup`. Collapsing them into one
 * component keeps the common case to a single element while leaving every
 * Base UI `Popup` prop (`initialFocus`, `finalFocus`, `render`, …) available.
 *
 * `Title`, `Description` and `Close` belong *inside* it: that is what wires up
 * `aria-labelledby` / `aria-describedby`, and in a modal popover a close
 * button outside the popup is unreachable to touch screen-reader users.
 */
const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup(
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
      backdrop = false,
      keepMounted,
      container,
      backdropClassName,
      positionerClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <BasePopover.Portal keepMounted={keepMounted} container={container}>
        {backdrop ? (
          <BasePopover.Backdrop
            className={clsx(styles.backdrop, "forte-scrim", backdropClassName)}
            data-forte="popover-backdrop"
          />
        ) : null}
        <BasePopover.Positioner
          className={clsx(styles.positioner, positionerClassName)}
          data-forte="popover-positioner"
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
          {/* The popup is programmatically focused when the popover opens by
            * touch, and that focus is keyboard-visible when it opens by
            * keyboard — so it needs a real ring, not the UA default.
            * `.forte-hc-surface` carries a transparent border, and `transparent`
            * is not preserved in forced-colors mode, so it becomes the
            * visible system-coloured boundary that replaces the stripped
            * shadow. */}
          <BasePopover.Popup
            ref={ref}
            className={clsx(
              styles.popup,
              "forte-focus-ring",
              "forte-hc-surface",
              className,
            )}
            data-forte="popover-popup"
            data-size={size}
            {...props}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Arrow
 * ---------------------------------------------------------------------- */

export interface PopoverArrowProps
  extends Omit<BasePopover.Arrow.Props, "className"> {
  /**
   * Replaces the built-in wedge. The default SVG inherits the popup's colours
   * through `--forte-popover-bg`, so a custom skin usually needs nothing here.
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
 * The wedge pointing back at the trigger. Render it as a child of
 * `Popover.Popup`.
 *
 * It is an SVG rather than the traditional CSS-border triangle on purpose: in
 * forced-colors mode every border colour is forced to `CanvasText`, and a
 * border triangle degrades into a filled rectangle. Two flat paths cannot fail
 * that way.
 */
const PopoverArrow = React.forwardRef<HTMLDivElement, PopoverArrowProps>(
  function PopoverArrow({ className, children, ...props }, ref) {
    return (
      <BasePopover.Arrow
        ref={ref}
        className={clsx("forte-popup-arrow", className)}
        data-forte="popover-arrow"
        {...props}
      >
        {children ?? <ArrowSvg />}
      </BasePopover.Arrow>
    );
  },
);

/**
 * Points up in its own coordinate space; the stylesheet rotates it per side.
 * Two paths, not one: the larger sits underneath and is transparent normally,
 * giving forced-colors mode an outline to paint that matches the popup's own
 * border.
 */
function ArrowSvg() {
  return (
    <svg
      className="forte-popup-arrow-svg"
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
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface PopoverTitleProps
  extends Omit<BasePopover.Title.Props, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The popover's accessible name.
 *
 * Renders an `<h2>` — pass `render={<h3 />}` when the surrounding document
 * outline calls for a different level. Inside `Popover.Popup` it becomes the
 * popup's `aria-labelledby` automatically.
 */
const PopoverTitle = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  function PopoverTitle({ className, ...props }, ref) {
    return (
      <BasePopover.Title
        ref={ref}
        className={clsx(styles.title, className)}
        data-forte="popover-title"
        {...props}
      />
    );
  },
);

export interface PopoverDescriptionProps
  extends Omit<BasePopover.Description.Props, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A short explanation of what the popover is for.
 *
 * Renders a `<p>`. Inside `Popover.Popup` it becomes the popup's
 * `aria-describedby`, so it is announced after the title.
 */
const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={clsx(styles.description, className)}
      data-forte="popover-description"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Close
 * ---------------------------------------------------------------------- */

export interface PopoverCloseProps
  extends Omit<BasePopover.Close.Props, "className"> {
  /**
   * Render as a square button sized for a single icon — the corner "×"
   * treatment. Enforces the 24px minimum hit target from WCAG SC 2.5.8.
   * Always pair with `aria-label`, since there is no text to announce.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Replaces the rendered `<button>`. The close button's own neutral styling
   * steps aside when this is present.
   */
  render?: BasePopover.Close.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that closes the popover. Renders a `<button>`.
 *
 * Optional for a plain popover — Esc and an outside press both close it — but
 * required once `modal` is set: with `modal` it is what switches focus
 * trapping on, and under either modal setting it is the only way out for a
 * touch screen-reader user, who has neither key nor outside press available.
 */
const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  function PopoverClose(
    { iconOnly = false, className, render, ...props },
    ref,
  ) {
    return (
      <BasePopover.Close
        ref={ref}
        render={render}
        className={clsx(
          render === undefined && styles.close,
          "forte-focus-ring",
          className,
        )}
        data-forte="popover-close"
        {/* Spread-when-true, not `iconOnly || undefined`: JSX keeps an
          * `undefined`-valued key in the props object and the render-prop
          * merge copies it verbatim, so the plain attribute would erase the
          * `data-icon-only` a composed `render={<Button iconOnly />}` sets
          * for itself — silently un-squaring the button. */
        ...(iconOnly && { "data-icon-only": true })}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------- */

export interface PopoverFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * How the actions are distributed along the footer. `"between"` is the
   * pattern for a destructive action pushed away from the safe one.
   * @default "end"
   */
  align?: PopoverFooterAlign;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The action row at the bottom of a popover.
 *
 * A plain `<div>` — not a Base UI part — that supplies the standard spacing
 * and alignment for the confirm/cancel buttons, the same way `Dialog.Footer`
 * does. It exists because an action row is the one piece of chrome every
 * second popover grows, and left to each consumer it is re-invented with a
 * different gap every time.
 */
const PopoverFooter = React.forwardRef<HTMLDivElement, PopoverFooterProps>(
  function PopoverFooter({ align = "end", className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.footer, className)}
        data-forte="popover-footer"
        data-align={align}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface PopoverViewportProps
  extends Omit<BasePopover.Viewport.Props, "className"> {
  /**
   * The content that changes from trigger to trigger.
   */
  children?: BasePopover.Viewport.Props["children"];
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
 * Animates the swap when one popup serves several triggers and its content
 * changes between them.
 *
 * Wrap the changing content in it, inside `Popover.Popup`. Base UI keeps a
 * clone of the outgoing content mounted for the length of the transition; the
 * stylesheet slides the two past each other in the direction the new trigger
 * lies, and resizes the popup to follow. Without it the content simply
 * replaces itself, which is fine — this part is only needed when the swap
 * should be animated.
 *
 * Leave the `Arrow` outside it, as a direct child of the popup: the viewport
 * clips, and the arrow lives beyond the popup's edge.
 */
const PopoverViewport = React.forwardRef<HTMLDivElement, PopoverViewportProps>(
  function PopoverViewport({ className, ...props }, ref) {
    return (
      <BasePopover.Viewport
        ref={ref}
        className={clsx(styles.viewport, "forte-popup-viewport", className)}
        data-forte="popover-viewport"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * An anchored surface for content the user has to read or act on, built on
 * Base UI's unstyled `Popover` primitive.
 *
 * ```tsx
 * <Popover.Root>
 *   <Popover.Trigger render={<Button variant="outline" />}>
 *     Notifications
 *   </Popover.Trigger>
 *   <Popover.Popup>
 *     <Popover.Arrow />
 *     <Popover.Title>Notifications</Popover.Title>
 *     <Popover.Description>You are all caught up.</Popover.Description>
 *   </Popover.Popup>
 * </Popover.Root>
 * ```
 *
 * ## Popover or tooltip?
 *
 * The question is what the TRIGGER is for, not how much text the popup holds.
 * If the trigger's purpose *is* to open the popup — the little "i" info icon
 * is the usual case — it is a popover. If the trigger does something else and
 * the popup merely labels it, it is a `Tooltip`.
 *
 * A popover is the accessible choice whenever the content matters: the popup
 * is announced, it can be tabbed into, and it opens on touch — none of which
 * is true of a tooltip. For the info-icon pattern, set `openOnHover` on
 * `Popover.Trigger` and it behaves like a tooltip for pointer users while
 * staying reachable for everyone else.
 *
 * Styling is driven by `data-*` attributes and `--forte-popover-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[side=top]:...`) without wrapping.
 */
export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Popup: PopoverPopup,
  Arrow: PopoverArrow,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Footer: PopoverFooter,
  Viewport: PopoverViewport,
  /** Creates a handle that connects a `Popover.Root` to detached triggers. */
  createHandle: BasePopover.createHandle,
};
