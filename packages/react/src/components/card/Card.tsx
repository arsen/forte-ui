"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./Card.module.css";

export type CardVariant = "outline" | "soft" | "elevated";
export type CardFooterAlign = "start" | "center" | "end" | "between";

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface CardRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * How the card separates itself from the page. `outline` is a panel with a
   * hairline; `soft` drops the edge and deepens the fill by one step instead;
   * `elevated` adds a shadow on top of the hairline.
   *
   * All three occupy identical space — the border is reserved even where it
   * is painted transparent — so switching between them moves nothing.
   * @default "outline"
   */
  variant?: CardVariant;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The surface. Holds a `Card.Header`, a `Card.Media`, a `Card.Content` and a
 * `Card.Footer`, all optional, stacked with one gap between sections — but it
 * does not require its own parts: any child is a section, so a card around a
 * single paragraph or somebody else's markup is still a card.
 *
 * Padding lives here on the root rather than on the parts, which is what
 * `Card.Media` undoes locally to reach the border.
 */
export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(function CardRoot(
  { variant = "outline", className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(styles.root, className)}
      data-forte="card"
      data-variant={variant}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------------- */

export interface CardHeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The card's opening row: a `Card.Title`, a `Card.Description` and a
 * `Card.Action`, each optional and all flat siblings — the header is a grid
 * and every part places itself in it. A header with no action has no action
 * column, so the text runs the full width instead of stopping short of an
 * empty track.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.header, className)} data-forte="card-header" {...props} />
  );
});

/* -------------------------------------------------------------------------
 * Title / Description
 * ---------------------------------------------------------------------- */

export interface CardTitleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The card's name, one type step above the body.
 *
 * It renders a `<div>` because the right heading level is the page's decision,
 * not the card's — the same card sits at `h2` depth on one screen and `h4` on
 * another. When the card genuinely opens a section of the document, nest the
 * heading: `<Card.Title><h3>Invoices</h3></Card.Title>`. A heading placed
 * there takes the card's typography rather than the UA's, so the semantic
 * version looks identical to the plain one.
 */
export const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(function CardTitle(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.title, className)} data-forte="card-title" {...props} />
  );
});

export interface CardDescriptionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The muted line under the title — what the card holds, not the holding
 * itself. A `<div>` rather than a `<p>`, so it can carry a second sentence's
 * markup without producing invalid HTML.
 */
export const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.description, className)}
        data-forte="card-description"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Action
 * ---------------------------------------------------------------------- */

export interface CardActionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The header's trailing slot — a badge, an icon button, a `Menu` trigger. It
 * sits against the inline-end edge, pinned to the top corner when the header
 * has both a title and a description, centered on the title's line when the
 * title is alone.
 *
 * A slot and not a control: whatever goes here is a real component with its
 * own props, and wrapping one would mean re-exposing all of them. Compose
 * instead.
 */
export const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(function CardAction(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.action, className)} data-forte="card-action" {...props} />
  );
});

/* -------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------- */

export interface CardContentProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The body. Paragraphs and lists placed directly in it lose their outer
 * margins, so the section closes evenly against the card's own gap whether it
 * holds a sentence or a form.
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(styles.content, className)}
      data-forte="card-content"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------- */

export interface CardFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Where the footer's children sit along the inline axis.
   *
   * `start` is the default — a card footer is as often a caption or a
   * timestamp as it is a pair of buttons, and captions read from the text
   * edge. `between` is the two-party layout: metadata at the start, the
   * action at the end.
   * @default "start"
   */
  align?: CardFooterAlign;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The closing row — actions, a caption, a link onward. A flex row with the
 * card's standard gap, aligned by the `align` prop rather than by utility
 * classes, so the common layouts stay one word.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { align = "start", className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(styles.footer, className)}
      data-forte="card-footer"
      data-align={align}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Media
 * ---------------------------------------------------------------------- */

export interface CardMediaProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * An edge-to-edge section — an image, a video, a chart, a map. It undoes the
 * root's padding with negative margins and, when it is the first or last
 * section, clips itself to the card's corner radius, so the image meets the
 * border instead of floating inside it.
 *
 * An `<img>` or `<video>` placed directly inside is made block-level and
 * stretched to the full bleed. Height is deliberately not managed here — wrap
 * the image in `AspectRatio` when the box has to hold its shape before the
 * file arrives.
 */
export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={clsx(styles.media, className)} data-forte="card-media" {...props} />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 *
 * The parts are ALSO exported flat (CardRoot, CardHeader, …), and that is not
 * a convenience: a React Server Component cannot dereference `Card.Root` —
 * the namespace object crosses the client boundary as an opaque reference
 * whose properties are `undefined`, which renders as "Element type is
 * invalid" at runtime and passes the type checker completely. The flat names
 * are the ones an RSC can use, the same arrangement Field and DatePicker ship.
 * ---------------------------------------------------------------------- */

/**
 * A static grouping surface — the bordered panel that everything from a
 * settings section to a pricing tier gets built on.
 *
 * ```tsx
 * <Card.Root>
 *   <Card.Header>
 *     <Card.Title>Storage</Card.Title>
 *     <Card.Description>34.2 GB of 50 GB used.</Card.Description>
 *     <Card.Action>
 *       <Badge tone="warning">68%</Badge>
 *     </Card.Action>
 *   </Card.Header>
 *   <Card.Content>…</Card.Content>
 *   <Card.Footer align="end">
 *     <Button variant="outline">Manage</Button>
 *   </Card.Footer>
 * </Card.Root>
 * ```
 *
 * There is no Base UI primitive underneath and no state at all: a card is
 * layout and surface. What earns it a component is the vocabulary — one
 * padding knob the density presets drive, a variant axis that keeps its
 * footprint, a header grid that survives any subset of its parts, and
 * `Card.Media` for the edge-to-edge section that is otherwise four negative
 * margins and a radius calculation at every call site.
 *
 * It sits in the page, so it is a `<div>` with no role. If the card is really
 * a link or a button — a whole tile that navigates — put the interactive
 * element inside and stretch it, rather than making the surface clickable:
 * a `<div onClick>` is invisible to the keyboard and to assistive technology.
 *
 * Styling is driven by `data-variant` and `--forte-card-*` custom properties,
 * so it can be re-skinned from plain CSS or targeted with Tailwind arbitrary
 * variants (`data-[variant=soft]:...`) without wrapping.
 *
 * @summary The bordered grouping surface — header, title, action, content,
 *   footer and media slots for everything from settings sections to pricing
 *   tiers.
 * @category Content & layout
 */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
  Media: CardMedia,
};
