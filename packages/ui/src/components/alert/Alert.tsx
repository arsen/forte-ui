"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./Alert.module.css";

export type AlertVariant = "soft" | "outline";
export type AlertTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type AlertLive = "off" | "polite" | "assertive";

/* -------------------------------------------------------------------------
 * Context
 *
 * Two things the parts cannot work out for themselves: which glyph `Alert.Icon`
 * should draw, and how `Alert.Close` asks the root to leave. Everything else is
 * CSS, which already inherits.
 * ---------------------------------------------------------------------- */

interface AlertContextValue {
  tone: AlertTone;
  dismiss: () => void;
}

const AlertContext = React.createContext<AlertContextValue>({
  tone: "neutral",
  dismiss: () => {},
});

/**
 * `useLayoutEffect`, except on the server, where React warns that it does
 * nothing. The exit sequence below has to run before paint — a frame spent
 * with the height already frozen but the exit not yet started is a frame the
 * card visibly sits still — but the warning fires on the hook being *called*,
 * so the swap has to happen whether or not the effect would do anything.
 */
const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Where the card is in its exit.
 *
 *   null       in the page, nothing happening
 *   "measured" height frozen at the pixel value it currently has, nothing else
 *              changed yet — this phase exists ONLY to give the collapse a
 *              from-value, since `block-size: auto` is not interpolable
 *   "leaving"  `data-ending-style` applied; the transition is running
 *
 * The middle phase is one render and no frame: the layout effect that sets it
 * up forces a style recalculation and moves straight on, so the browser records
 * the frozen height as the "before" style and paints once, already leaving.
 */
type ExitPhase = null | "measured" | "leaving";

/* -------------------------------------------------------------------------
 * Status glyphs
 * ---------------------------------------------------------------------- */

/**
 * The four status glyphs are four distinct SHAPES, not one shape in four
 * colours. That is what keeps the type readable to a colour-blind reader and
 * under forced colours, where every glyph repaints in one system colour
 * (WCAG SC 1.4.1).
 *
 * `stroke` rather than `fill`, at a weight that stays legible at 16px, and
 * `aria-hidden` on all of them: the alert's own text already says which kind
 * of message it is, and announcing "check mark" before it would be noise.
 */
function StatusIcon({ children, ...rest }: React.ComponentProps<"svg">) {
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

/* Only the four tones that MEAN something get one. `neutral`, `primary` and
 * `secondary` are emphasis, not status — there is no glyph that says "this is
 * a slightly louder paragraph" — so `<Alert.Icon />` renders nothing on them
 * and the icon column collapses rather than leaving a hole. */
const GLYPHS: Partial<Record<AlertTone, React.ReactNode>> = {
  success: (
    <StatusIcon>
      <circle cx="8" cy="8" r="6.4" />
      <path d="m5.2 8.2 2 2 3.6-4.4" />
    </StatusIcon>
  ),
  danger: (
    <StatusIcon>
      <circle cx="8" cy="8" r="6.4" />
      <path d="m5.8 5.8 4.4 4.4M10.2 5.8l-4.4 4.4" />
    </StatusIcon>
  ),
  warning: (
    <StatusIcon>
      <path d="M8 2.2 1.6 13.4h12.8L8 2.2Z" />
      <path d="M8 6.4v3.1" />
      <path d="M8 11.4h.01" />
    </StatusIcon>
  ),
  info: (
    <StatusIcon>
      <circle cx="8" cy="8" r="6.4" />
      <path d="M8 7.4v3.6" />
      <path d="M8 5h.01" />
    </StatusIcon>
  ),
};

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/* `role="alert"` carries an implicit `aria-live="assertive"`, and `role=
 * "status"` an implicit `polite`. Mapping the prop to a ROLE rather than to a
 * bare `aria-live` is what also gives the element a name in the roles list
 * some screen readers offer, so the two stay consistent. */
const ROLE: Record<AlertLive, string | undefined> = {
  off: undefined,
  polite: "status",
  assertive: "alert",
};

export interface AlertRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * How loud the card is. `soft` tints the whole surface in the tone and
   * paints the message in it; `outline` is a neutral panel with a hairline,
   * where the tone survives only in the glyph.
   *
   * Reach for `outline` when several alerts share a screen, or when the alert
   * sits inside a form beside other bordered controls — a page of tinted
   * fields has nothing left to emphasise with.
   * @default "soft"
   */
  variant?: AlertVariant;
  /**
   * Which semantic colour set the alert draws from, and which glyph
   * `Alert.Icon` picks when you do not give it one.
   *
   * The four status tones are the ones with a glyph — `success`, `warning`,
   * `danger`, `info`. `neutral`, `primary` and `secondary` are emphasis
   * rather than status and deliberately have none.
   * @default "neutral"
   */
  tone?: AlertTone;
  /**
   * Whether the alert announces itself when it appears, and how urgently.
   *
   * `off` is the default because most alerts are in the page from the start,
   * and a live region only announces a CHANGE — so a server-rendered
   * `role="alert"` announces nothing while still adding a role to every
   * screen-reader element list. Set it when the alert is inserted in response
   * to something the user did.
   *
   * `polite` (`role="status"`) waits for a pause and is right for almost
   * everything — a saved confirmation, a background result. `assertive`
   * (`role="alert"`) interrupts whatever is being read, so keep it for
   * failures the user has to act on: a payment that did not go through, work
   * that is about to be lost.
   * @default "off"
   */
  live?: AlertLive;
  /**
   * Whether the alert is in the page. Pass it to take control of dismissal —
   * `Alert.Close` then reports through `onOpenChange` instead of closing the
   * card itself.
   *
   * Setting it to `false` does not unmount immediately: the card runs its exit
   * transition first and removes itself when that finishes. Rendering the
   * alert conditionally — `{open && <Alert.Root>}` — skips the transition
   * entirely, because React takes the element out of the DOM before any of it
   * can run. That is the reason this prop exists.
   */
  open?: boolean;
  /**
   * Whether the alert starts in the page, when it is uncontrolled.
   * @default true
   */
  defaultOpen?: boolean;
  /**
   * Called when `Alert.Close` is pressed, with `false`.
   *
   * It fires at the START of the exit, not the end — it is a request, and the
   * card is still on screen when you hear about it. Use `onExitComplete` for
   * the moment it is actually gone.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Called once the exit transition has finished and the card has removed
   * itself from the DOM.
   *
   * This is where an alert that lives in a list gets spliced out of it.
   * Removing it in `onOpenChange` instead unmounts the element mid-transition,
   * which is the bug the two callbacks exist to keep apart.
   */
  onExitComplete?: () => void;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The card. Holds an `Alert.Icon`, an `Alert.Title`, an `Alert.Description`,
 * an `Alert.Action` and an `Alert.Close`, all optional and all siblings.
 *
 * The parts are flat rather than nested in a text wrapper because the layout
 * is a grid and every part places itself in it. Absent parts cost nothing: the
 * gaps are margins on the parts themselves rather than a `column-gap`, so an
 * alert with no icon has no icon column to leave empty.
 *
 * It owns exactly one bit of state, and only because nothing else can: React
 * removes an element from the DOM the moment it stops being rendered, so an
 * alert whose presence is a plain conditional has no way to animate out. The
 * root therefore outlives its own `open={false}` for the length of one
 * transition, then unmounts itself.
 */
const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(function AlertRoot(
  {
    variant = "soft",
    tone = "neutral",
    live = "off",
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    onExitComplete,
    className,
    children,
    style,
    ...props
  },
  ref,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  /* `present` is what decides whether the div renders at all, and it lags
   * `open` by the length of the exit. It is seeded from `open` rather than
   * from `true`, so an alert that renders closed never appears for a frame —
   * and an alert that renders OPEN, which is almost all of them, gets no
   * transition on its first paint. */
  const [present, setPresent] = React.useState(open);
  const [phase, setPhase] = React.useState<ExitPhase>(null);
  const heightRef = React.useRef(0);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  /* Start or cancel the exit. Cancelling matters: an alert reopened while it
   * is still leaving drops `data-ending-style` and the transition reverses
   * from wherever it got to, which is the whole reason this is a transition
   * and not a keyframe animation. */
  useIsoLayoutEffect(() => {
    if (open) {
      setPresent(true);
      setPhase(null);
      return;
    }
    setPhase((current) => {
      if (current !== null) return current;
      const el = rootRef.current;
      if (!el) return current;
      heightRef.current = el.getBoundingClientRect().height;
      return "measured";
    });
  }, [open]);

  useIsoLayoutEffect(() => {
    if (phase !== "measured") return;
    const el = rootRef.current;
    if (!el) return;
    /* Force a style recalculation while the height is still the frozen pixel
     * value. Without it React's next render can be folded into the same
     * recalculation, the browser only ever sees `auto → 0`, and there is
     * nothing between them to interpolate — the card would blink out. */
    void el.getBoundingClientRect();
    setPhase("leaving");
  }, [phase]);

  useIsoLayoutEffect(() => {
    if (phase !== "leaving") return;
    const el = rootRef.current;

    const finish = () => {
      setPresent(false);
      setPhase(null);
      if (openProp === undefined) setUncontrolledOpen(false);
      onExitComplete?.();
    };

    /* The same wait Base UI does before unmounting a popup. `getAnimations()`
     * flushes pending style changes, so the transitions this render created
     * are already in the list; it is NOT called with `subtree: true`, so a
     * consumer's own animation on a child cannot hold the card open. An
     * `infinite` animation on the ROOT still would — that promise never
     * settles — which is the one thing not to put here. */
    const animations = el?.getAnimations() ?? [];
    if (animations.length === 0) {
      finish();
      return;
    }

    let cancelled = false;
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) finish();
    });
    return () => {
      cancelled = true;
    };
    // `finish` closes over props that are stable for the length of one exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const dismiss = React.useCallback(() => {
    if (openProp === undefined) setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [openProp, onOpenChange]);

  const context = React.useMemo(() => ({ tone, dismiss }), [tone, dismiss]);

  if (!present) return null;

  return (
    <AlertContext.Provider value={context}>
      <div
        ref={setRefs}
        role={ROLE[live]}
        className={clsx(styles.root, className)}
        data-forte="alert"
        data-variant={variant}
        data-tone={tone}
        data-exiting={phase ? "" : undefined}
        data-ending-style={phase === "leaving" ? "" : undefined}
        /* The measured height, and the only value here that could not have
         * been a token: it is the card's own rendered size, read at the moment
         * it was asked to leave. */
        style={
          phase
            ? ({ "--forte-alert-exit-from": `${heightRef.current}px`, ...style } as React.CSSProperties)
            : style
        }
        {...props}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
});

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

export interface AlertIconProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * The glyph to draw. Defaults to the standard one for the root's `tone`,
   * and any `svg` passed here is sized to `--forte-alert-icon-size` without
   * needing a size prop of its own.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The glyph, coloured by the alert's tone.
 *
 * Renders nothing when there is nothing to draw — no children and a tone with
 * no standard glyph — so `<Alert.Icon />` is safe to leave in a component that
 * takes its tone from a prop. The icon column collapses rather than opening a
 * gap where a glyph would be.
 *
 * It is centred on the TITLE's line box rather than on the card, so the glyph
 * lines up with the first line of text whether the description runs to one
 * line or five.
 */
const AlertIcon = React.forwardRef<HTMLSpanElement, AlertIconProps>(function AlertIcon(
  { className, children, ...props },
  ref,
) {
  const { tone } = React.useContext(AlertContext);
  const content = children ?? GLYPHS[tone];

  if (content == null || content === false) {
    return null;
  }

  return (
    <span ref={ref} className={clsx(styles.icon, className)} data-forte="alert-icon" {...props}>
      {content}
    </span>
  );
});

/* -------------------------------------------------------------------------
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface AlertTitleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The one-line summary, in the tone's own colour on `soft` and in the plain
 * foreground on `outline`.
 *
 * It renders a `<div>`, not a heading, and that is deliberate: an alert is a
 * message about the state of the page rather than a section of it, and an
 * `<h3>` here lands in the document outline between two real sections — which
 * is what a screen-reader user navigating by heading has to wade through. If
 * the alert genuinely opens a region, name the region instead.
 *
 * A long title wraps. It is not truncated, because the summary is the part a
 * reader who skips the description still has to be able to read.
 */
const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(function AlertTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.title, className)} data-forte="alert-title" {...props}>
      {children}
    </div>
  );
});

export interface AlertDescriptionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The body copy, under the title and in the same column.
 *
 * A `<div>` rather than a `<p>`, so a list, a code snippet or a second
 * paragraph can go inside without producing invalid markup. Paragraphs and
 * lists placed in it lose their outer margins, so the card closes evenly
 * whether the description is one sentence or three items.
 */
const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  function AlertDescription({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.description, className)}
        data-forte="alert-description"
        {...props}
      >
        {children}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------
 * Action
 * ---------------------------------------------------------------------- */

export interface AlertActionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The trailing slot for whatever the message asks the reader to do — usually
 * one `Button`, occasionally two.
 *
 * It is a slot and not a button: an alert's action is a real control with its
 * own variant, tone, loading state and href, and wrapping `Button` would mean
 * re-exposing all of it. Compose instead — `<Alert.Action><Button size="sm"
 * variant="outline">Retry</Button></Alert.Action>`.
 *
 * It sits against the inline-end edge, centred on the whole message rather
 * than on the title, so a three-line description does not leave the button
 * floating at the top.
 */
const AlertAction = React.forwardRef<HTMLDivElement, AlertActionProps>(function AlertAction(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.action, className)} data-forte="alert-action" {...props}>
      {children}
    </div>
  );
});

/* -------------------------------------------------------------------------
 * Close
 * ---------------------------------------------------------------------- */

export interface AlertCloseProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The button that dismisses the alert.
 *
 * On an uncontrolled alert it closes the card on its own, which is the whole
 * of the common case — `<Alert.Root>` with an `<Alert.Close />` in it needs no
 * state and no handler. On a controlled one it reports through the root's
 * `onOpenChange` and changes nothing itself.
 *
 * Either way the card runs its exit transition before it goes. Calling
 * `preventDefault()` in your own `onClick` stops the dismissal, which is how a
 * "discard your draft?" confirmation gets in front of it.
 *
 * Renders a "×" with an `aria-label` of "Dismiss", both overridable through
 * `children` and `aria-label`. `type="button"` is set because the default is
 * `submit`, and an alert inside a form is exactly where that bites.
 */
const AlertClose = React.forwardRef<HTMLButtonElement, AlertCloseProps>(function AlertClose(
  { className, children, onClick, ...props },
  ref,
) {
  const { dismiss } = React.useContext(AlertContext);

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.close, "forte-focus-ring", className)}
      data-forte="alert-close"
      aria-label="Dismiss"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) dismiss();
      }}
      {...props}
    >
      {children ?? (
        <svg
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
    </button>
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A message about the state of the page, sitting in the page rather than over
 * it — the persistent counterpart to `Toast`.
 *
 * ```tsx
 * <Alert.Root tone="danger" live="assertive">
 *   <Alert.Icon />
 *   <Alert.Title>Payment failed</Alert.Title>
 *   <Alert.Description>
 *     Your card was declined. Check the details and try again.
 *   </Alert.Description>
 *   <Alert.Action>
 *     <Button size="sm" variant="outline" tone="danger">Retry</Button>
 *   </Alert.Action>
 *   <Alert.Close />
 * </Alert.Root>
 * ```
 *
 * `Alert.Close` dismisses the card itself, with a transition, needing no state
 * of yours. Pass `open` and `onOpenChange` to take that over — and note that
 * a conditional, `{open && <Alert.Root>}`, has no exit at all, because React
 * removes the element before the transition can start.
 *
 * There is no Base UI primitive under it, because there is almost no state to
 * model — no focus to manage, nothing to position. What it does have is a
 * layout that has to survive any subset of its five parts, a pair of colour
 * axes, a live-region decision that is easy to get wrong, and exactly one bit
 * of state: whether it is still in the page. That last one is owned here only
 * because React unmounts an element the frame it stops being rendered, so an
 * alert dismissed by a plain conditional can never animate out.
 *
 * Styling is driven by `data-*` attributes and `--forte-alert-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[tone=danger]:...`) without wrapping.
 */
export const Alert = {
  Root: AlertRoot,
  Icon: AlertIcon,
  Title: AlertTitle,
  Description: AlertDescription,
  Action: AlertAction,
  Close: AlertClose,
};
