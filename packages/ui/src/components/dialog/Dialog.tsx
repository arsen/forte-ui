"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import type {
  DialogRootProps as BaseDialogRootProps,
  DialogTriggerProps as BaseDialogTriggerProps,
  DialogPopupProps as BaseDialogPopupProps,
  DialogPortalProps as BaseDialogPortalProps,
  DialogTitleProps as BaseDialogTitleProps,
  DialogDescriptionProps as BaseDialogDescriptionProps,
  DialogCloseProps as BaseDialogCloseProps,
} from "@base-ui/react/dialog";
import type {
  AlertDialogRootProps as BaseAlertDialogRootProps,
  AlertDialogTriggerProps as BaseAlertDialogTriggerProps,
} from "@base-ui/react/alert-dialog";
import { clsx } from "clsx";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg" | "fullscreen";
export type DialogFooterAlign = "start" | "center" | "end" | "between";
export type DialogOrigin = "trigger" | "center";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/**
 * Props for `Dialog.Root`. Every Base UI `Dialog.Root` prop is forwarded
 * unchanged — `open`, `defaultOpen`, `onOpenChange`, `onOpenChangeComplete`,
 * `modal`, `disablePointerDismissal`, `actionsRef`, `handle`, `triggerId`,
 * `defaultTriggerId`.
 *
 * `Root` renders no DOM element, so it accepts no `className`, `style` or
 * `ref`. Style the popup instead.
 */
export type DialogRootProps<Payload = unknown> = BaseDialogRootProps<Payload>;

/**
 * Groups all parts of a dialog and owns its open state.
 *
 * Renders no DOM element of its own.
 */
export function DialogRoot<Payload>(
  props: DialogRootProps<Payload>,
): React.JSX.Element {
  return <BaseDialog.Root {...props} />;
}

/**
 * Props for `AlertDialog.Root`.
 *
 * Identical to `DialogRootProps` minus `modal` and `disablePointerDismissal`:
 * an alert dialog is *always* modal and never dismisses on an outside press,
 * because it interrupts the user to ask a question that has to be answered.
 */
export type AlertDialogRootProps<Payload = unknown> =
  BaseAlertDialogRootProps<Payload>;

/**
 * Groups all parts of an alert dialog — a modal, non-dismissible dialog that
 * requires an explicit response.
 *
 * Renders no DOM element of its own.
 */
export function AlertDialogRoot<Payload>(
  props: AlertDialogRootProps<Payload>,
): React.JSX.Element {
  return <BaseAlertDialog.Root {...props} />;
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface DialogTriggerProps<Payload = unknown>
  extends Omit<BaseDialogTriggerProps<Payload>, "className"> {
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
interface DialogTriggerComponent {
  <Payload>(props: DialogTriggerProps<Payload>): React.JSX.Element;
}

/**
 * A button that opens the dialog.
 *
 * Renders a `<button>`. Pass `render={<Button />}` to compose it with a
 * styled button — the trigger's own neutral styling steps aside when `render`
 * is present, so the two never fight over the cascade.
 */
export const DialogTrigger = React.forwardRef(function DialogTrigger<Payload>(
  { className, render, ...props }: DialogTriggerProps<Payload>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseDialog.Trigger
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
}) as DialogTriggerComponent;

export interface AlertDialogTriggerProps<Payload = unknown>
  extends Omit<BaseAlertDialogTriggerProps<Payload>, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

interface AlertDialogTriggerComponent {
  <Payload>(props: AlertDialogTriggerProps<Payload>): React.JSX.Element;
}

/**
 * A button that opens the alert dialog.
 *
 * Renders a `<button>`. Identical to `Dialog.Trigger` except that it accepts
 * an `AlertDialog` handle.
 */
export const AlertDialogTrigger = React.forwardRef(
  function AlertDialogTrigger<Payload>(
    { className, render, ...props }: AlertDialogTriggerProps<Payload>,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) {
    return (
      <BaseAlertDialog.Trigger
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
  },
) as AlertDialogTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

/** Marks a popup that has been aimed at its trigger; the stylesheet keys off it. */
const ORIGIN_ATTR = "data-origin";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The trigger that opened this popup, or `null` when there isn't one — a
 * dialog opened programmatically, through `defaultOpen`, or from a detached
 * handle whose trigger has since unmounted.
 *
 * Base UI points every trigger at its popup with `aria-controls`, so the
 * relationship is already in the DOM and needs no extra wiring. `CSS.escape`
 * because the id is generated and is not guaranteed to be a bare identifier.
 */
function findTrigger(popup: HTMLElement): HTMLElement | null {
  const id = popup.id;
  if (!id) {
    return null;
  }
  const selector = `[aria-controls="${typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id}"]`;
  return popup.ownerDocument.querySelector<HTMLElement>(selector);
}

/**
 * The popup's *layout* box.
 *
 * `getBoundingClientRect()` reports the box after transforms, and at the
 * moment this runs the popup is sitting in its starting style — scaled down
 * and offset. That is precisely the transform whose origin is being computed,
 * so measuring through it would feed the result back into itself.
 *
 * Transitions are suppressed around the measurement because
 * `getBoundingClientRect()` forces a style flush: without it the browser sees
 * `transform` change to `none` and back as two separate style changes and
 * starts a transition toward each.
 */
function measureLayoutRect(el: HTMLElement): DOMRect {
  const { transition, transform } = el.style;
  el.style.transition = "none";
  el.style.transform = "none";
  const rect = el.getBoundingClientRect();
  el.style.transform = transform;
  // Flush the restored transform while transitions are still off, so it is the
  // value the enter transition starts from rather than something to animate to.
  void el.offsetHeight;
  el.style.transition = transition;
  return rect;
}

/**
 * Points the popup's `transform-origin` at the centre of the trigger that
 * opened it, in pixels relative to the popup's top-left corner.
 *
 * Only measurement happens here — every duration, curve and scale stays in the
 * stylesheet, where it remains overridable and where reduced motion already
 * neutralises it.
 *
 * The origin is clamped to one popup-width/height outside the box on each
 * side. Past that the scale stops reading as "it grew out of the button" and
 * starts reading as the dialog being flung across the screen, because the
 * further the origin is from the popup, the more of the scale is expressed as
 * translation.
 */
function aimAtTrigger(el: HTMLElement): void {
  const trigger = findTrigger(el);
  if (trigger == null) {
    el.removeAttribute(ORIGIN_ATTR);
    return;
  }

  const t = trigger.getBoundingClientRect();
  // A trigger that is display:none or has been scrolled out of a collapsed
  // container measures as an empty box; aiming at it would put the origin in
  // the top-left of the viewport.
  if (t.width === 0 && t.height === 0) {
    el.removeAttribute(ORIGIN_ATTR);
    return;
  }

  const p = measureLayoutRect(el);
  if (p.width === 0 || p.height === 0) {
    el.removeAttribute(ORIGIN_ATTR);
    return;
  }

  const x = clamp(t.left + t.width / 2 - p.left, -p.width, p.width * 2);
  const y = clamp(t.top + t.height / 2 - p.top, -p.height, p.height * 2);

  el.style.setProperty("--pui-dialog-origin-x", `${Math.round(x)}px`);
  el.style.setProperty("--pui-dialog-origin-y", `${Math.round(y)}px`);
  el.setAttribute(ORIGIN_ATTR, "");
}

/**
 * Returns a ref callback for the popup that keeps its transform origin aimed
 * at the trigger.
 *
 * A ref callback and not an effect, for two reasons. The popup element does
 * not exist when `Dialog.Popup` mounts — Base UI's `Portal` renders nothing
 * until the dialog opens — so an effect on this component would run once at
 * page load against a null ref and never fire again when the element finally
 * appeared. And the measurement has to land before the browser paints the
 * starting style, or the first frame is drawn from the centre and the dialog
 * visibly jumps; ref callbacks run during commit, ahead of paint.
 *
 * A `keepMounted` popup keeps the same element across opens, so the callback
 * alone would only aim it once. Watching for Base UI re-applying
 * `[data-starting-style]` re-aims it on every subsequent open, and covers the
 * case where the trigger has moved in between.
 *
 * The observer is torn down from the callback itself rather than from an
 * effect cleanup: React 18 ignores a function returned from a ref callback,
 * and this package supports React 18.
 */
function useTriggerOrigin(
  enabled: boolean,
): (node: HTMLDivElement | null) => void {
  const observerRef = React.useRef<MutationObserver | null>(null);

  React.useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  return React.useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (node == null) {
        return;
      }
      if (!enabled) {
        node.removeAttribute(ORIGIN_ATTR);
        return;
      }

      aimAtTrigger(node);

      const observer = new MutationObserver(() => {
        if (node.hasAttribute("data-starting-style")) {
          aimAtTrigger(node);
        }
      });
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["data-starting-style"],
      });
      observerRef.current = observer;
    },
    [enabled],
  );
}

export interface DialogPopupProps
  extends Omit<BaseDialogPopupProps, "className"> {
  /**
   * Maximum width of the popup. `"fullscreen"` drops the radius and the
   * viewport padding and lets the surface fill the screen, which is the
   * usual mobile treatment for a long form.
   * @default "md"
   */
  size?: DialogSize;
  /**
   * Keep the portal — and therefore the popup — in the DOM while the dialog
   * is closed. Needed when something inside must stay mounted (an iframe, a
   * media element, uncommitted form state).
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Element the portal renders into. Defaults to `document.body`; set it when
   * the dialog must live inside a specific stacking or shadow root.
   */
  container?: BaseDialogPortalProps["container"];
  /**
   * Render the scrim behind the popup. Turn it off for a non-modal dialog
   * that should leave the page visibly usable.
   * @default true
   */
  backdrop?: boolean;
  /**
   * Render the backdrop even when this dialog is nested inside another one.
   * Base UI suppresses nested backdrops by default — the parent dims itself
   * through `[data-nested-dialog-open]` instead — so only set this when a
   * nested dialog genuinely needs its own scrim.
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
   * Additional class name(s) for the scrollable viewport that positions the
   * popup. Use it to change alignment (e.g. pin the dialog to the top), or to
   * re-point `--pui-dialog-z-index` — it defaults to 40, one band under the
   * anchored popups, so a `Select` or `Tooltip` inside a dialog stays above
   * it. The backdrop reads `--pui-dialog-backdrop-z-index` (39) from
   * `backdropClassName`, since it is the viewport's sibling.
   */
  viewportClassName?: string;
  /**
   * Where the open and close scale grows from.
   *
   * `"trigger"` aims it at the centre of the button that opened the dialog, so
   * the surface reads as growing out of that button and collapsing back into
   * it. `"center"` keeps the centred gesture.
   *
   * `"trigger"` falls back to the centred gesture on its own whenever there is
   * no trigger to aim at — a dialog opened programmatically or through
   * `defaultOpen` — and is ignored for `size="fullscreen"`, where a sheet
   * covering the screen has no meaningful point to grow from.
   * @default "trigger"
   */
  origin?: DialogOrigin;
  /**
   * Additional class name(s) for the popup itself. Applied after the internal
   * styles so consumer utilities (e.g. Tailwind) win without needing
   * `!important`.
   */
  className?: string;
}

/**
 * The dialog surface, together with the three wrappers it always needs:
 * `Portal` → `Backdrop` + `Viewport` → `Popup`. Collapsing them into one
 * component keeps the common case to a single element while leaving every
 * Base UI `Popup` prop (`initialFocus`, `finalFocus`, `render`, …) available.
 *
 * `Title`, `Description` and `Close` must be rendered *inside* this component:
 * that is what auto-wires `aria-labelledby` / `aria-describedby`, and a close
 * button outside the popup is unreachable to touch screen-reader users.
 *
 * The same component serves `AlertDialog` — Base UI's alert dialog re-exports
 * these exact parts.
 */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(
  function DialogPopup(
    {
      size = "md",
      keepMounted = false,
      container,
      backdrop = true,
      forceBackdrop = false,
      backdropClassName,
      viewportClassName,
      origin = "trigger",
      className,
      children,
      ...props
    },
    ref,
  ) {
    const aimOrigin = useTriggerOrigin(
      origin === "trigger" && size !== "fullscreen",
    );
    // The origin hook needs the popup element, and so may the consumer, so the
    // two refs are merged rather than one shadowing the other.
    const popupRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        aimOrigin(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref != null) {
          ref.current = node;
        }
      },
      [ref, aimOrigin],
    );

    return (
      <BaseDialog.Portal keepMounted={keepMounted} container={container}>
        {backdrop ? (
          <BaseDialog.Backdrop
            forceRender={forceBackdrop}
            className={clsx(styles.backdrop, "pui-scrim", backdropClassName)}
          />
        ) : null}
        <BaseDialog.Viewport
          data-size={size}
          className={clsx(styles.viewport, viewportClassName)}
        >
          <BaseDialog.Popup
            ref={popupRef}
            // The popup is programmatically focused when the dialog opens by
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
            data-size={size}
            {...props}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface DialogTitleProps
  extends Omit<BaseDialogTitleProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The dialog's accessible name.
 *
 * Renders an `<h2>`. Inside `Dialog.Popup` it is wired up as the popup's
 * `aria-labelledby` automatically; every dialog should have one.
 */
export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      ref={ref}
      className={clsx(styles.title, className)}
      {...props}
    />
  );
});

export interface DialogDescriptionProps
  extends Omit<BaseDialogDescriptionProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A short explanation of what the dialog is for.
 *
 * Renders a `<p>`. Inside `Dialog.Popup` it becomes the popup's
 * `aria-describedby`, so it is announced after the title.
 */
export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Close
 * ---------------------------------------------------------------------- */

export interface DialogCloseProps
  extends Omit<BaseDialogCloseProps, "className"> {
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
 * A button that closes the dialog.
 *
 * Renders a `<button>`. Keep it inside `Dialog.Popup`: in a modal dialog the
 * rest of the page is inert, and a touch screen-reader user has no other way
 * out. Pass `render={<Button />}` to compose it with a styled button — the
 * close button's own neutral styling steps aside when `render` is present.
 */
export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  DialogCloseProps
>(function DialogClose({ iconOnly = false, className, render, ...props }, ref) {
  return (
    <BaseDialog.Close
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
});

/* -------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------- */

export interface DialogFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * How the actions are distributed along the footer. `"between"` is the
   * pattern for a destructive action pushed away from the safe one.
   * @default "end"
   */
  align?: DialogFooterAlign;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The action row at the bottom of a dialog.
 *
 * A plain `<div>` — not a Base UI part — that supplies the standard spacing
 * and alignment for the confirm/cancel buttons. In a `size="fullscreen"`
 * dialog it sinks to the bottom edge.
 */
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ align = "end", className, ...props }, ref) {
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
 * Namespaces
 * ---------------------------------------------------------------------- */

/**
 * A modal surface built on Base UI's `Dialog`.
 *
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger>
 *   <Dialog.Popup size="sm">
 *     <Dialog.Title>Edit profile</Dialog.Title>
 *     <Dialog.Description>Change your display name.</Dialog.Description>
 *     <Dialog.Footer>
 *       <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
 *         Cancel
 *       </Dialog.Close>
 *       <Dialog.Close render={<Button />}>Save</Dialog.Close>
 *     </Dialog.Footer>
 *   </Dialog.Popup>
 * </Dialog.Root>
 * ```
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Footer: DialogFooter,
  /** Creates a handle that connects a `Dialog.Root` to detached triggers. */
  createHandle: BaseDialog.createHandle,
};

/**
 * An always-modal dialog that interrupts the user and requires an answer —
 * confirming a delete, discarding unsaved work.
 *
 * Shares every part and every style with `Dialog`; only `Root` and `Trigger`
 * differ. There is deliberately no `modal` or `disablePointerDismissal` prop:
 * an alert dialog traps focus, locks page scroll, and cannot be dismissed by
 * clicking outside it. Give it at least one `AlertDialog.Close`.
 */
export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  // Base UI's alert-dialog entry point re-exports these exact components, so
  // the styled wrappers above are the correct parts for both namespaces.
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Footer: DialogFooter,
  /** Creates a handle that connects an `AlertDialog.Root` to detached triggers. */
  createHandle: BaseAlertDialog.createHandle,
};
