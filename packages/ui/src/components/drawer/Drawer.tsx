"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import type {
  DrawerRootProps as BaseDrawerRootProps,
  DrawerTriggerProps as BaseDrawerTriggerProps,
  DrawerPopupProps as BaseDrawerPopupProps,
  DrawerPortalProps as BaseDrawerPortalProps,
  DrawerContentProps as BaseDrawerContentProps,
  DrawerTitleProps as BaseDrawerTitleProps,
  DrawerDescriptionProps as BaseDrawerDescriptionProps,
  DrawerCloseProps as BaseDrawerCloseProps,
  DrawerSwipeAreaProps as BaseDrawerSwipeAreaProps,
  DrawerVirtualKeyboardProviderProps as BaseDrawerVirtualKeyboardProviderProps,
} from "@base-ui/react/drawer";
import { clsx } from "clsx";
import styles from "./Drawer.module.css";

export type DrawerSide = "top" | "right" | "bottom" | "left";
export type DrawerSize = "sm" | "md" | "lg" | "full";
export type DrawerVariant = "edge" | "floating";
export type DrawerFooterAlign = "start" | "center" | "end" | "between";

/**
 * One height a `top`/`bottom` drawer can settle at — a fraction of the
 * viewport (0 to 1), a pixel count (above 1), or a string carrying its own
 * `px`/`rem` unit.
 *
 * Derived from Base UI's own prop rather than restated, so a change there
 * surfaces here as a type error instead of as a runtime surprise.
 */
export type DrawerSnapPoint = NonNullable<
  BaseDrawerRootProps["snapPoints"]
>[number];

/**
 * `side` is the edge the drawer rests against; Base UI's `swipeDirection` is
 * the direction a dismissing gesture travels. They are the same fact stated
 * twice, so the component owns the mapping and never asks for both.
 */
const SWIPE_DIRECTION: Record<DrawerSide, "up" | "down" | "left" | "right"> = {
  top: "up",
  right: "right",
  bottom: "down",
  left: "left",
};

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/**
 * The two decisions `Root` makes that its descendants have to know about.
 *
 * `side` reaches the popup, the viewport and the swipe area, all of which
 * render below `Root` in the tree but are not its direct children — a drawer
 * is assembled by the consumer, so props cannot simply be threaded down.
 *
 * Base UI publishes the resolved direction as `data-swipe-direction` on the
 * popup, which would cover the popup's own styling; the viewport and the
 * swipe area do not get that attribute, and `[data-side="bottom"]` is a far
 * better selector for a consumer to write against than
 * `[data-swipe-direction="down"]`.
 */
type DrawerContextValue = {
  side: DrawerSide;
  swipe: boolean;
  scrimFloor: boolean;
};

const DrawerContext = React.createContext<DrawerContextValue>({
  side: "right",
  swipe: true,
  scrimFloor: false,
});

export interface DrawerRootProps<Payload = unknown>
  extends Omit<BaseDrawerRootProps<Payload>, "swipeDirection"> {
  /**
   * Which edge of the viewport the drawer slides in from. It also decides the
   * direction of the dismiss gesture, which is why it lives on `Root` rather
   * than on `Popup`.
   *
   * Physical, not logical: `translate` has no logical form, and Base UI's
   * swipe direction is physical too. An RTL layout that wants its navigation
   * on the leading edge should say `side="right"` for that layout.
   * @default "right"
   */
  side?: DrawerSide;
  /**
   * Allow dragging the drawer to dismiss it. Turning it off keeps the drawer
   * fully usable — trigger, Escape, outside press and `Drawer.Close` all still
   * work — and only removes the gesture.
   *
   * Leave it on for anything that reaches a touch screen: a drag toward the
   * edge is how a drawer is expected to close there, and on a large phone it
   * is the only dismissal within reach of one thumb.
   * @default true
   */
  swipe?: boolean;
  /**
   * Heights a `side="top"` or `side="bottom"` drawer settles at. Numbers
   * between 0 and 1 are fractions of the viewport, numbers above 1 are pixels,
   * and strings carry their own `px`/`rem` unit — `["148px", 1]` is the usual
   * peek-then-full pair.
   *
   * Ignored for `side="left"` and `side="right"`, which have no snap axis.
   */
  snapPoints?: BaseDrawerRootProps<Payload>["snapPoints"];
}

/**
 * Groups all parts of a drawer and owns its open state.
 *
 * Renders no DOM element, so it takes no `className`, `style` or `ref` —
 * style `Drawer.Popup` instead. Every Base UI `Drawer.Root` prop is forwarded
 * unchanged (`open`, `defaultOpen`, `onOpenChange`, `onOpenChangeComplete`,
 * `modal`, `disablePointerDismissal`, `actionsRef`, `handle`, `triggerId`,
 * `defaultTriggerId`, `snapPoints`, `snapPoint`, `onSnapPointChange`,
 * `snapToSequentialPoints`) except `swipeDirection`, which `side` replaces.
 */
export function DrawerRoot<Payload>({
  side = "right",
  swipe = true,
  snapPoints,
  modal,
  ...props
}: DrawerRootProps<Payload>): React.JSX.Element {
  // Base UI reuses `--drawer-swipe-progress` for two different quantities. With
  // no snap points it is how far a dismissing drag has travelled, and driving
  // the scrim to nothing as the drawer leaves is exactly right. With snap
  // points it is instead the sheet's position within its snap range, and it
  // reaches 1 at the LOWEST snap — so a peeking sheet would clear the scrim
  // completely while the page behind it is still inert. The stylesheet holds a
  // floor when that combination is in play; a non-modal drawer wants no floor,
  // because there the undimmed page really is usable.
  const scrimFloor =
    modal !== false && snapPoints !== undefined && snapPoints.length > 0;

  const context = React.useMemo<DrawerContextValue>(
    () => ({ side, swipe, scrimFloor }),
    [side, swipe, scrimFloor],
  );

  return (
    <DrawerContext.Provider value={context}>
      <BaseDrawer.Root
        swipeDirection={SWIPE_DIRECTION[side]}
        snapPoints={snapPoints}
        modal={modal}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface DrawerTriggerProps<Payload = unknown>
  extends Omit<BaseDrawerTriggerProps<Payload>, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * `React.forwardRef` erases generics, so the exported value is re-typed with
 * a generic call signature — the same shape Base UI itself exports — to keep
 * `payload` and `handle` inferring together.
 */
interface DrawerTriggerComponent {
  <Payload>(props: DrawerTriggerProps<Payload>): React.JSX.Element;
}

/**
 * A button that opens the drawer.
 *
 * Renders a `<button>`. Pass `render={<Button />}` to compose it with a
 * styled button — the trigger's own neutral styling steps aside when `render`
 * is present, so the two never fight over the cascade.
 */
export const DrawerTrigger = React.forwardRef(function DrawerTrigger<Payload>(
  { className, render, ...props }: DrawerTriggerProps<Payload>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseDrawer.Trigger
      ref={ref}
      render={render}
      className={clsx(
        render === undefined && styles.trigger,
        "pui-focus-ring",
        className,
      )}
      {...props}
    />
  );
}) as DrawerTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

export interface DrawerPopupProps
  extends Omit<BaseDrawerPopupProps, "className"> {
  /**
   * How far the drawer extends along its own axis — width for `left`/`right`,
   * height for `top`/`bottom`. `"full"` covers the whole viewport.
   *
   * On `top`/`bottom` this is a *maximum*: a short sheet is only as tall as
   * its content, which is what a bottom sheet should do.
   * @default "md"
   */
  size?: DrawerSize;
  /**
   * `"edge"` sits flush against the side of the screen and rounds only its
   * two inner corners. `"floating"` insets the whole surface by
   * `--pui-drawer-inset` and rounds all four, so the page shows through
   * around it.
   * @default "edge"
   */
  variant?: DrawerVariant;
  /**
   * Keep the portal — and therefore the popup — in the DOM while the drawer
   * is closed. Needed when something inside must stay mounted (an iframe, a
   * media element, uncommitted form state).
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Element the portal renders into. Defaults to `document.body`; set it when
   * the drawer must live inside a specific stacking or shadow root.
   */
  container?: BaseDrawerPortalProps["container"];
  /**
   * Render the scrim behind the drawer. Turn it off for a non-modal drawer
   * that should leave the page visibly usable.
   * @default true
   */
  backdrop?: boolean;
  /**
   * Render the backdrop even when this drawer is nested inside another one.
   * Base UI suppresses nested backdrops by default — the parent recedes and
   * dims itself instead — so only set this when a nested drawer genuinely
   * needs its own scrim.
   * @default false
   */
  forceBackdrop?: boolean;
  /**
   * Additional class name(s) for the backdrop element. The popup's own
   * `className` cannot reach it, since the backdrop is a sibling rendered
   * inside this component.
   */
  backdropClassName?: string;
  /**
   * Additional class name(s) for the fixed container the popup is placed in.
   * It owns `--pui-drawer-z-index` and `--pui-drawer-inset` — the popup reads
   * the inset from here by inheritance, so setting it once on the viewport
   * keeps the surface and the gap around it in agreement.
   */
  viewportClassName?: string;
  /**
   * Additional class name(s) for the popup itself. Applied after the internal
   * styles so consumer utilities (e.g. Tailwind) win without needing
   * `!important`.
   */
  className?: string;
}

/**
 * The drawer surface, together with the three wrappers it always needs:
 * `Portal` → `Backdrop` + `Viewport` → `Popup`. Collapsing them into one
 * component keeps the common case to a single element while leaving every
 * Base UI `Popup` prop (`initialFocus`, `finalFocus`, `render`, …) available.
 *
 * `Title`, `Description` and `Close` must be rendered *inside* this
 * component: that is what auto-wires `aria-labelledby` / `aria-describedby`,
 * and a close button outside the popup is unreachable to touch screen-reader
 * users.
 *
 * Scrolling belongs to `Drawer.Content`, not to this element; the popup keeps
 * only a fallback `overflow` for drawers built without one. Base UI takes the
 * first scrollable ancestor of wherever the gesture started, so a swipe still
 * waits for that scroll to reach its end.
 */
export const DrawerPopup = React.forwardRef<HTMLDivElement, DrawerPopupProps>(
  function DrawerPopup(
    {
      size = "md",
      variant = "edge",
      keepMounted = false,
      container,
      backdrop = true,
      forceBackdrop = false,
      backdropClassName,
      viewportClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { side, swipe, scrimFloor } = React.useContext(DrawerContext);

    return (
      <BaseDrawer.Portal keepMounted={keepMounted} container={container}>
        {backdrop ? (
          <BaseDrawer.Backdrop
            forceRender={forceBackdrop}
            data-scrim-floor={scrimFloor ? "" : undefined}
            className={clsx(styles.backdrop, "pui-scrim", backdropClassName)}
          />
        ) : null}
        <BaseDrawer.Viewport
          data-side={side}
          data-variant={variant}
          className={clsx(styles.viewport, viewportClassName)}
        >
          <BaseDrawer.Popup
            ref={ref}
            // The popup is programmatically focused when the drawer opens by
            // touch, and that focus is keyboard-visible when it opens by
            // keyboard — so it needs a real ring, not the UA default.
            // `pui-hc-surface` gives it a boundary in forced-colors mode,
            // where the shadow above is stripped entirely.
            className={clsx(
              styles.popup,
              "pui-focus-ring",
              "pui-hc-surface",
              className,
            )}
            data-side={side}
            data-variant={variant}
            data-size={size}
            // Base UI resolves swipe eligibility with `closest()` from the
            // element under the pointer, so marking the popup opts out every
            // target inside it — for touch and for pointer alike — without
            // dropping `Drawer.Viewport`, which also owns touch scroll
            // locking and would warn if it went missing.
            data-base-ui-swipe-ignore={swipe ? undefined : ""}
            {...props}
          >
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Handle
 * ---------------------------------------------------------------------- */

export interface DrawerHandleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The grab bar that advertises the drag gesture.
 *
 * A decorative `<div>`, hidden from assistive technology: it is a picture of
 * an affordance, not a control, and the gesture it describes is never the
 * only way out of a drawer. Give the drawer a `Drawer.Close` as well.
 *
 * Keep it *outside* `Drawer.Content`. Content deliberately swallows mouse
 * drags so text stays selectable, so a handle placed inside it could not be
 * dragged with a mouse — which is the one input that has no other way to
 * start the gesture.
 */
export const DrawerHandle = React.forwardRef<HTMLDivElement, DrawerHandleProps>(
  function DrawerHandle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={clsx(styles.handle, className)}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------- */

export interface DrawerContentProps
  extends Omit<BaseDrawerContentProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The drawer's body.
 *
 * Renders a `<div>` that Base UI marks as content, which exempts it from
 * *mouse* dragging — a press-and-drag over this region selects text instead
 * of pulling the drawer. Touch dragging is unaffected, so the gesture still
 * works where it matters.
 *
 * It is also the drawer's scroll container, which is what keeps a
 * `Drawer.Handle` from scrolling away and lets a `Drawer.Footer` placed
 * *outside* it pin to the bottom of the drawer.
 *
 * On a `top`/`bottom` drawer it caps and centres its own width through
 * `--pui-drawer-content-max-inline-size`, which is what keeps a full-width
 * bottom sheet from running its text to both edges of a wide screen.
 */
export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent({ className, ...props }, ref) {
  return (
    <BaseDrawer.Content
      ref={ref}
      className={clsx(styles.content, className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface DrawerTitleProps
  extends Omit<BaseDrawerTitleProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The drawer's accessible name.
 *
 * Renders an `<h2>`. Inside `Drawer.Popup` it is wired up as the popup's
 * `aria-labelledby` automatically; every drawer should have one.
 */
export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  DrawerTitleProps
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <BaseDrawer.Title
      ref={ref}
      className={clsx(styles.title, className)}
      {...props}
    />
  );
});

export interface DrawerDescriptionProps
  extends Omit<BaseDrawerDescriptionProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A short explanation of what the drawer is for.
 *
 * Renders a `<p>`. Inside `Drawer.Popup` it becomes the popup's
 * `aria-describedby`, so it is announced after the title.
 */
export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <BaseDrawer.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Close
 * ---------------------------------------------------------------------- */

export interface DrawerCloseProps
  extends Omit<BaseDrawerCloseProps, "className"> {
  /**
   * Render as a square button sized for a single icon — the corner "×"
   * treatment. Enforces the 24px minimum hit target from WCAG SC 2.5.8.
   * Always pair with `aria-label`, since there is no text to announce.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that closes the drawer.
 *
 * Renders a `<button>`. Keep it inside `Drawer.Popup`: in a modal drawer the
 * rest of the page is inert, and a touch screen-reader user has no other way
 * out — the swipe gesture is not available to them. Pass `render={<Button />}`
 * to compose it with a styled button.
 */
export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  function DrawerClose({ iconOnly = false, className, render, ...props }, ref) {
    return (
      <BaseDrawer.Close
        ref={ref}
        render={render}
        className={clsx(
          render === undefined && styles.close,
          "pui-focus-ring",
          className,
        )}
        data-icon-only={iconOnly || undefined}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------- */

export interface DrawerFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * How the actions are distributed along the footer. `"between"` is the
   * pattern for a destructive action pushed away from the safe one.
   * @default "end"
   */
  align?: DrawerFooterAlign;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The action row at the bottom of a drawer.
 *
 * A plain `<div>` — not a Base UI part — that supplies the standard spacing
 * and alignment for the confirm/cancel buttons.
 */
export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  function DrawerFooter({ align = "end", className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.footer, className)}
        data-align={align}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * SwipeArea
 * ---------------------------------------------------------------------- */

export interface DrawerSwipeAreaProps
  extends Omit<BaseDrawerSwipeAreaProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * An invisible strip along the drawer's own edge that opens it when swiped
 * inward.
 *
 * Renders a `<div>`, pinned with `position: fixed` and sized by
 * `--pui-drawer-swipe-area-size`. It sits *outside* the portal — it has to
 * exist while the drawer is closed — so it is the one part that lives beside
 * `Drawer.Trigger` rather than inside `Drawer.Popup`.
 *
 * It covers that strip of the page for pointer purposes, so anything the app
 * puts hard against that edge becomes unreachable. Pair it with a real
 * trigger; a gesture with no visible control is undiscoverable, and it is not
 * available to a keyboard or screen-reader user at all.
 */
export const DrawerSwipeArea = React.forwardRef<
  HTMLDivElement,
  DrawerSwipeAreaProps
>(function DrawerSwipeArea({ className, ...props }, ref) {
  const { side } = React.useContext(DrawerContext);

  return (
    <BaseDrawer.SwipeArea
      ref={ref}
      data-side={side}
      className={clsx(styles.swipeArea, className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * VirtualKeyboardProvider
 * ---------------------------------------------------------------------- */

export type DrawerVirtualKeyboardProviderProps =
  BaseDrawerVirtualKeyboardProviderProps;

/**
 * Makes a drawer aware of the software keyboard.
 *
 * Renders no DOM element. Wrap a `top`/`bottom` drawer that contains text
 * fields in it: the viewport then publishes `--drawer-keyboard-inset`, which
 * this component's stylesheet adds to the viewport's bottom padding, so the
 * sheet rides above the keyboard instead of behind it. Drawers without it are
 * unaffected.
 */
export function DrawerVirtualKeyboardProvider(
  props: DrawerVirtualKeyboardProviderProps,
): React.JSX.Element {
  return <BaseDrawer.VirtualKeyboardProvider {...props} />;
}

/* -------------------------------------------------------------------------
 * Namespace
 * ---------------------------------------------------------------------- */

/**
 * A panel that slides in from an edge of the screen, built on Base UI's
 * `Drawer`.
 *
 * ```tsx
 * <Drawer.Root side="right">
 *   <Drawer.Trigger render={<Button />}>Filters</Drawer.Trigger>
 *   <Drawer.Popup>
 *     <Drawer.Content>
 *       <Drawer.Title>Filters</Drawer.Title>
 *       <Drawer.Description>Narrow the result list.</Drawer.Description>
 *       <Drawer.Footer>
 *         <Drawer.Close render={<Button />}>Apply</Drawer.Close>
 *       </Drawer.Footer>
 *     </Drawer.Content>
 *   </Drawer.Popup>
 * </Drawer.Root>
 * ```
 *
 * Use it for content that belongs beside the page rather than on top of it —
 * navigation, filters, a detail panel, a mobile action sheet. When the task
 * needs the user's whole attention and has no relationship to a screen edge,
 * reach for `Dialog`.
 */
export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Popup: DrawerPopup,
  Handle: DrawerHandle,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Footer: DrawerFooter,
  SwipeArea: DrawerSwipeArea,
  VirtualKeyboardProvider: DrawerVirtualKeyboardProvider,
  /** Creates a handle that connects a `Drawer.Root` to detached triggers. */
  createHandle: BaseDrawer.createHandle,
};
