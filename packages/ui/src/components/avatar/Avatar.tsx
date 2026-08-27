"use client";

import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarVariant = "soft" | "solid" | "outline";
export type AvatarTone = "neutral" | "primary" | "secondary" | "danger";
export type AvatarBadgeTone = AvatarTone | "success" | "warning";
export type AvatarBadgePlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>;
type BaseImageProps = React.ComponentPropsWithoutRef<typeof BaseAvatar.Image>;
type BaseFallbackProps = React.ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>;

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface AvatarRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Diameter of the avatar — `1.5rem` through `4rem`. Everything inside is a
   * fraction of it, so the initials, the icon and the corner radius all follow
   * without a second prop.
   * @default "md"
   */
  size?: AvatarSize;
  /**
   * The silhouette. `circle` is the convention for people; `rounded` and
   * `square` read as an object — a workspace, a repository, a bot.
   *
   * `circle` stays a circle under `data-pui-radius="none"`, because you asked
   * for one. Only `rounded` follows the radius preset.
   * @default "circle"
   */
  shape?: AvatarShape;
  /**
   * How loud the fallback is. `soft` is a tinted disc with tone-coloured
   * initials, `solid` fills with the tone itself, `outline` is a ring around
   * nothing.
   *
   * This only decides what shows while there is no image — a loaded image
   * covers the fill entirely. `outline` is the exception: its border sits
   * outside the picture and stays visible either way.
   * @default "soft"
   */
  variant?: AvatarVariant;
  /**
   * Which semantic colour set the fallback draws from. Rotating the tone
   * across a list is the cheapest way to make initials tell people apart —
   * but colour is never the only cue, since the initials themselves differ.
   * @default "neutral"
   */
  tone?: AvatarTone;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The avatar box. Holds an `Avatar.Image`, an `Avatar.Fallback`, or both —
 * Base UI mounts whichever the image's loading status calls for.
 *
 * It is a one-cell grid, and both parts are placed in that cell. Stacking them
 * in flow would put the outgoing image *beside* the fallback for the frames it
 * spends fading out, doubling the avatar's width and snapping it back.
 */
const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarRootProps>(function AvatarRoot(
  { size = "md", shape = "circle", variant = "soft", tone = "neutral", className, children, ...props },
  ref,
) {
  return (
    <BaseAvatar.Root
      ref={ref}
      className={clsx(styles.root, className)}
      data-pui="avatar"
      data-size={size}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      {...props}
    >
      {children}
    </BaseAvatar.Root>
  );
});

/* -------------------------------------------------------------------------
 * Image
 * ---------------------------------------------------------------------- */

export interface AvatarImageProps extends Omit<BaseImageProps, "className"> {
  /**
   * What the picture shows. Required, because there is no sensible guess: the
   * fallback's initials are gone the moment the image loads, so an avatar with
   * no alt text and no adjacent name leaves the person unidentifiable.
   *
   * Pass the person's name when the avatar is the only thing naming them, and
   * `""` when their name is already written beside it — a photo repeated as
   * "Jane Doe Jane Doe" is worse than no alt at all.
   */
  alt: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The picture. Base UI preloads `src` off-screen and only mounts this element
 * once the load succeeds, so a broken URL never paints a torn-image glyph —
 * the fallback simply stays.
 *
 * The image is cropped to the box with `object-fit: cover`, so a portrait, a
 * landscape and a square all read the same.
 */
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { className, ...props },
  ref,
) {
  return (
    <BaseAvatar.Image
      ref={ref}
      className={clsx(styles.image, className)}
      data-pui="avatar-image"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Fallback
 * ---------------------------------------------------------------------- */

export interface AvatarFallbackProps extends Omit<BaseFallbackProps, "className"> {
  /**
   * How long to wait before showing the fallback, in milliseconds.
   *
   * Left at Base UI's `0`, which is right whenever the fallback IS the avatar:
   * a non-zero delay withholds it during server rendering too, so an
   * initials-only avatar would ship as an empty disc and pop in a tenth of a
   * second later.
   *
   * Set it to ~100–150ms when there is an `Avatar.Image` beside it. A cached
   * image is not decoded until after hydration, so at `0` the initials paint
   * and are replaced on every load; a short wait swallows that flash, at the
   * cost of an empty disc for the same span on a slow connection.
   * @default 0
   */
  delay?: number;
  /**
   * The person or thing this avatar stands for, for assistive technology only.
   *
   * Initials are a visual shorthand and read as noise — "J D" — so passing a
   * label hides the children from the accessibility tree and announces this
   * instead. Leave it unset when the name is already written next to the
   * avatar, or when the fallback is a decorative icon.
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * What shows when there is no image, or when the image fails: initials, an
 * icon, a `+3` counter.
 *
 * An `svg` child is sized to `--pui-avatar-icon-size` automatically, so a
 * lucide or Heroicons glyph needs no wrapper and no size prop of its own.
 */
const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ delay = 0, label, className, children, ...props }, ref) {
    return (
      <BaseAvatar.Fallback
        ref={ref}
        className={clsx(styles.fallback, className)}
        data-pui="avatar-fallback"
        delay={delay}
        {...props}
      >
        {/* Always wrapped, `label` or not, so the DOM a consumer styles
          * against does not change shape when the prop is added. The wrapper
          * is what `aria-hidden` needs to land on: putting it on the fallback
          * itself would take the label down with it, since aria-hidden hides
          * the whole subtree. */}
        <span
          className={styles.content}
          data-pui="avatar-fallback-content"
          aria-hidden={label ? "true" : undefined}
        >
          {children}
        </span>
        {label ? <span className="pui-visually-hidden">{label}</span> : null}
      </BaseAvatar.Fallback>
    );
  },
);

/* -------------------------------------------------------------------------
 * Badge
 * ---------------------------------------------------------------------- */

export interface AvatarBadgeProps extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Which semantic colour set the badge draws from. `success`, `warning` and
   * `danger` are the presence set — online, away, do-not-disturb — and the
   * brand tones suit a count or a verification tick.
   *
   * Colour is never the only cue: pass `label`, or write the status out beside
   * the avatar, so the badge is repeating something rather than saying it.
   * @default "neutral"
   */
  tone?: AvatarBadgeTone;
  /**
   * Which corner it sits on.
   *
   * `bottom-end` is the convention, and it is also the corner a group covers:
   * avatars in an `Avatar.Group` overlap toward the inline-start, so every
   * avatar but the last has its inline-end corner painted over by the next
   * one. Use `bottom-start` there, or badge only the last avatar.
   * @default "bottom-end"
   */
  placement?: AvatarBadgePlacement;
  /**
   * What the badge means, for assistive technology.
   *
   * A bare dot is decoration and is hidden from the accessibility tree unless
   * you pass this. A badge with visible content stays in the tree either way —
   * `label` then replaces what is announced, the way it does on
   * `Avatar.Fallback`, so `4` can read as "4 unread messages".
   *
   * Leave it unset when the status is already written next to the avatar.
   */
  label?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A presence dot, a small count, or a verification tick, hung on the corner of
 * the avatar.
 *
 * Base UI has no badge primitive — there is no state to model — so this is
 * placement and paint, which is exactly the part worth having in the library:
 * the offset that lands a dot on the avatar's outline is `0.2929 × radius`
 * from the corner of the box, it differs per `shape`, and it only stays right
 * if the badge's size scales with the avatar. A hand-rolled `<span>` with a
 * fixed size and `inset: 0` looks correct at one `size` and drifts at the
 * others.
 *
 * It is `pointer-events: none`, so an avatar composed as a link or a button
 * keeps its whole hit box.
 */
const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(function AvatarBadge(
  { tone = "neutral", placement = "bottom-end", label, className, children, ...props },
  ref,
) {
  /* An empty badge is a dot, and a dot is the one shape whose FILL carries the
   * meaning — which is what the forced-colors rule needs to know, and cannot
   * work out for itself: `:has(> *)` would miss a bare text node like `3`. */
  const isDot = children == null || children === false || children === "";

  return (
    <span
      ref={ref}
      className={clsx(styles.badge, className)}
      data-pui="avatar-badge"
      data-tone={tone}
      data-placement={placement}
      data-dot={isDot ? "" : undefined}
      /* Decoration until it is given a name. A badge with visible content is
       * never decoration, though, so hiding it on `label` alone would silently
       * delete a `+3` from the accessibility tree. */
      aria-hidden={label || !isDot ? undefined : "true"}
      {...props}
    >
      {/* Always wrapped, for the reason `Avatar.Fallback` gives: the DOM a
        * consumer styles against must not change shape when `label` is added,
        * and `aria-hidden` has to land on the wrapper rather than the badge so
        * it does not take the label down with the subtree. */}
      <span
        className={styles.badgeContent}
        data-pui="avatar-badge-content"
        aria-hidden={label ? "true" : undefined}
      >
        {children}
      </span>
      {label ? <span className="pui-visually-hidden">{label}</span> : null}
    </span>
  );
});

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

export interface AvatarGroupProps extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A row of avatars that overlap, for "who is on this".
 *
 * Base UI has no group primitive — there is no state and no interaction to
 * model — so this is layout and nothing else: a flex row, a negative
 * `margin-inline-start` on every child but the first, and a ring pushed onto
 * each descendant `Avatar.Root` so the overlap reads as a stack rather than a
 * smear. Every avatar keeps its own `size`, `shape` and `tone`.
 *
 * Later children paint over earlier ones, which is why a `+3` counter belongs
 * last: it ends up on top, where the eye finishes.
 */
const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { className, children, ...props },
  ref,
) {
  return (
    <span ref={ref} className={clsx(styles.group, className)} data-pui="avatar-group" {...props}>
      {children}
    </span>
  );
});

/**
 * An avatar built on Base UI's unstyled `Avatar` primitive: a picture of a
 * person or a thing, with something sensible to show when the picture is
 * missing, slow or broken.
 *
 * ```tsx
 * <Avatar.Root size="lg">
 *   <Avatar.Image src={user.photo} alt={user.name} />
 *   <Avatar.Fallback label={user.name}>{initials}</Avatar.Fallback>
 *   <Avatar.Badge tone="success" label="Online" />
 * </Avatar.Root>
 *
 * <Avatar.Group>
 *   <Avatar.Root>…</Avatar.Root>
 *   <Avatar.Root>…</Avatar.Root>
 *   <Avatar.Root tone="primary"><Avatar.Fallback label="3 more">+3</Avatar.Fallback></Avatar.Root>
 * </Avatar.Group>
 * ```
 *
 * Styling is driven by `data-*` attributes and `--pui-avatar-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[shape=square]:...`) without wrapping.
 */
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Badge: AvatarBadge,
  Group: AvatarGroup,
};
