"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type {
  ToastObject as BaseToastObject,
  ToastManager as BaseToastManager,
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastPortalProps as BaseToastPortalProps,
  ToastRootProps as BaseToastRootProps,
  ToastTitleProps as BaseToastTitleProps,
  ToastDescriptionProps as BaseToastDescriptionProps,
  ToastActionProps as BaseToastActionProps,
  ToastCloseProps as BaseToastCloseProps,
} from "@base-ui/react/toast";
import { clsx } from "clsx";
import { Spinner } from "../spinner";
import styles from "./Toast.module.css";

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */

/**
 * The five types the library styles. `type` is a plain string in Base UI, so
 * any other value passes through unharmed — it lands on `data-type` and gets
 * the neutral treatment, which is what you want for an app-specific type
 * styled from your own CSS.
 */
export type ToastType = "success" | "error" | "warning" | "info" | "loading";

/**
 * Where the stack sits. `start` / `end` are the *inline* edges, so a
 * `bottom-end` viewport is bottom-right in LTR and bottom-left in RTL without
 * anything being configured.
 */
export type ToastPosition =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end";

/** A direction a toast can be flicked in to dismiss it. */
export type ToastSwipeDirection = "up" | "down" | "left" | "right";

/**
 * Custom data carried on a toast.
 *
 * `icon` and `dismissible` are read by `Toast.Item`; everything else is yours
 * and reaches a custom renderer untouched through `toast.data`. They live here
 * rather than as top-level fields because `data` is the one field Base UI
 * hands through verbatim — inventing a sibling of `title` would mean patching
 * Base UI's own object type, and that breaks the moment it gains a field of
 * the same name.
 */
export interface ToastData {
  /**
   * Replaces the type's default glyph. `false` removes it — and removes the
   * icon column with it, so the text starts at the padding edge.
   */
  icon?: React.ReactNode | false;
  /**
   * Whether the close button renders. Turn it off for a toast that must be
   * answered through its action button.
   * @default true
   */
  dismissible?: boolean;
  [key: string]: unknown;
}

/** A toast as it exists in the store — what a custom renderer receives. */
export type ToastObject = BaseToastObject<ToastData>;

/** The action button, if the toast has one. */
export interface ToastActionOptions
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** The button's text. */
  label: React.ReactNode;
}

/**
 * Everything you can say about a toast.
 *
 * Every field is optional, including `title` — a toast with only a
 * `description` is a valid one-line message, and `Toast.Title` renders nothing
 * rather than an empty heading.
 */
export interface ToastOptions {
  /** The headline. Becomes the toast's accessible name. */
  title?: React.ReactNode;
  /** A second line under the title. Becomes the accessible description. */
  description?: React.ReactNode;
  /**
   * Which glyph and accent colour to use, and what lands on `data-type`.
   * The named methods on `useToast()` set this for you.
   */
  type?: ToastType | (string & {});
  /**
   * How long before the toast dismisses itself, in milliseconds. `0` keeps it
   * on screen until it is closed. Falls back to the provider's `timeout`.
   *
   * Ignored for `type="loading"`, which never auto-dismisses — resolve it with
   * `update()` or close it through the handle.
   */
  timeout?: number;
  /**
   * `"high"` announces the toast assertively, interrupting whatever the screen
   * reader is saying, and renders it as an `alertdialog` rather than a
   * `dialog`. Reserve it for something the user has to hear *now*; routine
   * confirmations are `"low"`.
   * @default "low"
   */
  priority?: "low" | "high";
  /**
   * A stable identifier. Showing a toast with an id that is already on screen
   * updates that toast in place and restarts its timer, instead of stacking a
   * second copy — which is how you keep a save-status or connection toast to
   * one card however often the event fires.
   */
  id?: string;
  /** A single button inside the toast: `{ label: "Undo", onClick: undo }`. */
  action?: ToastActionOptions;
  /** Called when the toast closes, however it was closed. */
  onClose?: () => void;
  /** Called once the toast has finished animating out and left the DOM. */
  onRemove?: () => void;
  /** Custom data. `icon` and `dismissible` are read by `Toast.Item`. */
  data?: ToastData;
  /**
   * Replaces the type's default glyph. `false` removes it. Shorthand for
   * `data.icon`.
   */
  icon?: React.ReactNode | false;
  /**
   * Whether the close button renders. Shorthand for `data.dismissible`.
   * @default true
   */
  dismissible?: boolean;
}

/**
 * What the shorthand methods accept: a message, or the full options object.
 *
 * `toast.success("Saved")` and `toast.success({ title: "Saved" })` are the
 * same call — a bare message becomes the `title`, because that is the field
 * that gets announced and the one that carries the meaning.
 */
export type ToastMessage = React.ReactNode | ToastOptions;

/**
 * The value `show()` and the named methods return.
 *
 * An object rather than a bare `hide` function, because dismissing is only one
 * of the three things you want to do with a toast you have just raised: the id
 * is what identifies it across a reload or in a map, and `update` is what
 * turns "Uploading…" into "Uploaded" without a second card appearing.
 */
export interface ToastHandle {
  /** The toast's id, generated unless `options.id` was given. */
  readonly id: string;
  /** Closes this toast. Safe to call after it has already gone. */
  close: () => void;
  /**
   * Rewrites this toast in place. Only the fields you pass change, and the
   * toast keeps its position in the stack — so "Uploading…" becomes "Uploaded"
   * without a second card appearing.
   *
   * Each field you pass REPLACES the old one; nothing is merged, `data`
   * included. Restate `icon` or `dismissible` if the updated toast should keep
   * them.
   *
   * The running timer is left alone unless the update changes `timeout`, or
   * resolves a `loading` toast into a type that auto-dismisses.
   */
  update: (message: ToastMessage, options?: ToastOptions) => void;
}

/** How `promise()` describes each of the three states. */
export interface ToastPromiseOptions<Value> {
  /** Shown immediately, and never auto-dismissed. */
  loading: ToastMessage;
  /** Replaces it when the promise resolves. */
  success: ToastMessage | ((value: Value) => ToastMessage);
  /** Replaces it when the promise rejects. */
  error: ToastMessage | ((error: unknown) => ToastMessage);
}

/**
 * The toast API — what `useToast()` returns, and what `Toast.createManager()`
 * gives you outside React.
 */
export interface ToastApi {
  /** Shows a toast of any type. `type` decides the glyph and the accent. */
  show: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /** Shows a `success` toast. */
  success: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /** Shows an `error` toast. */
  error: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /** Shows a `warning` toast. */
  warning: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /** Shows an `info` toast. */
  info: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /** Shows a `loading` toast. It never auto-dismisses. */
  loading: (message: ToastMessage, options?: ToastOptions) => ToastHandle;
  /**
   * Raises a loading toast and swaps it for a success or error one when the
   * promise settles. Returns the promise, with the rejection intact — so this
   * is a pass-through you can `await` and still `catch`.
   */
  promise: <Value>(
    promise: Promise<Value>,
    options: ToastPromiseOptions<Value>,
  ) => Promise<Value>;
  /** Rewrites a toast in place by id. */
  update: (id: string, message: ToastMessage, options?: ToastOptions) => void;
  /** Closes one toast, or every toast when called with no argument. */
  close: (id?: string) => void;
}

/** A manager created with `Toast.createManager()`. */
export interface ToastManager extends ToastApi {
  /**
   * The Base UI manager underneath. Pass it to `Toast.Provider`'s
   * `toastManager` prop — that is what connects the two.
   */
  readonly base: BaseToastManager<ToastData>;
}

/* -------------------------------------------------------------------------
 * Options → Base UI
 * ---------------------------------------------------------------------- */

/**
 * Whether the argument is an options object rather than a message.
 *
 * `ReactNode` and `ToastOptions` overlap on exactly one shape — a React
 * element, which is also an object — so elements are excluded explicitly.
 * Arrays are excluded for the same reason: `<>{a}{b}</>` arrives as one.
 */
function isOptions(value: ToastMessage): value is ToastOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  );
}

/** `("Saved", { description })` and `({ title: "Saved", description })` agree. */
function normalize(message: ToastMessage, options?: ToastOptions): ToastOptions {
  const base = isOptions(message) ? message : { title: message };
  return options ? { ...base, ...options } : base;
}

/**
 * Translates our options into Base UI's.
 *
 * Three fields change shape. `action` collapses into `actionProps`, whose
 * `children` Base UI already uses as the button's label. `icon` and
 * `dismissible` fold into `data`, which is the only field Base UI passes
 * through untouched — see `ToastData`. Everything else is Base UI's own
 * vocabulary and is forwarded by name, so a field added upstream keeps
 * working without a translation entry.
 */
function toBaseOptions(options: ToastOptions): ToastManagerUpdateOptions<ToastData> {
  const { action, icon, dismissible, data, ...rest } = options;

  const extras =
    icon !== undefined || dismissible !== undefined
      ? {
          ...data,
          ...(icon !== undefined ? { icon } : null),
          ...(dismissible !== undefined ? { dismissible } : null),
        }
      : data;

  return {
    ...rest,
    // Spreading `undefined` would still create the key, and Base UI's
    // `updateToast` treats a present `actionProps: undefined` as "remove the
    // action" — which would silently strip the button off a toast being
    // updated for an unrelated reason.
    ...(action ? { actionProps: actionToProps(action) } : null),
    ...(extras ? { data: extras } : null),
  };
}

function actionToProps(
  action: ToastActionOptions,
): React.ComponentPropsWithoutRef<"button"> {
  const { label, ...props } = action;
  return { ...props, children: label };
}

/**
 * Builds the friendly API over Base UI's four primitives.
 *
 * One function serves both `useToast()` and `Toast.createManager()`, because
 * `useToastManager()` and `createToastManager()` expose the same four methods.
 * Keeping one implementation is what stops the hook and the standalone manager
 * drifting into two dialects of the same API — the bug would be invisible
 * until someone moved a call from a component into a service module.
 */
function createToastApi(base: {
  add: (options: ToastManagerAddOptions<ToastData>) => string;
  close: (id?: string) => void;
  update: (id: string, options: ToastManagerUpdateOptions<ToastData>) => void;
  promise: <Value>(
    promise: Promise<Value>,
    options: {
      loading: ToastManagerUpdateOptions<ToastData>;
      success: (value: Value) => ToastManagerUpdateOptions<ToastData>;
      error: (error: unknown) => ToastManagerUpdateOptions<ToastData>;
    },
  ) => Promise<Value>;
}): ToastApi {
  function update(id: string, message: ToastMessage, options?: ToastOptions) {
    base.update(id, toBaseOptions(normalize(message, options)));
  }

  function handle(id: string): ToastHandle {
    return {
      id,
      close: () => base.close(id),
      update: (message, options) => update(id, message, options),
    };
  }

  function show(message: ToastMessage, options?: ToastOptions): ToastHandle {
    return handle(base.add(toBaseOptions(normalize(message, options))));
  }

  function typed(type: ToastType) {
    return (message: ToastMessage, options?: ToastOptions) =>
      show(message, { ...options, type });
  }

  return {
    show,
    success: typed("success"),
    error: typed("error"),
    warning: typed("warning"),
    info: typed("info"),
    loading: typed("loading"),
    update,
    close: base.close,
    promise(promise, options) {
      // Base UI stamps the type on each phase itself, so none is set here.
      // A function is passed for `success` / `error` even when the consumer
      // gave a plain message, because that is the only form that receives the
      // resolved value — and normalising both branches to it keeps the two
      // call shapes from needing separate code paths.
      return base.promise(promise, {
        loading: toBaseOptions(normalize(options.loading)),
        success: (value) => toBaseOptions(normalize(resolve(options.success, value))),
        error: (error) => toBaseOptions(normalize(resolve(options.error, error))),
      });
    },
  };
}

/** `success` / `error` may be a message or a function of the settled value. */
function resolve<Arg>(
  value: ToastMessage | ((arg: Arg) => ToastMessage),
  arg: Arg,
): ToastMessage {
  return typeof value === "function"
    ? (value as (arg: Arg) => ToastMessage)(arg)
    : value;
}

/* -------------------------------------------------------------------------
 * useToast
 * ---------------------------------------------------------------------- */

/** What `useToast()` returns: the API, plus the live list of toasts. */
export interface UseToastReturn extends ToastApi {
  /**
   * Every toast currently in the store, newest first, including the ones
   * animating out. Read it to render your own stack, or to show a count.
   */
  toasts: ToastObject[];
}

/**
 * Raises toasts from inside a component.
 *
 * ```tsx
 * const toast = useToast();
 *
 * toast.success("Profile saved");
 * toast.error("Could not save", { description: "Check your connection." });
 *
 * const { close } = toast.info("Uploading…", { timeout: 0 });
 * ```
 *
 * Must be called under a `Toast.Provider`.
 *
 * Every method on it keeps the same identity for the life of the provider, so
 * one pulled out by destructuring is safe in a dependency array. The object
 * itself is rebuilt whenever `toasts` changes, since that is the only way a
 * live list can be live — destructure what you need rather than depending on
 * the whole thing.
 */
export function useToast(): UseToastReturn {
  const manager = BaseToast.useToastManager<ToastData>();

  // `manager.add` and friends are stable store methods, so the API is built
  // once. `toasts` changes on every add and close and is spread on top —
  // rebuilding the closures with it would hand every consumer a new object
  // each time a toast appeared, which is exactly the identity a dependency
  // array is watching.
  const api = React.useMemo(
    () =>
      createToastApi({
        add: manager.add,
        close: manager.close,
        update: manager.update,
        promise: manager.promise,
      }),
    [manager.add, manager.close, manager.update, manager.promise],
  );

  return React.useMemo(
    () => ({ ...api, toasts: manager.toasts }),
    [api, manager.toasts],
  );
}

/* -------------------------------------------------------------------------
 * createManager
 * ---------------------------------------------------------------------- */

/**
 * Creates a toast manager that works outside React.
 *
 * ```ts
 * // toaster.ts
 * export const toaster = Toast.createManager();
 *
 * // anywhere — an API client, a store, an event handler
 * toaster.error("Request failed");
 *
 * // app root
 * <Toast.Provider toastManager={toaster.base}>…</Toast.Provider>
 * ```
 *
 * Same methods as `useToast()`, minus `toasts` — a plain object has nothing to
 * re-render when the list changes, so reading it there would hand back a
 * snapshot that is already stale. Use the hook when you need the list.
 *
 * A manager delivers to a MOUNTED provider and nowhere else: the provider
 * subscribes in an effect, and a call made before that runs — at module load,
 * during the first server render — is dropped rather than queued. Raise toasts
 * from events, which is where they belong anyway.
 */
export function createToastManager(): ToastManager {
  const base = BaseToast.createToastManager<ToastData>();
  return { ...createToastApi(base), base };
}

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

/**
 * The swipe directions the viewport resolved, handed down to every item under
 * it.
 *
 * The gesture is the only thing about a toast that JavaScript has to learn
 * from the position — every visual difference between a top stack and a bottom
 * one is expressed in CSS off `data-position` on the viewport. The array is
 * resolved once, in the viewport, rather than derived per item: Base UI reads
 * `swipeDirection` on every render, and a fresh array each time would be a new
 * reference each time.
 */
const SwipeContext = React.createContext<
  ToastSwipeDirection | ToastSwipeDirection[] | undefined
>(undefined);

/** The toast an item is rendering, so its parts can default their content. */
const ItemContext = React.createContext<ToastObject | null>(null);

function useToastItem(part: string): ToastObject {
  const toast = React.useContext(ItemContext);
  if (toast == null) {
    throw new Error(`pretty-ui: <Toast.${part}> must be rendered inside <Toast.Item>.`);
  }
  return toast;
}

/**
 * Which way a toast may be flicked away.
 *
 * Away from the viewport's own block edge — up for a top stack, down for a
 * bottom one — plus both inline directions. Both, rather than the one matching
 * `start` / `end`, because `swipeDirection` is physical while the position is
 * logical: picking one would need the document's direction, and picking it
 * once at mount would then be wrong for an RTL island. Accepting either is
 * also simply more forgiving, which is what a dismissal gesture wants to be.
 */
function swipeFor(position: ToastPosition): ToastSwipeDirection[] {
  return [position.startsWith("top") ? "up" : "down", "left", "right"];
}

/* -------------------------------------------------------------------------
 * Icons
 * ---------------------------------------------------------------------- */

/**
 * The four status glyphs.
 *
 * Drawn here rather than pulled from an icon package: the library ships no
 * icon dependency, and these four are the only ones it needs. Each is a
 * distinct SHAPE as well as a distinct colour — a tick, a cross, a triangle,
 * an "i" — because colour alone would leave the type invisible to a
 * colour-blind reader and to forced-colors mode, where every glyph repaints in
 * one system colour (WCAG SC 1.4.1).
 *
 * `stroke` rather than `fill`, at a weight that stays legible at 16px, and
 * `aria-hidden` on all of them: the type is already carried by the toast's
 * text, and announcing "check mark" before it would be noise.
 */
function StatusIcon(props: React.ComponentProps<"svg"> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  success: (
    <StatusIcon className={styles.glyph}>
      <circle cx="8" cy="8" r="6.4" />
      <path d="m5.2 8.2 2 2 3.6-4.4" />
    </StatusIcon>
  ),
  error: (
    <StatusIcon className={styles.glyph}>
      <circle cx="8" cy="8" r="6.4" />
      <path d="m5.8 5.8 4.4 4.4M10.2 5.8l-4.4 4.4" />
    </StatusIcon>
  ),
  warning: (
    <StatusIcon className={styles.glyph}>
      <path d="M8 2.2 1.6 13.4h12.8L8 2.2Z" />
      <path d="M8 6.4v3.1" />
      <path d="M8 11.4h.01" />
    </StatusIcon>
  ),
  info: (
    <StatusIcon className={styles.glyph}>
      <circle cx="8" cy="8" r="6.4" />
      <path d="M8 7.4v3.6" />
      <path d="M8 5h.01" />
    </StatusIcon>
  ),
};

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface ToastViewportProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "children"> {
  /**
   * Which corner or edge the stack sits at. `start` and `end` are the inline
   * edges, so `bottom-end` is bottom-right in LTR and bottom-left in RTL.
   * @default "bottom-end"
   */
  position?: ToastPosition;
  /**
   * An element to render the stack into instead of `<body>`.
   *
   * Setting it also switches the viewport from `position: fixed` to
   * `position: absolute`, so the stack pins to the container rather than to
   * the screen — give that container `position: relative`. There is no
   * separate prop for that, because a contained viewport that stayed fixed
   * would be a silent bug: the toasts would sit in the screen corner while
   * the container they were scoped to sat somewhere else entirely.
   *
   * The usual reason to reach for it is a preview or an embedded surface that
   * has its own theme scope — a portal to `<body>` escapes the scope, and the
   * toasts come out in the page's colours.
   */
  container?: BaseToastPortalProps["container"];
  /**
   * Which way a toast may be flicked away. Defaults to the direction away from
   * the viewport's own edge plus both inline directions; pass `[]` to turn
   * swipe-to-dismiss off.
   */
  swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
  /**
   * Renders one toast. Return a `Toast.Item` — it is what carries the stacking
   * geometry and the swipe gesture.
   *
   * ```tsx
   * renderToast={(toast) => (
   *   <Toast.Item toast={toast}>
   *     <Toast.Icon />
   *     <Toast.Title />
   *     <Toast.Close />
   *   </Toast.Item>
   * )}
   * ```
   *
   * Defaults to `<Toast.Item toast={toast} />`, which supplies the standard
   * layout from the toast's own fields.
   */
  renderToast?: (toast: ToastObject) => React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

function defaultRenderToast(toast: ToastObject): React.ReactNode {
  return <ToastItem toast={toast} />;
}

/**
 * The stack itself: Base UI's `Portal` → `Viewport`, plus the loop over the
 * toasts. Collapsing the three keeps the common case to one element, the way
 * `Dialog.Popup` collapses its four.
 *
 * `Toast.Provider` renders one of these for you. Render it yourself only when
 * it has to go somewhere specific — inside a `container`, or after some other
 * portalled chrome — and pass `viewport={false}` to the provider so there is
 * not a second one.
 */
export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport(
    {
      position = "bottom-end",
      container,
      swipeDirection,
      renderToast = defaultRenderToast,
      className,
      ...props
    },
    ref,
  ) {
    const { toasts } = BaseToast.useToastManager<ToastData>();
    // Memoised because it is a context value: a fresh array on every render
    // would be a new reference on every render, and the viewport re-renders
    // each time a toast is added or closed.
    const swipe = React.useMemo(
      () => swipeDirection ?? swipeFor(position),
      [swipeDirection, position],
    );

    return (
      <SwipeContext.Provider value={swipe}>
        <BaseToast.Portal container={container}>
          <BaseToast.Viewport
            ref={ref}
            className={clsx(styles.viewport, className)}
            data-pui="toast-viewport"
            data-position={position}
            data-contained={container != null || undefined}
            {...props}
          >
            {toasts.map((toast) => (
              <React.Fragment key={toast.id}>{renderToast(toast)}</React.Fragment>
            ))}
          </BaseToast.Viewport>
        </BaseToast.Portal>
      </SwipeContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Provider
 * ---------------------------------------------------------------------- */

export interface ToastProviderProps extends ToastViewportProps {
  /** The app. */
  children?: React.ReactNode;
  /**
   * How long a toast stays on screen by default, in milliseconds. `0` keeps
   * every toast until it is closed. A toast can override it with its own
   * `timeout`.
   * @default 5000
   */
  timeout?: number;
  /**
   * How many toasts are visible at once. The rest stay in the store and take
   * their turn as the front ones are dismissed, so nothing is lost — they are
   * marked `data-limited` and hidden rather than dropped.
   * @default 3
   */
  limit?: number;
  /**
   * A manager from `Toast.createManager()`, for raising toasts outside React.
   * Pass the manager's `base`.
   */
  toastManager?: BaseToastManager;
  /**
   * Whether to render the stack. Turn it off when you are placing
   * `Toast.Viewport` yourself.
   * @default true
   */
  viewport?: boolean;
}

/**
 * Owns every toast below it, and renders the stack.
 *
 * Mount it once, near the root of the app:
 *
 * ```tsx
 * <Toast.Provider position="bottom-end" timeout={5000}>
 *   <App />
 * </Toast.Provider>
 * ```
 *
 * The viewport comes with it deliberately. Base UI keeps the two apart, which
 * is the right primitive but the wrong default here: a provider without a
 * viewport swallows every toast silently — the calls succeed, the store fills
 * up, and nothing is ever drawn. Rendering it here means the failure cannot
 * happen, and `viewport={false}` is one prop away when you need to place it
 * yourself.
 *
 * Renders no DOM element of its own; the stack is portalled.
 */
export function ToastProvider({
  children,
  timeout,
  limit,
  toastManager,
  viewport = true,
  ...viewportProps
}: ToastProviderProps): React.JSX.Element {
  return (
    <BaseToast.Provider timeout={timeout} limit={limit} toastManager={toastManager}>
      {children}
      {viewport ? <ToastViewport {...viewportProps} /> : null}
    </BaseToast.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface ToastItemProps extends Omit<BaseToastRootProps, "className" | "toast"> {
  /** The toast to render — the object a `renderToast` callback receives. */
  toast: ToastObject;
  /**
   * Which way this toast may be flicked away. Inherited from the viewport;
   * set it here to override one toast, or pass `[]` to pin it in place.
   */
  swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
  /**
   * The toast's contents. Omit it for the standard layout — icon, title,
   * description, action, close — assembled from the toast's own fields.
   *
   * Passing children replaces that layout entirely. Compose it from the parts
   * (`Toast.Icon`, `Toast.Title`, `Toast.Description`, `Toast.Action`,
   * `Toast.Close`), each of which defaults its content from the toast, so a
   * custom arrangement does not mean restating the text.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One toast: Base UI's `Root` wrapping its `Content`.
 *
 * `Root` carries the stacking geometry, the swipe gesture and the focus
 * handling; `Content` is what fades when the toast is behind another one, and
 * is why the two are separate elements rather than one.
 */
export const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  function ToastItem({ toast, swipeDirection, className, children, ...props }, ref) {
    const inherited = React.useContext(SwipeContext);
    const icon = toast.data?.icon;
    const dismissible = toast.data?.dismissible ?? true;

    return (
      <ItemContext.Provider value={toast}>
        <BaseToast.Root
          ref={ref}
          toast={toast}
          swipeDirection={swipeDirection ?? inherited}
          // A toast is a floating surface, so it needs a boundary in
          // forced-colors mode, where its shadow is stripped. It is also
          // focusable — Base UI gives the root `tabIndex={0}` so the whole
          // card is reachable — hence a real ring rather than the UA default.
          className={clsx(styles.root, "pui-focus-ring", "pui-hc-surface", className)}
          data-pui="toast"
          {...props}
        >
          <BaseToast.Content className={styles.content} data-pui="toast-content">
            {children ?? (
              <>
                {icon === false ? null : <ToastIcon />}
                <div className={styles.body} data-pui="toast-body">
                  <ToastTitle />
                  <ToastDescription />
                </div>
                <ToastAction />
                {dismissible ? <ToastClose /> : null}
              </>
            )}
          </BaseToast.Content>
        </BaseToast.Root>
      </ItemContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

export interface ToastIconProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children"> {
  /**
   * The glyph to draw. Defaults to `data.icon` if the toast carries one, and
   * otherwise to the standard glyph for its `type`.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The status glyph, coloured by the toast's type.
 *
 * A `loading` toast gets a `Spinner` instead of a static glyph. The spinner is
 * a child of the toast root rather than the root itself, which is load-bearing
 * — Base UI waits on `root.getAnimations()` before removing a dismissed toast,
 * and an infinite animation's promise never settles, so a spinning root would
 * stay in the DOM for the lifetime of the page. `getAnimations()` is not
 * called with `subtree: true`, so a descendant is safe.
 *
 * Renders nothing when there is no glyph to draw, so the icon column collapses
 * on a typeless toast rather than leaving a gap where an icon would be.
 */
export const ToastIcon = React.forwardRef<HTMLSpanElement, ToastIconProps>(
  function ToastIcon({ className, children, ...props }, ref) {
    const toast = useToastItem("Icon");
    const custom = toast.data?.icon;

    const content =
      children ??
      (custom !== undefined && custom !== false
        ? custom
        : toast.type === "loading"
          ? // `decorative` because the toast is already a live region: a
            // second one inside it would announce the wait twice.
            <Spinner size="sm" tone="current" decorative />
          : toast.type
            ? ICONS[toast.type]
            : null);

    if (content == null) {
      return null;
    }

    return (
      <span
        ref={ref}
        className={clsx(styles.icon, className)}
        data-pui="toast-icon"
        {...props}
      >
        {content}
      </span>
    );
  },
);

/* -------------------------------------------------------------------------
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface ToastTitleProps extends Omit<BaseToastTitleProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The toast's headline, and its accessible name.
 *
 * Renders an `<h2>` whose text defaults to the toast's `title`. Renders
 * nothing at all when there is no title, so a description-only toast does not
 * carry an empty heading.
 */
export const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(
  function ToastTitle({ className, ...props }, ref) {
    return (
      <BaseToast.Title
        ref={ref}
        className={clsx(styles.title, className)}
        data-pui="toast-title"
        {...props}
      />
    );
  },
);

export interface ToastDescriptionProps
  extends Omit<BaseToastDescriptionProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The second line, and the toast's accessible description.
 *
 * Renders a `<p>` whose text defaults to the toast's `description`, and
 * renders nothing when there is none.
 */
export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  ToastDescriptionProps
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <BaseToast.Description
      ref={ref}
      className={clsx(styles.description, className)}
      data-pui="toast-description"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Action / Close
 * ---------------------------------------------------------------------- */

export interface ToastActionProps extends Omit<BaseToastActionProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The toast's action button.
 *
 * Renders a `<button>` whose label and `onClick` default to the toast's
 * `action`, and renders nothing when the toast has none — so the default
 * layout can include it unconditionally.
 *
 * Clicking it does not close the toast. That is deliberate: an action that
 * fails should be able to say so, and closing is one `handle.close()` away
 * inside the handler.
 */
export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  function ToastAction({ className, render, ...props }, ref) {
    return (
      <BaseToast.Action
        ref={ref}
        render={render}
        className={clsx(
          render === undefined && styles.action,
          "pui-focus-ring",
          className,
        )}
        data-pui="toast-action"
        {...props}
      />
    );
  },
);

export interface ToastCloseProps extends Omit<BaseToastCloseProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The button that dismisses the toast.
 *
 * Renders a `<button>` with a "×" and an `aria-label` of "Close", both
 * overridable through `children` and `aria-label`. Base UI hides it from
 * assistive technology while the stack is collapsed and reveals it once the
 * viewport is hovered or focused, so it is announced exactly when it is
 * reachable.
 */
export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  function ToastClose({ className, render, children, ...props }, ref) {
    return (
      <BaseToast.Close
        ref={ref}
        render={render}
        className={clsx(
          render === undefined && styles.close,
          "pui-focus-ring",
          className,
        )}
        data-pui="toast-close"
        aria-label="Close"
        {...props}
      >
        {children ?? (
          <svg
            className={styles.glyph}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
          </svg>
        )}
      </BaseToast.Close>
    );
  },
);

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * Transient messages, built on Base UI's `Toast`.
 *
 * ```tsx
 * // once, at the root
 * <Toast.Provider position="bottom-end">
 *   <App />
 * </Toast.Provider>
 *
 * // anywhere below it
 * const toast = useToast();
 * toast.success("Profile saved");
 * ```
 *
 * Two things are worth knowing before reaching for one.
 *
 * **A toast is not a place for anything the user must not miss.** It is
 * announced once and then it is gone; it cannot be scrolled back to, and on a
 * phone it may be covered by the keyboard. An error the user has to act on
 * belongs next to the thing that failed.
 *
 * **Timers pause while the stack is hovered, focused, or the window is in the
 * background,** so a toast raised while the user was in another tab is still
 * there when they come back.
 *
 * Styling is driven by `data-*` attributes and `--pui-toast-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[type=error]:...`) without wrapping anything.
 */
export const Toast = {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Item: ToastItem,
  Icon: ToastIcon,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  /** Creates a manager for raising toasts outside React. */
  createManager: createToastManager,
};
