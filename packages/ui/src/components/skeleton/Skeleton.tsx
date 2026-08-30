"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./Skeleton.module.css";

export type SkeletonVariant = "rect" | "text" | "circle";
export type SkeletonAnimation = "pulse" | "shimmer" | "none";

/**
 * What a `Skeleton.Group` hands down to every skeleton inside it.
 *
 * Both fields are defaults rather than commands — a skeleton that sets its own
 * `animation` or `loading` wins, which is what lets one placeholder in a card
 * opt out without the group having to know about it.
 */
type SkeletonContextValue = {
  animation: SkeletonAnimation;
  loading: boolean;
};

const SkeletonContext = React.createContext<SkeletonContextValue | null>(null);

/**
 * A CSS length. A bare number is pixels, which is the one place in this
 * library a raw pixel value is reasonable: it is the consumer's measurement of
 * their own content, not a design decision baked into the component.
 */
type SkeletonLength = string | number;

function toLength(value: SkeletonLength | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface SkeletonRootProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * The silhouette. `rect` is a block — a thumbnail, a card, a button.
   * `circle` is an avatar or a status dot, and stays round under
   * `data-forte-radius="none"`.
   *
   * `text` is a thin bar the height of the ink a line of text actually puts
   * down, and it is `inline-block`, so it can sit inside a real sentence —
   * "posted by ▓▓▓▓ an hour ago". Note that it paints the ink and nothing
   * else: standing on its own in a column it is SHORTER than the line it
   * replaces, because the leading is missing. Reach for `Skeleton.Text` there,
   * `lines={1}` included — reserving the whole line box is exactly what it is
   * for.
   * @default "rect"
   */
  variant?: SkeletonVariant;
  /**
   * How the placeholder signals that it is a placeholder.
   *
   * `pulse` is a shallow opacity breathe — quiet, and identical whichever way
   * it is laid out. `shimmer` sends a band of light across the fill, which
   * reads as faster and suits a screenful of placeholders; it follows the
   * reading direction, and degrades into `pulse` under reduced motion.
   * `none` is a static fill, for a screenshot test or a page where something
   * else already owns the movement.
   *
   * Falls back to the enclosing `Skeleton.Group`, then to `pulse`.
   * @default "pulse"
   */
  animation?: SkeletonAnimation;
  /**
   * Whether the placeholder is showing. When it flips to `false` the skeleton
   * renders `children` — with no wrapper of its own, so nothing of the
   * placeholder is left in the DOM or in the layout.
   *
   * Falls back to the enclosing `Skeleton.Group`, then to `true`.
   * @default true
   */
  loading?: boolean;
  /**
   * Width of the placeholder. A number is pixels; a string is any CSS length,
   * including a percentage.
   *
   * Optional in every sense — `className="w-24"` does the same job and wins
   * over this, and with `children` present the content decides.
   */
  width?: SkeletonLength;
  /**
   * Height of the placeholder. A number is pixels; a string is any CSS length.
   *
   * The default is one line box at the inherited font size, so a skeleton
   * standing in for a line of text needs no measurement at all.
   */
  height?: SkeletonLength;
  /**
   * The real content, used only to SIZE the placeholder.
   *
   * While loading it is laid out and then hidden with `visibility`, so the
   * skeleton is exactly the box the content will occupy and nothing shifts
   * when it arrives. Note that this renders the content — pass a string or a
   * cheap node, not a subtree you would rather not mount twice.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One placeholder shape.
 *
 * ```tsx
 * <Skeleton.Root className="h-32 w-full" />
 * <Skeleton.Root variant="circle" width="2.5rem" />
 * <Skeleton.Root loading={pending}>{user.name}</Skeleton.Root>
 * ```
 */
const SkeletonRoot = React.forwardRef<HTMLSpanElement, SkeletonRootProps>(function SkeletonRoot(
  {
    variant = "rect",
    animation,
    loading,
    width,
    height,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const group = React.useContext(SkeletonContext);
  const resolvedAnimation = animation ?? group?.animation ?? "pulse";
  const isLoading = loading ?? group?.loading ?? true;

  // Not a wrapper with `display: contents`, and not a hidden box — nothing at
  // all. Once the content is here the placeholder has no further opinion about
  // layout, and leaving an element behind means a consumer's `className` keeps
  // applying to markup that no longer represents anything.
  if (!isLoading) return <>{children}</>;

  return (
    <span
      ref={ref}
      className={clsx(styles.root, className)}
      data-forte="skeleton"
      data-variant={variant}
      data-animation={resolvedAnimation}
      // The placeholder is a picture of absence: there is nothing here to
      // read, and announcing "blank blank blank" for a card of them is worse
      // than silence. `Skeleton.Group` is what says "Loading", once.
      aria-hidden="true"
      style={
        {
          "--forte-skeleton-width": toLength(width),
          "--forte-skeleton-height": toLength(height),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children === undefined ? null : (
        <span className={styles.content} data-forte="skeleton-content">
          {children}
        </span>
      )}
    </span>
  );
});

/* -------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------- */

export interface SkeletonTextProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children"> {
  /**
   * How many lines to draw. The block is exactly as tall as that many lines of
   * real text at the inherited font size, so swapping it for the paragraph
   * moves nothing below it.
   * @default 3
   */
  lines?: number;
  /**
   * Width of the last line. Real paragraphs end mid-line, and a block of
   * equal-length bars reads as a table rather than as prose. Any CSS length; a
   * number is pixels.
   * @default "60%"
   */
  lastLineWidth?: SkeletonLength;
  /** See `Skeleton.Root`. Falls back to the enclosing group, then `pulse`. */
  animation?: SkeletonAnimation;
  /** See `Skeleton.Root`. Falls back to the enclosing group, then `true`. */
  loading?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A paragraph's worth of placeholder lines, measured like type.
 *
 * This — not `Skeleton.Root variant="text"` — is what to put where real text
 * will go, `lines={1}` included. A bare text root paints only the ink; this
 * one reserves the whole line box, leading and all, which is what keeps the
 * page from moving when the words arrive.
 *
 * A line paints `--forte-skeleton-ink` rather than its whole line box, the
 * leading becomes the gap, and half a leading sits above the first line and
 * below the last — which is what makes the block exactly `lines × 1em ×
 * line-height` tall. Set the font size on this element and the whole thing
 * rescales; it is what the metrics are relative to.
 *
 * ```tsx
 * <Skeleton.Text lines={4} />
 * <Skeleton.Text lines={1} className="w-32" />
 * <Skeleton.Text lines={2} className="text-5" />
 * ```
 */
const SkeletonText = React.forwardRef<HTMLSpanElement, SkeletonTextProps>(function SkeletonText(
  { lines = 3, lastLineWidth = "60%", animation, loading, className, ...props },
  ref,
) {
  const group = React.useContext(SkeletonContext);
  if (!(loading ?? group?.loading ?? true)) return null;

  return (
    <span ref={ref} className={clsx(styles.text, className)} data-forte="skeleton-text" {...props}>
      {Array.from({ length: Math.max(0, lines) }, (_, i) => (
        <SkeletonRoot
          key={i}
          variant="text"
          animation={animation}
          // Passed through rather than left to context: this component just
          // resolved `loading` for itself, and a line consulting the group
          // independently can disagree — `loading` on a Text inside a group
          // that has finished would render the container and lose the lines.
          loading={loading}
          // Only the last line is short, and only when there is more than one:
          // a single line trimmed to 60% looks like a mistake rather than like
          // the end of a paragraph.
          width={i === lines - 1 && lines > 1 ? lastLineWidth : undefined}
        />
      ))}
    </span>
  );
});

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

export interface SkeletonGroupProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Whether the region is still loading. Sets `aria-busy`, swaps the announced
   * message, and becomes the default for every skeleton inside.
   * @default true
   */
  loading?: boolean;
  /**
   * What is being waited for. This is the only thing a screen reader gets —
   * the placeholders themselves are `aria-hidden`, because a picture of
   * absence is not information.
   *
   * Say what is coming rather than that something is: "Loading invoices" tells
   * someone whether the wait concerns them; "Loading" makes them guess.
   * @default "Loading"
   */
  label?: string;
  /**
   * What to announce once `loading` turns false. Left unset, the region simply
   * goes quiet — which is the right default when the content that arrives is
   * itself obvious, and the wrong one when the user is waiting on a background
   * refresh they cannot see.
   */
  doneLabel?: string;
  /**
   * Default animation for every skeleton in the group. A skeleton that sets
   * its own still wins.
   * @default "pulse"
   */
  animation?: SkeletonAnimation;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The region a screenful of placeholders belongs to: one live region, one
 * announcement, one `loading` flag.
 *
 * Keep it mounted across both states — that is the whole point. A live region
 * has to exist *before* its contents change to be announced reliably, so a
 * status element that appears at the same moment as the thing it is announcing
 * is heard inconsistently. Rendering the group either way, and letting
 * `loading` flip inside it, is what makes the announcement dependable.
 *
 * ```tsx
 * <Skeleton.Group loading={pending} label="Loading invoices" doneLabel="Invoices loaded">
 *   {pending ? <Skeleton.Text lines={3} /> : rows.map(…)}
 * </Skeleton.Group>
 * ```
 */
const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(function SkeletonGroup(
  { loading = true, label = "Loading", doneLabel, animation = "pulse", className, children, ...props },
  ref,
) {
  const value = React.useMemo(() => ({ animation, loading }), [animation, loading]);

  return (
    <SkeletonContext.Provider value={value}>
      <div
        ref={ref}
        className={clsx(styles.group, className)}
        data-forte="skeleton-group"
        data-loading={loading || undefined}
        // Says "the contents of this region are mid-update", which is the part
        // `role="status"` alone does not convey.
        aria-busy={loading}
        {...props}
      >
        {/* The live region is this span, not the wrapper. `role="status"`
          * carries an implicit `aria-atomic="true"`, so putting it on the
          * wrapper would make every arriving row re-read the ENTIRE region —
          * a table of forty invoices announced in full the moment it lands.
          * Kept to the message, it says one sentence and stops. */}
        <span className="forte-visually-hidden" role="status">
          {loading ? label : doneLabel}
        </span>
        {children}
      </div>
    </SkeletonContext.Provider>
  );
});

/**
 * A placeholder that occupies exactly the space the real thing will.
 *
 * Base UI has no skeleton primitive — there is no interaction to model and no
 * state machine to get right — so this is one of the few components in the
 * library not built on one. What is left is the part that is usually got
 * wrong: metrics that actually match the content, so the page does not jump
 * when the data lands; one announcement for one wait; and an animation that
 * stays a "this is coming" cue when the user has asked for less motion,
 * instead of freezing into something that reads as content that failed.
 *
 * ```tsx
 * <Skeleton.Group loading={pending} label="Loading profile">
 *   <div className="flex items-center gap-3">
 *     <Skeleton.Root variant="circle" width="2.5rem" />
 *     <Skeleton.Text lines={2} className="w-48" />
 *   </div>
 * </Skeleton.Group>
 * ```
 *
 * Styling is driven by `data-*` attributes and `--forte-skeleton-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[variant=circle]:...`) without wrapping.
 */
export const Skeleton = {
  Root: SkeletonRoot,
  Text: SkeletonText,
  Group: SkeletonGroup,
};
