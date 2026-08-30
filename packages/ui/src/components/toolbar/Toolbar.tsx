"use client";

import * as React from "react";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { Button, type ButtonSize, type ButtonTone, type ButtonVariant } from "../button";
import { Input, type InputVariant } from "../input";
import styles from "./Toolbar.module.css";

export type ToolbarOrientation = "horizontal" | "vertical";
export type ToolbarVariant = "plain" | "panel" | "outline";
export type ToolbarSize = "sm" | "md" | "lg";

/* -------------------------------------------------------------------------
 * Shared size
 *
 * A bar whose controls are three different heights does not read as a bar, so
 * `size` set on the root becomes the default for every `Toolbar.Button`,
 * `Toolbar.Input` and `Toolbar.Link` inside it.
 *
 * React context and not CSS inheritance, for the same reason `ToggleGroup`
 * uses context: the size knobs are declared on each control's OWN root rule —
 * which is what lets a consumer re-skin one control, since an element's own
 * declaration beats an inherited one — so a value set on the bar would be
 * inherited and then immediately overwritten. The `data-size` attribute the
 * rules key off has to be resolved in JS and written onto each item.
 *
 * `??` and not `||`: an item's own prop wins, then the bar's, then the
 * component default.
 * ---------------------------------------------------------------------- */

const ToolbarSizeContext = React.createContext<ToolbarSize | undefined>(undefined);

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ToolbarRootProps extends Omit<BaseToolbar.Root.Props, "className"> {
  /**
   * How much chrome the bar itself carries. `plain` is a bare row with no
   * surface — right when the toolbar sits on a panel that already has one.
   * `panel` fills; `outline` draws a border on the page background.
   *
   * It says nothing about the controls inside: a `plain` bar can still hold
   * solid buttons, and a `panel` bar quiet ones.
   * @default "panel"
   */
  variant?: ToolbarVariant;
  /**
   * Size of the bar, and the default size of every `Toolbar.Button`,
   * `Toolbar.Input` and `Toolbar.Link` inside it. An item's own `size` still
   * wins.
   * @default "md"
   */
  size?: ToolbarSize;
  /**
   * Direction the items are laid out in, and the axis the arrow keys move
   * along. This is not layout only: Base UI binds the arrows to the named
   * axis, so a vertical toolbar answers to Up and Down and leaves Left and
   * Right to the page — and to any text input inside it.
   * @default "horizontal"
   */
  orientation?: ToolbarOrientation;
  /**
   * Let the items wrap onto more than one line when the bar runs out of room,
   * instead of overflowing it. Roving focus follows DOM order either way, so
   * wrapping costs the keyboard nothing.
   *
   * Ignored while `orientation="vertical"`.
   * @default false
   */
  wrap?: boolean;
  /**
   * Disable every item in the toolbar. Items stay focusable — see the note on
   * `Toolbar.Button`'s `focusableWhenDisabled`.
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A strip of related controls that behaves as one tab stop, built on Base UI's
 * `Toolbar` primitive. Renders a `<div role="toolbar">`.
 *
 * ```tsx
 * <Toolbar.Root aria-label="Formatting">
 *   <Toolbar.Button iconOnly aria-label="Undo">…</Toolbar.Button>
 *   <Toolbar.Separator />
 *   <Toolbar.Button>Publish</Toolbar.Button>
 * </Toolbar.Root>
 * ```
 *
 * The point of the component is the keyboard contract, not the row: Tab moves
 * *past* the whole bar in one press and the arrow keys move between its
 * controls. That is what stops a nine-button formatting bar from costing nine
 * presses to skip.
 *
 * The bar has no accessible name of its own — `role="toolbar"` is not a
 * labelable element — so give it `aria-label`, or point `aria-labelledby` at
 * your own heading.
 */
export const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarRootProps>(
  function ToolbarRoot(
    {
      variant = "panel",
      size = "md",
      orientation = "horizontal",
      wrap = false,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <ToolbarSizeContext.Provider value={size}>
        <BaseToolbar.Root
          ref={ref}
          orientation={orientation}
          className={clsx(styles.root, className)}
          data-forte="toolbar"
          data-variant={variant}
          data-size={size}
          data-wrap={wrap || undefined}
          {...props}
        />
      </ToolbarSizeContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

export interface ToolbarGroupProps extends Omit<BaseToolbar.Group.Props, "className"> {
  /**
   * Disable every item in the group. Composes with the root's `disabled` —
   * either one being true disables the item.
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A cluster of related items inside a toolbar. Renders a `<div role="group">`.
 *
 * It is a *visual and semantic* grouping, not a keyboard one: the arrow keys
 * still run the length of the whole bar, and a group is what tells a reader
 * (and a screen reader) that these three buttons answer the same question. The
 * gap inside a group is tighter than the gap between them, which is the whole
 * of the visual difference.
 *
 * Like the root it takes no implicit name — give it `aria-label` when the
 * grouping is not obvious from the items themselves.
 */
export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  function ToolbarGroup({ className, ...props }, ref) {
    return (
      <BaseToolbar.Group
        ref={ref}
        className={clsx(styles.group, className)}
        data-forte="toolbar-group"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Button
 * ---------------------------------------------------------------------- */

export interface ToolbarButtonProps
  extends Omit<BaseToolbar.Button.Props, "className" | "render"> {
  /**
   * How much visual weight the button carries. Defaults to `ghost` rather than
   * `Button`'s `solid`: a toolbar is a strip of peers, and a row of solid
   * buttons has no hierarchy left to spend on the one that matters. Give the
   * primary action `variant="solid"` explicitly.
   *
   * Ignored when `render` is set — the rendered component brings its own
   * styling.
   * @default "ghost"
   */
  variant?: ButtonVariant;
  /**
   * Which semantic colour set the button draws from. `neutral` by default, for
   * the same reason `variant` is `ghost`.
   *
   * Ignored when `render` is set.
   * @default "neutral"
   */
  tone?: ButtonTone;
  /**
   * Size of the button. Inherited from `Toolbar.Root` when left unset.
   *
   * Ignored when `render` is set.
   * @default the root's `size`
   */
  size?: ButtonSize;
  /**
   * Render as a square button sized for a single icon, holding the 24×24
   * minimum hit target from WCAG SC 2.5.8. Always pair with `aria-label` —
   * an icon is not an accessible name.
   *
   * Ignored when `render` is set.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Show a busy indicator and block interaction.
   *
   * Ignored when `render` is set.
   * @default false
   */
  loading?: boolean;
  /**
   * Announced to assistive technology while `loading` is true.
   *
   * Ignored when `render` is set.
   * @default "Loading"
   */
  loadingLabel?: string;
  /**
   * Keep the item focusable while it is disabled, rather than removing it from
   * the bar's roving focus.
   *
   * `true` by default, and that default is the ARIA authoring practice for a
   * toolbar rather than a stylistic choice: a disabled control that vanishes
   * from the arrow-key order silently changes what every other key press does,
   * and the user has no way to find out *why* an action they expected is
   * missing. Focusable-and-disabled keeps it announced, with its disabled
   * state, in the position they expect it.
   * @default true
   */
  focusableWhenDisabled?: boolean;
  /**
   * Replaces the rendered button with another element or component. This is
   * how a menu, a select, a dialog or a toggle joins the bar's keyboard
   * order — `render={<Toggle iconOnly />}`,
   * `render={<Select.Trigger />}`.
   *
   * The default `Button` styling steps aside when this is present, so the two
   * never fight over the cascade; the rendered component keeps its own look.
   */
  render?: BaseToolbar.Button.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that is part of the toolbar's roving focus. Renders a `<button>`.
 *
 * Left alone it is a [`Button`](/components/button) — every variant, tone and
 * size, and the same `iconOnly` and `loading` behaviour — that happens to be
 * reachable with the arrow keys. Given `render`, it is whatever you passed,
 * still reachable with the arrow keys and nothing else changed.
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      variant = "ghost",
      tone = "neutral",
      size,
      iconOnly = false,
      loading = false,
      loadingLabel,
      focusableWhenDisabled = true,
      render,
      className,
      ...props
    },
    ref,
  ) {
    const toolbarSize = React.useContext(ToolbarSizeContext);

    return (
      <BaseToolbar.Button
        ref={ref}
        className={className}
        focusableWhenDisabled={focusableWhenDisabled}
        // No `data-forte` here, per the composed-component rule: whatever ends up
        // rendered tags its own root, and a consumer scopes with a descendant
        // selector (`[data-forte="toolbar"] [data-forte="button"]`).
        render={
          render ?? (
            <Button
              variant={variant}
              tone={tone}
              size={size ?? toolbarSize ?? "md"}
              iconOnly={iconOnly}
              loading={loading}
              loadingLabel={loadingLabel}
              // Restated on the Button, and it has to be. Base UI's toolbar
              // button forwards only `disabled` to a render prop, so without
              // this the Button would fall back to its own default of
              // `focusableWhenDisabled: false`, set the NATIVE disabled
              // attribute, and drop straight out of the roving order the
              // toolbar just registered it in.
              focusableWhenDisabled={focusableWhenDisabled}
            />
          )
        }
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Link
 * ---------------------------------------------------------------------- */

export interface ToolbarLinkProps extends Omit<BaseToolbar.Link.Props, "className"> {
  /**
   * Size of the link, matching the controls beside it. Inherited from
   * `Toolbar.Root` when left unset.
   * @default the root's `size`
   */
  size?: ToolbarSize;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A link that is part of the toolbar's roving focus. Renders an `<a>`.
 *
 * It is drawn as a link and not as a button on purpose: it navigates, and the
 * underline is the only cue that says so before it is clicked. A link cannot
 * be disabled — HTML has no such state for `<a>` — so it always holds its
 * place in the arrow-key order, even inside a `disabled` toolbar.
 *
 * Use `render` for a router link: `render={<Link href="/docs" />}`.
 */
export const ToolbarLink = React.forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  function ToolbarLink({ size, className, ...props }, ref) {
    const toolbarSize = React.useContext(ToolbarSizeContext);

    return (
      <BaseToolbar.Link
        ref={ref}
        className={clsx(styles.link, "forte-focus-ring", "forte-link", className)}
        data-forte="toolbar-link"
        data-size={size ?? toolbarSize ?? "md"}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

export interface ToolbarInputProps
  extends Omit<BaseToolbar.Input.Props, "className" | "render" | "size"> {
  /**
   * Size of the control. Inherited from `Toolbar.Root` when left unset.
   *
   * This shadows the native `size` attribute, exactly as `Input`'s does.
   *
   * Ignored when `render` is set.
   * @default the root's `size`
   */
  size?: ToolbarSize;
  /**
   * How much visual weight the control carries.
   *
   * Ignored when `render` is set.
   * @default "outline"
   */
  variant?: InputVariant;
  /**
   * Stretch the input to fill the space left over in the bar.
   *
   * Ignored when `render` is set.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Replaces the rendered input with another element or component. The default
   * `Input` styling steps aside when this is present.
   */
  render?: BaseToolbar.Input.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A text input that is part of the toolbar's roving focus. Renders an
 * `<input>`.
 *
 * The arrow keys do the right thing without configuration: while the caret has
 * somewhere left to go inside the field, Left and Right move the caret; at
 * either end they hand the key back to the toolbar and focus moves on. Home
 * and End are never taken — a toolbar does not bind them — so they jump the
 * caret as they would in any field. That is Base UI's own handling, and it is
 * the reason to reach for this rather than dropping a bare `Input` into the
 * bar — a bare one is not in the roving order at all, so Tab is the only way
 * past it.
 */
export const ToolbarInput = React.forwardRef<HTMLInputElement, ToolbarInputProps>(
  function ToolbarInput(
    { size, variant = "outline", fullWidth = false, render, className, ...props },
    ref,
  ) {
    const toolbarSize = React.useContext(ToolbarSizeContext);

    return (
      <BaseToolbar.Input
        ref={ref}
        className={className}
        render={
          render ?? (
            <Input
              size={size ?? toolbarSize ?? "md"}
              variant={variant}
              fullWidth={fullWidth}
            />
          )
        }
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Separator
 * ---------------------------------------------------------------------- */

export interface ToolbarSeparatorProps
  extends Omit<BaseToolbar.Separator.Props, "className"> {
  /**
   * Which way the rule runs. Defaults to the *opposite* of the toolbar's
   * orientation — a horizontal bar gets vertical rules — which is almost
   * always what you want, so leave it unset.
   */
  orientation?: ToolbarOrientation;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A rule between two clusters of toolbar items. Renders a
 * `<div role="separator">`.
 *
 * It is a divider, not a stop: the arrow keys pass straight over it, since it
 * is not a composite item. Reach for it between groups that answer different
 * questions — formatting and alignment, say — and let the group gap carry the
 * rest.
 *
 * This is a separate part from [`Separator`](/components/separator) rather than
 * a use of it, for two reasons: Base UI derives the orientation from the
 * toolbar's own, and a rule inside a bar insets from the bar's padding instead
 * of spanning it edge to edge.
 */
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  function ToolbarSeparator({ className, ...props }, ref) {
    return (
      <BaseToolbar.Separator
        ref={ref}
        className={clsx(styles.separator, className)}
        data-forte="toolbar-separator"
        {...props}
      />
    );
  },
);

/* ---------------------------------------------------------------------- */

/**
 * A strip of related controls that behaves as one tab stop, built on Base UI's
 * `Toolbar` primitive.
 *
 * ```tsx
 * <Toolbar.Root aria-label="Formatting">
 *   <ToggleGroup aria-label="Style">
 *     <Toggle iconOnly value="bold" aria-label="Bold">…</Toggle>
 *   </ToggleGroup>
 *   <Toolbar.Separator />
 *   <Toolbar.Button>Publish</Toolbar.Button>
 * </Toolbar.Root>
 * ```
 *
 * Tab moves past the whole bar in one press; the arrow keys move between its
 * controls. Styling is driven by `data-*` attributes and `--forte-toolbar-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=outline]:...`) without wrapping.
 */
export const Toolbar = {
  Root: ToolbarRoot,
  Group: ToolbarGroup,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Input: ToolbarInput,
  Separator: ToolbarSeparator,
};
