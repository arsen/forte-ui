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
// The built-in dialogs behind `useDialog()` are compositions of the library's
// own controls, so they are reached for here the way `ColorPicker` reaches for
// `Popover`. Nothing above this line imports them, so a consumer who only ever
// renders `Dialog.Root` still tree-shakes all four away.
import { Button, type ButtonTone } from "../button";
import { Field } from "../field";
import { Form } from "../form";
import { Input } from "../input";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg" | "fullscreen";
export type DialogFooterAlign = "start" | "center" | "end" | "between";

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
        "forte-focus-ring",
        className,
      )}
      data-forte="dialog-trigger"
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
          "forte-focus-ring",
          className,
        )}
        data-forte="dialog-trigger"
        {...props}
      />
    );
  },
) as AlertDialogTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

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
   * re-point `--forte-dialog-z-index` — it defaults to 40, one band under the
   * anchored popups, so a `Select` or `Tooltip` inside a dialog stays above
   * it. The backdrop reads `--forte-dialog-backdrop-z-index` (39) from
   * `backdropClassName`, since it is the viewport's sibling.
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
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <BaseDialog.Portal keepMounted={keepMounted} container={container}>
        {backdrop ? (
          <BaseDialog.Backdrop
            forceRender={forceBackdrop}
            className={clsx(styles.backdrop, "forte-scrim", backdropClassName)}
            data-forte="dialog-backdrop"
          />
        ) : null}
        <BaseDialog.Viewport
          data-size={size}
          className={clsx(styles.viewport, viewportClassName)}
          data-forte="dialog-viewport"
        >
          <BaseDialog.Popup
            ref={ref}
            // The popup is programmatically focused when the dialog opens by
            // touch, and that focus is keyboard-visible when it opens by
            // keyboard — so it needs a real ring, not the UA default.
            // `forte-hc-surface` gives it a boundary in forced-colors mode,
            // where the shadow above is stripped entirely.
            className={clsx(
              styles.popup,
              "forte-focus-ring",
              "forte-hc-surface",
              className,
            )}
            data-forte="dialog-popup"
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
 * Surface
 * ---------------------------------------------------------------------- */

export interface DialogSurfaceProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The visible panel, for dialogs that also carry chrome *outside* it — a close
 * button floating clear of the corner, a caption under the sheet, pager arrows
 * beside it.
 *
 * Use it and `Dialog.Popup` stops painting: the popup keeps the sizing, the
 * focus trap and the enter/exit gesture but turns into a transparent container,
 * and this element becomes the surface. Everything stays inside `Dialog.Popup`
 * and therefore inside the tab order and the accessibility tree — which is the
 * whole point, since in a modal dialog anything outside the popup is inert.
 *
 * There is no prop to pair it with. The stylesheet asks `.popup:has(> .surface)`,
 * so the popup switches on the presence of this element and the two cannot
 * disagree. Keep it a *direct* child of `Dialog.Popup`.
 *
 * A plain `<div>`, not a Base UI part — the primitive has no such anatomy, and
 * Base UI's own example for this pattern uses a bare div too.
 */
export const DialogSurface = React.forwardRef<
  HTMLDivElement,
  DialogSurfaceProps
>(function DialogSurface({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      // The forced-colors boundary moves here with the paint: the popup
      // surrenders its own in the `a11y` layer once this element exists.
      className={clsx(styles.surface, "forte-hc-surface", className)}
      data-forte="dialog-surface"
      {...props}
    />
  );
});

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
      data-forte="dialog-title"
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
      data-forte="dialog-description"
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
        "forte-focus-ring",
        className,
      )}
      data-forte="dialog-close"
      {/* Spread-when-true, not `iconOnly || undefined`: JSX keeps an
        * `undefined`-valued key in the props object and the render-prop
        * merge copies it verbatim, so the plain attribute would erase the
        * `data-icon-only` a composed `render={<Button iconOnly />}` sets
        * for itself — silently un-squaring the button. */
      ...(iconOnly && { "data-icon-only": true })}
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
        data-forte="dialog-footer"
        data-align={align}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Programmatic dialogs — options
 * ---------------------------------------------------------------------- */

/**
 * The fields every built-in dialog understands.
 *
 * `title` and `description` are the two fields a toast takes, and they mean
 * the same thing here — which is why `dialog.confirm("Delete this?")` becomes
 * the *title* rather than the body. The title is the dialog's accessible name,
 * and a dialog without one is announced as just "dialog".
 */
export interface DialogMessageOptions {
  /** The question or the statement, and the dialog's accessible name. */
  title?: React.ReactNode;
  /** A second line under it, and the dialog's accessible description. */
  description?: React.ReactNode;
  /**
   * Maximum width of the popup. These dialogs hold a sentence and two
   * buttons, so they start narrower than a composed one.
   * @default "sm"
   */
  size?: DialogSize;
  /**
   * Tone of the button that answers the dialog. Reach for `"danger"` whenever
   * the answer destroys something — it also moves the footer to
   * `align="between"`, which pushes the safe button away from it.
   * @default "primary"
   */
  tone?: ButtonTone;
  /**
   * Additional class name(s) for the popup — the place to set a
   * `--forte-dialog-*` knob for one call.
   */
  className?: string;
}

/** Options for `dialog.alert()`. */
export interface DialogAlertOptions extends DialogMessageOptions {
  /**
   * Label of the single acknowledging button.
   * @default the provider's `labels.ok`, "OK"
   */
  okLabel?: React.ReactNode;
}

/** Options for `dialog.confirm()`. */
export interface DialogConfirmOptions extends DialogMessageOptions {
  /**
   * Label of the button that resolves the promise with `true`.
   * @default the provider's `labels.confirm`, "Confirm"
   */
  confirmLabel?: React.ReactNode;
  /**
   * Label of the button that resolves it with `false`.
   * @default the provider's `labels.cancel`, "Cancel"
   */
  cancelLabel?: React.ReactNode;
  /**
   * How the two buttons are distributed along the footer.
   * @default `"between"` when `tone` is `"danger"`, `"end"` otherwise
   */
  align?: DialogFooterAlign;
}

/** Options for `dialog.confirmWithInput()`. */
export interface DialogConfirmWithInputOptions extends DialogConfirmOptions {
  /**
   * The exact string the user has to type before the confirm button enables.
   * Surrounding whitespace is ignored, since a pasted value often carries a
   * trailing space and that is not a different answer.
   */
  confirmValue: string;
  /**
   * Label above the input.
   * @default the provider's `labels.confirmInput`, "Type <confirmValue> to confirm"
   */
  inputLabel?: React.ReactNode;
  /**
   * Placeholder inside the input.
   * @default `confirmValue`
   */
  placeholder?: string;
  /**
   * Whether the typed value has to match `confirmValue`'s case. Leave it on
   * for a destructive action: an answer that has to be typed exactly is the
   * whole point of the pattern.
   * @default true
   */
  caseSensitive?: boolean;
}

/**
 * What a component rendered by `dialog.show()` receives.
 *
 * It renders the *contents* of the dialog — normally one `Dialog.Popup` — and
 * not the root. The provider owns the root, which is what lets it stack the
 * dialog on whatever is already open, hold the entry in the tree until the
 * exit transition ends, and guarantee that the promise settles even when the
 * dialog is dismissed by Escape rather than answered by a button.
 */
export interface CustomDialogProps<Payload = void, Result = void> {
  /** The second argument `dialog.show()` was called with. */
  payload: Payload;
  /**
   * Answers the dialog: resolves the promise with `result` and starts the exit
   * transition. Stable for the life of the dialog, and safe to call twice —
   * the first answer is the one that is kept.
   */
  close: (result: Result) => void;
  /**
   * Dismisses the dialog: resolves the promise with `dismissValue` — the same
   * thing Escape and an outside press do. It exists because `close()` demands
   * a `Result`, and a cancel button has none to give.
   */
  dismiss: () => void;
}

/** A component that can be handed to `dialog.show()`. */
export type CustomDialogComponent<Payload = void, Result = void> =
  React.ComponentType<CustomDialogProps<Payload, Result>>;

/** Options for `dialog.show()`. */
export interface DialogShowOptions<Result = void> {
  /**
   * Render an `AlertDialog.Root` instead of a `Dialog.Root`: always modal,
   * never dismissed by a press outside it. Use it when the dialog asks a
   * question that has to be answered.
   * @default false
   */
  alert?: boolean;
  /**
   * What the promise resolves to when the dialog is dismissed — Escape, an
   * outside press, the provider unmounting — rather than answered through
   * `close()`.
   * @default undefined
   */
  dismissValue?: Result;
}

/* -------------------------------------------------------------------------
 * Programmatic dialogs — labels
 * ---------------------------------------------------------------------- */

/**
 * The copy the built-in dialogs put on screen that the call site does not
 * supply. Override it on `Dialog.Provider` — that is the translation seam, and
 * it is the reason `confirm()` can take a message and nothing else.
 */
export interface DialogLabels {
  /** The single button on `alert()`. */
  ok: React.ReactNode;
  /** The affirmative button on `confirm()` and `confirmWithInput()`. */
  confirm: React.ReactNode;
  /** The dismissing button on both. */
  cancel: React.ReactNode;
  /** The label above the input on `confirmWithInput()`. */
  confirmInput: (confirmValue: string) => React.ReactNode;
}

const DEFAULT_DIALOG_LABELS: DialogLabels = {
  ok: "OK",
  confirm: "Confirm",
  cancel: "Cancel",
  confirmInput: (confirmValue) => (
    <>
      Type <strong>{confirmValue}</strong> to confirm
    </>
  ),
};

const DialogLabelsContext = React.createContext<DialogLabels>(
  DEFAULT_DIALOG_LABELS,
);

/* -------------------------------------------------------------------------
 * Programmatic dialogs — the stack
 * ---------------------------------------------------------------------- */

/** One dialog on the stack, waiting to be answered. */
interface DialogEntry {
  id: string;
  /**
   * `false` starts the exit transition. The entry stays in the tree until
   * `onOpenChangeComplete` reports the transition has ended — remove it on the
   * close *request* instead and the dialog vanishes rather than leaving.
   */
  open: boolean;
  /**
   * The dialog this one is rendered *inside*, or `null` for one rendered at the
   * top of the tree. Decided when the dialog opens — it is whichever dialog was
   * on screen at that moment — and never revised.
   *
   * Fixed at that moment for a reason. A dialog opened while another is still
   * animating out (`await confirm()` then `await alert()`, which is the most
   * ordinary sequence there is) must NOT become that dialog's child: the parent
   * would be removed the instant its exit finished, taking its subtree's
   * position in the React tree with it, and the child would remount mid-enter —
   * or, if it had already been answered, never be removed at all.
   */
  parentId: string | null;
  /** Whether the root is an `AlertDialog.Root` rather than a `Dialog.Root`. */
  alert: boolean;
  Content: CustomDialogComponent<unknown, unknown>;
  payload: unknown;
  /** Resolves the promise the opening call handed back. */
  resolve: (result: unknown) => void;
  /** What that promise resolves to when the dialog is dismissed, not answered. */
  dismissValue: unknown;
  /** Records the answer and starts the exit. Stable for the entry's life. */
  close: (result: unknown) => void;
  /** `close()` with the dismissal value. Stable for the entry's life. */
  dismiss: () => void;
}

/**
 * The shared list behind a provider and, when there is one, a manager.
 *
 * Not exported: the only two things that touch it are `Dialog.Provider` and
 * the API built over it, and a manager carries its store in a module-level
 * `WeakMap` rather than on a public field.
 */
interface DialogStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly DialogEntry[];
  open: <Payload, Result>(init: {
    alert: boolean;
    Content: CustomDialogComponent<Payload, Result>;
    payload: Payload;
    dismissValue: Result;
  }) => Promise<Result>;
  /** Drops an entry once its exit transition has finished. */
  remove: (id: string) => void;
  closeTop: () => void;
  closeAll: () => void;
  /** Empties the stack, settling everything on it. */
  clear: () => void;
}

/**
 * The empty stack, shared by every store.
 *
 * One frozen array rather than a fresh `[]` per store, because
 * `useSyncExternalStore` compares snapshots by identity and calls
 * `getServerSnapshot` on every server render — a new array each time is an
 * infinite loop during SSR.
 */
const NO_DIALOGS: readonly DialogEntry[] = Object.freeze([]);

let dialogCount = 0;

function createDialogStore(): DialogStore {
  let entries: readonly DialogEntry[] = NO_DIALOGS;
  const listeners = new Set<() => void>();
  /**
   * Ids whose promise has already resolved. A dialog settles exactly once: the
   * answer is recorded by a button, and the close it triggers arrives a moment
   * later carrying the *dismissal* value, which must not overwrite it.
   */
  const settled = new Set<string>();

  function emit(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function find(id: string): DialogEntry | undefined {
    return entries.find((entry) => entry.id === id);
  }

  /** The dialog currently on screen, past any that are on their way out. */
  function topmostOpen(): DialogEntry | undefined {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      if (entry != null && entry.open) {
        return entry;
      }
    }
    return undefined;
  }

  function settle(entry: DialogEntry, result: unknown): void {
    if (settled.has(entry.id)) {
      return;
    }
    settled.add(entry.id);
    entry.resolve(result);
  }

  function setOpen(id: string, open: boolean): void {
    const entry = find(id);
    if (entry == null || entry.open === open) {
      return;
    }
    entries = entries.map((current) =>
      current.id === id ? { ...current, open } : current,
    );
    emit();
  }

  const store: DialogStore = {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot() {
      return entries;
    },

    open({ alert, Content, payload, dismissValue }) {
      return new Promise((resolve) => {
        dialogCount += 1;
        const id = `forte-dialog-${dialogCount}`;
        const entry: DialogEntry = {
          id,
          open: true,
          // The dialog on screen right now, if there is one — not simply the
          // last entry, which may be one that has been answered and is only
          // still here to finish leaving.
          parentId: topmostOpen()?.id ?? null,
          alert,
          // The stack is heterogeneous — every entry pairs a different payload
          // type with a different result type — and the two are tied together
          // at the call site, which is the only place that can check them.
          Content: Content as CustomDialogComponent<unknown, unknown>,
          payload,
          resolve: resolve as (result: unknown) => void,
          dismissValue,
          close: (result) => {
            const current = find(id);
            if (current != null) {
              settle(current, result);
            }
            setOpen(id, false);
          },
          dismiss: () => {
            entry.close(dismissValue);
          },
        };
        entries = [...entries, entry];
        emit();
      });
    },

    remove(id) {
      const entry = find(id);
      if (entry == null) {
        return;
      }
      settle(entry, entry.dismissValue);
      // Anything opened from this dialog moves up to take its place. Normally
      // there is nothing to move — a dialog cannot be answered while another
      // one covers it — but code holding the `close` from an earlier `show()`
      // can do it anyway, and a child left pointing at a parent that no longer
      // exists would be rendered at no level at all: gone from the screen,
      // still on the stack, its promise pending for good. Re-parenting costs
      // those children a remount and is the cheaper of the two.
      entries = entries
        .filter((current) => current.id !== id)
        .map((current) =>
          current.parentId === id
            ? { ...current, parentId: entry.parentId }
            : current,
        );
      settled.delete(id);
      emit();
    },

    closeTop() {
      const entry = topmostOpen();
      if (entry != null) {
        settle(entry, entry.dismissValue);
        setOpen(entry.id, false);
      }
    },

    closeAll() {
      const open = entries.filter((entry) => entry.open);
      if (open.length === 0) {
        return;
      }
      for (const entry of open) {
        settle(entry, entry.dismissValue);
      }
      entries = entries.map((entry) =>
        entry.open ? { ...entry, open: false } : entry,
      );
      emit();
    },

    clear() {
      if (entries.length === 0) {
        return;
      }
      const previous = entries;
      entries = NO_DIALOGS;
      emit();
      for (const entry of previous) {
        settle(entry, entry.dismissValue);
      }
      settled.clear();
    },
  };

  return store;
}

/* -------------------------------------------------------------------------
 * Programmatic dialogs — the API
 * ---------------------------------------------------------------------- */

/**
 * Whether the argument is an options object rather than a bare message.
 *
 * `ReactNode` and the options objects overlap on exactly two shapes — a React
 * element and an array, both of which are objects — so both are ruled out by
 * name. `Toast` makes the same test for the same reason; they are not shared
 * because they guard different option shapes, and neither module should have
 * to import the other to decide what a message is.
 */
function isDialogOptions<Options extends DialogMessageOptions>(
  value: React.ReactNode | Options,
): value is Options {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  );
}

/** `confirm("Delete this?")` and `confirm({ title: "Delete this?" })` agree. */
function normalizeMessage<Options extends DialogMessageOptions>(
  options: React.ReactNode | Options,
): Options {
  return isDialogOptions(options) ? options : ({ title: options } as Options);
}

/**
 * The dialog API — what `useDialog()` returns, and what
 * `Dialog.createManager()` gives you outside React.
 *
 * Every method resolves when the user answers or dismisses the dialog, not
 * when it finishes animating away: an `await dialog.confirm()` continues the
 * moment the decision is made.
 */
export interface DialogApi {
  /**
   * Shows a message that has to be acknowledged. Resolves when it is.
   *
   * A bare message becomes the `title`, which is the dialog's accessible name.
   */
  alert: (options: React.ReactNode | DialogAlertOptions) => Promise<void>;
  /**
   * Asks a yes-or-no question. Resolves to `true` when the user confirms, and
   * to `false` for every other way out — Cancel, Escape, the provider
   * unmounting.
   */
  confirm: (options: React.ReactNode | DialogConfirmOptions) => Promise<boolean>;
  /**
   * Asks a yes-or-no question whose confirm button stays disabled until the
   * user types `confirmValue`. The pattern for a delete that cannot be undone.
   */
  confirmWithInput: (options: DialogConfirmWithInputOptions) => Promise<boolean>;
  /**
   * Shows a component of your own and resolves with whatever it passes to
   * `close()`. Resolves to `dismissValue` — `undefined` unless you say
   * otherwise — when it is dismissed instead.
   */
  show: <Payload, Result = void>(
    Component: CustomDialogComponent<Payload, Result>,
    payload: Payload,
    options?: DialogShowOptions<Result>,
  ) => Promise<Result | undefined>;
  /** Dismisses the topmost dialog, exactly as Escape does. */
  close: () => void;
  /** Dismisses every dialog on the stack. */
  closeAll: () => void;
}

/**
 * A manager from `Dialog.createManager()`. Same methods as `useDialog()`,
 * usable from anywhere.
 */
export type DialogManager = DialogApi;

/**
 * Which store a manager pushes onto.
 *
 * A `WeakMap` rather than a field on the manager, so that the store — which is
 * machinery, not API — never appears in the manager's type and cannot be
 * reached into. `Dialog.Provider` is the only reader.
 */
const MANAGER_STORES = new WeakMap<DialogManager, DialogStore>();

/** One implementation for both `useDialog()` and `Dialog.createManager()`. */
function createDialogApi(store: DialogStore): DialogApi {
  return {
    alert(options) {
      return store.open<DialogAlertOptions, void>({
        alert: true,
        Content: DialogAlertView,
        payload: normalizeMessage(options),
        dismissValue: undefined,
      });
    },

    confirm(options) {
      return store.open<DialogConfirmOptions, boolean>({
        alert: true,
        Content: DialogConfirmView,
        payload: normalizeMessage(options),
        dismissValue: false,
      });
    },

    confirmWithInput(options) {
      return store.open<DialogConfirmWithInputOptions, boolean>({
        alert: true,
        Content: DialogConfirmWithInputView,
        payload: options,
        dismissValue: false,
      });
    },

    // Written out rather than inferred from `DialogApi`, because a contextual
    // type parameter cannot be *named* inside the implementation, and the call
    // to `store.open` below has to name both.
    show<Payload, Result = void>(
      Component: CustomDialogComponent<Payload, Result>,
      payload: Payload,
      options?: DialogShowOptions<Result>,
    ): Promise<Result | undefined> {
      return store.open<Payload, Result>({
        alert: options?.alert ?? false,
        Content: Component,
        payload,
        // `dismissValue` is optional and `undefined` is its documented
        // default, which is exactly what the return type widens to. The store
        // itself has no opinion — it hands back whatever it was given.
        dismissValue: options?.dismissValue as Result,
      });
    },

    close() {
      store.closeTop();
    },

    closeAll() {
      store.closeAll();
    },
  };
}

/**
 * Creates a dialog manager that works outside React.
 *
 * ```ts
 * // dialogs.ts
 * export const dialogs = Dialog.createManager();
 *
 * // anywhere — an API client, a router guard, a store
 * if (await dialogs.confirm("Discard your draft?")) discard();
 *
 * // app root
 * <Dialog.Provider manager={dialogs}>…</Dialog.Provider>
 * ```
 *
 * Pass the manager itself, not something inside it — unlike `Toast.Provider`,
 * which has a Base UI manager underneath to hand over.
 *
 * A dialog opened before a provider has mounted is *queued* rather than
 * dropped, because a dropped one would leave its promise pending for the life
 * of the page. It appears as soon as a provider mounts. If none ever does, the
 * `await` never returns — so mount the provider at the root, once.
 */
export function createDialogManager(): DialogManager {
  const store = createDialogStore();
  const manager = createDialogApi(store);
  MANAGER_STORES.set(manager, store);
  return manager;
}

/* -------------------------------------------------------------------------
 * Programmatic dialogs — the built-in views
 * ---------------------------------------------------------------------- */

/**
 * The header both built-ins share. Either field may be left out, but a dialog
 * with neither has no accessible name, so `alert("…")` and `confirm("…")`
 * route a bare message to the title.
 */
function DialogMessageHeader({
  title,
  description,
}: Pick<DialogMessageOptions, "title" | "description">): React.JSX.Element {
  return (
    <>
      {title == null ? null : <DialogTitle>{title}</DialogTitle>}
      {description == null ? null : (
        <DialogDescription>{description}</DialogDescription>
      )}
    </>
  );
}

function DialogAlertView({
  payload,
  close,
}: CustomDialogProps<DialogAlertOptions, void>): React.JSX.Element {
  const labels = React.useContext(DialogLabelsContext);
  const {
    title,
    description,
    size = "sm",
    tone = "primary",
    okLabel = labels.ok,
    className,
  } = payload;

  return (
    <DialogPopup size={size} className={className}>
      <DialogMessageHeader title={title} description={description} />
      <DialogFooter>
        {/* Deliberately not a `Dialog.Close`. A close button flips the open
            state on press, so the dialog would already be closing while this
            handler decided what to resolve with — and whichever of the two ran
            second would win. `close()` records the answer and starts the exit,
            in that order, every time. */}
        <Button
          tone={tone}
          onClick={() => {
            close();
          }}
        >
          {okLabel}
        </Button>
      </DialogFooter>
    </DialogPopup>
  );
}

function DialogConfirmView({
  payload,
  close,
}: CustomDialogProps<DialogConfirmOptions, boolean>): React.JSX.Element {
  const labels = React.useContext(DialogLabelsContext);
  const {
    title,
    description,
    size = "sm",
    tone = "primary",
    confirmLabel = labels.confirm,
    cancelLabel = labels.cancel,
    // A destructive answer gets the two buttons pushed apart, which is what
    // makes a mis-aimed click far less likely. Everything else reads better
    // with the confirm next to where the eye leaves the dialog.
    align = tone === "danger" ? "between" : "end",
    className,
  } = payload;

  return (
    <DialogPopup size={size} className={className}>
      <DialogMessageHeader title={title} description={description} />
      <DialogFooter align={align}>
        {/* Cancel comes first in the DOM, so it is the first tabbable element
            and takes focus when the dialog opens. On a destructive question
            the safe answer is the one that should already be selected. */}
        <Button
          variant="soft"
          tone="neutral"
          onClick={() => {
            close(false);
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          tone={tone}
          onClick={() => {
            close(true);
          }}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogPopup>
  );
}

function DialogConfirmWithInputView({
  payload,
  close,
}: CustomDialogProps<DialogConfirmWithInputOptions, boolean>): React.JSX.Element {
  const labels = React.useContext(DialogLabelsContext);
  const {
    title,
    description,
    size = "sm",
    // Typing a value out is a friction that only earns its place in front of
    // something irreversible, so this one defaults destructive.
    tone = "danger",
    confirmValue,
    inputLabel = labels.confirmInput(confirmValue),
    placeholder = confirmValue,
    confirmLabel = labels.confirm,
    cancelLabel = labels.cancel,
    align = "between",
    caseSensitive = true,
    className,
  } = payload;

  const [typed, setTyped] = React.useState("");

  // Trimmed because the value is usually pasted, and a trailing space is not a
  // different answer — only a way to fail the check without seeing why.
  const candidate = typed.trim();
  const matches = caseSensitive
    ? candidate === confirmValue
    : candidate.toLowerCase() === confirmValue.toLowerCase();

  return (
    <DialogPopup size={size} className={className}>
      <DialogMessageHeader title={title} description={description} />
      {/* A form, so Enter confirms once the value matches. The submit button is
          disabled until then, and a disabled default button suppresses implicit
          submission — so the keyboard and the pointer unlock at the same
          moment, with no second condition to keep in sync. */}
      <Form
        onFormSubmit={() => {
          close(true);
        }}
      >
        <Field.Root name="forte-dialog-confirm">
          <Field.Label>{inputLabel}</Field.Label>
          {/* First tabbable element in the popup, so it takes focus on open. */}
          <Input
            value={typed}
            onValueChange={(value) => setTyped(value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </Field.Root>
        <DialogFooter align={align}>
          <Button
            variant="soft"
            tone="neutral"
            onClick={() => {
              close(false);
            }}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" tone={tone} disabled={!matches}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Form>
    </DialogPopup>
  );
}

/* -------------------------------------------------------------------------
 * Programmatic dialogs — the provider
 * ---------------------------------------------------------------------- */

/**
 * Every dialog whose parent is `parentId`, and everything opened from them.
 *
 * The recursion is the design. Base UI decides a dialog is nested by looking
 * for a parent `Root` *in the React tree*, so a stack rendered flat would draw
 * a second backdrop over the first dialog and skip the step-back the
 * stylesheet already implements. Rendering each dialog inside the one that was
 * on screen when it opened gets the nesting for free.
 *
 * A forest rather than a single chain, because two dialogs can be on screen
 * without one being inside the other: the one that has just been answered and
 * is animating out, and the one its answer opened. Those are siblings — see
 * `parentId` — and each keeps its own backdrop, which is right, because
 * neither is stacked on the other.
 */
function DialogStackLevel({
  entries,
  parentId,
  store,
}: {
  entries: readonly DialogEntry[];
  parentId: string | null;
  store: DialogStore;
}): React.JSX.Element | null {
  const level = entries.filter((entry) => entry.parentId === parentId);
  if (level.length === 0) {
    return null;
  }

  return (
    <>
      {level.map((entry) => (
        // Keyed by id, so that a dialog can never inherit the DOM — or the
        // state — of one that stood in the same place before it.
        <DialogStackNode
          key={entry.id}
          entry={entry}
          entries={entries}
          store={store}
        />
      ))}
    </>
  );
}

/**
 * `useLayoutEffect`, except on the server, where React warns that it does
 * nothing. Only the stack below needs it, and only on the client — the server
 * renders an empty stack — but the warning fires on the hook being *called*,
 * so the swap has to happen anyway.
 */
const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * One dialog on the stack, and everything opened from it.
 *
 * `opened` is what gives the dialog its entrance. Base UI seeds its transition
 * state from `open` on the FIRST render — `useState(open)` — so a `Root` that
 * mounts already open is treated as having always been open: no
 * `[data-starting-style]`, no enter transition, the popup simply appears. A
 * dialog raised by a call always mounts that way, since the entry that creates
 * it is created open. Mounting closed and opening in a layout effect gives Base
 * UI the false→true edge it is watching for, and costs no frame: the effect
 * runs before paint, so the popup is painted once, already carrying its
 * starting style.
 */
function DialogStackNode({
  entry,
  entries,
  store,
}: {
  entry: DialogEntry;
  entries: readonly DialogEntry[];
  store: DialogStore;
}): React.JSX.Element {
  const [opened, setOpened] = React.useState(false);
  useIsoLayoutEffect(() => {
    setOpened(true);
  }, []);

  const { Content } = entry;
  const rootProps = {
    open: entry.open && opened,
    onOpenChange: (open: boolean) => {
      // Escape, an outside press, a nested dialog closing its parent — any
      // close that did not come through `close()`. Both halves matter: this
      // root is CONTROLLED, so a request that is only settled and not also
      // recorded leaves `entry.open` true, and Base UI re-syncs the popup back
      // open on the next render of the provider. Settling is a no-op once an
      // answer has been recorded, so a button that already ran keeps its
      // result and this only ever supplies the dismissal value.
      if (!open) {
        entry.dismiss();
      }
    },
    onOpenChangeComplete: (open: boolean) => {
      if (!open) {
        store.remove(entry.id);
      }
    },
    children: (
      <>
        <Content
          payload={entry.payload}
          close={entry.close}
          dismiss={entry.dismiss}
        />
        <DialogStackLevel
          entries={entries}
          parentId={entry.id}
          store={store}
        />
      </>
    ),
  };

  return entry.alert ? (
    <AlertDialogRoot {...rootProps} />
  ) : (
    <DialogRoot {...rootProps} />
  );
}

const DialogApiContext = React.createContext<DialogApi | null>(null);

export interface DialogProviderProps {
  /** The part of the app that can open dialogs. */
  children?: React.ReactNode;
  /**
   * A manager from `Dialog.createManager()`. Pass one and the provider drives
   * that manager's stack instead of its own, which is what lets code outside
   * React open a dialog. `useDialog()` reaches the same stack either way.
   */
  manager?: DialogManager;
  /**
   * Overrides for the built-in button labels — the only copy `alert()`,
   * `confirm()` and `confirmWithInput()` put on screen that the call site does
   * not supply. Set it once here instead of passing `okLabel` and
   * `cancelLabel` to every call; this is the translation seam.
   */
  labels?: Partial<DialogLabels>;
}

/**
 * Enables `useDialog()` underneath it, and renders whatever is opened.
 *
 * ```tsx
 * <Dialog.Provider>
 *   <App />
 * </Dialog.Provider>
 * ```
 *
 * Mount it once, above everything that might ask a question. It renders no DOM
 * element of its own and every dialog is portalled to `<body>`, so where it
 * sits in the tree does not matter beyond that.
 *
 * The stack it renders is *nested*: a dialog opened while another is on screen
 * becomes that dialog's child, which is what makes the parent step back and
 * dim instead of being covered by a second backdrop.
 */
export function DialogProvider({
  children,
  manager,
  labels,
}: DialogProviderProps): React.JSX.Element {
  // `useState`'s initialiser and not `useMemo`: a store rebuilt on a re-render
  // would strand every promise already waiting on the old one.
  const [ownStore] = React.useState(createDialogStore);

  let store = ownStore;
  if (manager != null) {
    const managerStore = MANAGER_STORES.get(manager);
    if (managerStore == null) {
      throw new Error(
        "Dialog.Provider's `manager` prop needs an object from Dialog.createManager().",
      );
    }
    store = managerStore;
  }

  const entries = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  const api = React.useMemo(() => createDialogApi(store), [store]);

  const resolvedLabels = React.useMemo(
    () =>
      labels == null ? DEFAULT_DIALOG_LABELS : { ...DEFAULT_DIALOG_LABELS, ...labels },
    [labels],
  );

  // A dialog that leaves the screen with the provider was answered by nobody,
  // and its promise would otherwise stay pending for the life of the page — an
  // `await dialog.confirm()` that never returns. Settling each one with its
  // dismissal value is what Escape would have done.
  React.useEffect(
    () => () => {
      store.clear();
    },
    [store],
  );

  return (
    <DialogApiContext.Provider value={api}>
      <DialogLabelsContext.Provider value={resolvedLabels}>
        {children}
        <DialogStackLevel entries={entries} parentId={null} store={store} />
      </DialogLabelsContext.Provider>
    </DialogApiContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * useDialog
 * ---------------------------------------------------------------------- */

/**
 * Opens dialogs from inside a component, and waits for the answer.
 *
 * ```tsx
 * const dialog = useDialog();
 *
 * if (await dialog.confirm("Delete this draft?")) {
 *   await deleteDraft();
 * }
 * ```
 *
 * Must be called under a `Dialog.Provider`.
 *
 * The object and every method on it keep the same identity for the life of the
 * provider, so both the object and one pulled out by destructuring are safe in
 * a dependency array.
 */
export function useDialog(): DialogApi {
  const api = React.useContext(DialogApiContext);
  if (api == null) {
    throw new Error(
      "useDialog() must be called under a <Dialog.Provider>. Mount one above this component.",
    );
  }
  return api;
}

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
 *
 * `Dialog.Provider` and `useDialog()` are the other way to reach the same
 * surface — a dialog opened by a call and awaited for its answer, for the
 * questions that have no button on screen to hang a `Root` off.
 *
 * @summary A modal surface that takes focus until dismissed; for confirmations
 *   that must be answered use AlertDialog, for edge-anchored panels use
 *   Drawer.
 * @category Overlays
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Popup: DialogPopup,
  Surface: DialogSurface,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Footer: DialogFooter,
  /** Enables `useDialog()` underneath it, and renders what it opens. */
  Provider: DialogProvider,
  /** Creates a handle that connects a `Dialog.Root` to detached triggers. */
  createHandle: BaseDialog.createHandle,
  /** Creates a dialog manager usable outside React. */
  createManager: createDialogManager,
};

/**
 * An always-modal dialog that interrupts the user and requires an answer —
 * confirming a delete, discarding unsaved work.
 *
 * Shares every part and every style with `Dialog`; only `Root` and `Trigger`
 * differ. There is deliberately no `modal` or `disablePointerDismissal` prop:
 * an alert dialog traps focus, locks page scroll, and cannot be dismissed by
 * clicking outside it. Give it at least one `AlertDialog.Close`.
 *
 * @summary A modal for decisions that must be answered — it cannot be
 *   dismissed by clicking outside; the shape for destructive confirms. Shares
 *   Dialog's parts (see Dialog's props.json keys) under AlertDialog.*.
 * @category Overlays
 */
export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  // Base UI's alert-dialog entry point re-exports these exact components, so
  // the styled wrappers above are the correct parts for both namespaces.
  Popup: DialogPopup,
  Surface: DialogSurface,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Footer: DialogFooter,
  /** Creates a handle that connects an `AlertDialog.Root` to detached triggers. */
  createHandle: BaseAlertDialog.createHandle,
};
