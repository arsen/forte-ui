"use client";

import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { clsx } from "clsx";
import styles from "./Toggle.module.css";

export type ToggleVariant = "solid" | "soft" | "outline";
export type ToggleTone = "primary" | "secondary" | "danger" | "neutral";
export type ToggleSize = "sm" | "md" | "lg";
export type ToggleGroupOrientation = "horizontal" | "vertical";

/* -------------------------------------------------------------------------
 * Shared appearance
 *
 * A group exists to make its toggles look like one control, so `variant`,
 * `tone` and `size` set on the group flow down to every toggle inside it.
 *
 * This has to be React context rather than CSS inheritance. The appearance
 * knobs are declared on each toggle's OWN root rule — that placement is what
 * lets a consumer re-skin a single toggle, because an element's own
 * declaration beats an inherited one — which means a value set on the group
 * would be inherited and then immediately overwritten. The `data-*` attributes
 * the rules key off have to be resolved in JS and written onto each toggle.
 *
 * Undefined rather than absent is the signal: a toggle's own prop wins, then
 * the group's, then the component default. `?? ` and not `||`, so a group can
 * be given values the CSS treats as meaningful without them being swallowed.
 * ---------------------------------------------------------------------- */

interface ToggleAppearance {
  variant: ToggleVariant | undefined;
  tone: ToggleTone | undefined;
  size: ToggleSize | undefined;
}

const ToggleAppearanceContext = React.createContext<ToggleAppearance | null>(null);

/* -------------------------------------------------------------------------
 * Toggle
 * ---------------------------------------------------------------------- */

export interface ToggleProps<Value extends string = string>
  extends Omit<BaseToggle.Props<Value>, "className"> {
  /**
   * How loud the *pressed* state is. Unpressed is quiet in every variant —
   * that is what makes a toggle read as off — so the variant only decides what
   * "on" looks like: `solid` fills with the tone, `soft` tints with it,
   * `outline` tints and keeps a border that is also drawn while unpressed.
   *
   * There is deliberately no `ghost`: every variant is already chromeless at
   * rest, so a ghost toggle would differ from `soft` in nothing but its
   * pressed fill — and dropping that fill would leave hue as the only cue
   * separating on from off.
   *
   * Inherited from an enclosing `ToggleGroup` when left unset.
   * @default "soft"
   */
  variant?: ToggleVariant;
  /**
   * Which semantic colour set the pressed state draws from. Combines freely
   * with `variant`. Inherited from an enclosing `ToggleGroup` when left unset.
   * @default "primary"
   */
  tone?: ToggleTone;
  /**
   * Size of the button. Matches `Button` step for step so the two line up in
   * one toolbar. Inherited from an enclosing `ToggleGroup` when left unset.
   * @default "md"
   */
  size?: ToggleSize;
  /**
   * Render as a square button sized for a single icon, holding the 24×24
   * minimum hit target from WCAG SC 2.5.8. Always pair with `aria-label` —
   * an icon is not an accessible name.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * A unique string identifying this toggle within a `ToggleGroup`. Required
   * inside a group — the group's value is the list of pressed toggles' values,
   * so a toggle without one can never appear in it. Ignored outside a group,
   * where `pressed` / `defaultPressed` carry the state instead.
   */
  value?: Value;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the button element. Declared as a prop rather than through
   * `forwardRef` because the component is generic — a `forwardRef` wrapper
   * would erase `Value` and with it the inference on `value`.
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * A two-state button that is either on or off, built on Base UI's unstyled
 * `Toggle` primitive. Renders a `<button>` with `aria-pressed`.
 *
 * Reach for it when the button *is* the state — bold, mute, pin, favourite —
 * and the effect is immediate and local. If the state is a setting the user
 * confirms later, use [`Switch`](/components/switch) or
 * [`Checkbox`](/components/checkbox), which carry a label and a form value; a
 * toggle button has neither.
 *
 * State is exposed on `data-*` attributes (`data-pressed`, `data-disabled`)
 * and every visual decision is a `--pui-toggle-*` custom property, so it can
 * be re-skinned from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[pressed]:...`) without wrapping.
 */
export function Toggle<Value extends string = string>({
  variant,
  tone,
  size,
  iconOnly = false,
  className,
  ...props
}: ToggleProps<Value>): React.JSX.Element {
  const group = React.useContext(ToggleAppearanceContext);

  return (
    <BaseToggle
      className={clsx(styles.root, "pui-focus-ring", className)}
      data-pui="toggle"
      data-variant={variant ?? group?.variant ?? "soft"}
      data-tone={tone ?? group?.tone ?? "primary"}
      data-size={size ?? group?.size ?? "md"}
      data-icon-only={iconOnly || undefined}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------
 * ToggleGroup
 * ---------------------------------------------------------------------- */

export interface ToggleGroupProps<Value extends string = string>
  extends Omit<BaseToggleGroup.Props<Value>, "className"> {
  /**
   * Default `variant` for every `Toggle` inside the group. A toggle's own
   * `variant` still wins.
   * @default "soft"
   */
  variant?: ToggleVariant;
  /**
   * Default `tone` for every `Toggle` inside the group. A toggle's own `tone`
   * still wins.
   * @default "primary"
   */
  tone?: ToggleTone;
  /**
   * Default `size` for every `Toggle` inside the group. A toggle's own `size`
   * still wins.
   * @default "md"
   */
  size?: ToggleSize;
  /**
   * Draw the group as a segmented control: one padded panel behind the whole
   * set, with the toggles closed up inside it. Off, the group is just a row of
   * separate buttons — right for a toolbar, where the toggles are neighbours
   * rather than alternatives.
   *
   * Pair it with `variant="solid"` for the classic filled segmented control.
   * @default false
   */
  segmented?: boolean;
  /**
   * Stretch the group to fill its container and share the space equally
   * between the toggles. Mostly useful with `segmented`, where an evenly
   * divided strip is the expected shape.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Direction the toggles are laid out in, and the axis the arrow keys move
   * along. Unlike `RadioGroup`'s, this is not layout-only: Base UI binds the
   * arrows to the named axis, so a vertical group answers to Up and Down and
   * leaves Left and Right to the page.
   * @default "horizontal"
   */
  orientation?: ToggleGroupOrientation;
  /**
   * The values of every pressed toggle. Pairs with `onValueChange` for a
   * controlled group; use `defaultValue` for an uncontrolled one. Always an
   * array, including when `multiple` is false — it is then empty or holds one
   * value.
   */
  value?: readonly Value[];
  /**
   * The values pressed on mount when uncontrolled.
   */
  defaultValue?: readonly Value[];
  /**
   * Allow several toggles to be pressed at once. With it off, pressing one
   * unpresses the rest — but pressing the pressed one still turns it off, so
   * "nothing selected" stays reachable in a way a radio group never allows.
   * @default false
   */
  multiple?: boolean;
  /**
   * Disable every toggle in the group.
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Ref to the group element. Declared as a prop rather than through
   * `forwardRef` because the component is generic — a `forwardRef` wrapper
   * would erase `Value` and with it the typing of `onValueChange`.
   */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Shared state for a series of `Toggle`s, built on Base UI's `ToggleGroup`
 * primitive. Renders a `<div role="group">`.
 *
 * Like `RadioGroup` this is a keyboard mode as well as a state container: the
 * whole group is one tab stop and the arrow keys move between toggles. Unlike
 * a radio group, moving does **not** select — arrowing past a toggle leaves it
 * untouched, and Space or Enter is what presses it. That makes a toggle group
 * safe for choices a radio group is not, including ones that fire a request.
 *
 * The group has no implicit accessible name. `role="group"` is not a labelable
 * element, so give it `aria-label` or point `aria-labelledby` at your own
 * heading.
 */
export function ToggleGroup<Value extends string = string>({
  variant,
  tone,
  size,
  segmented = false,
  fullWidth = false,
  className,
  ...props
}: ToggleGroupProps<Value>): React.JSX.Element {
  // Memoised on the three values rather than rebuilt each render, so a group
  // whose appearance has not changed does not re-render every toggle under it
  // on an unrelated parent update.
  const appearance = React.useMemo<ToggleAppearance>(
    () => ({ variant, tone, size }),
    [variant, tone, size],
  );

  return (
    <ToggleAppearanceContext.Provider value={appearance}>
      <BaseToggleGroup
        className={clsx(styles.group, className)}
        data-pui="toggle-group"
        data-segmented={segmented || undefined}
        data-full-width={fullWidth || undefined}
        {...props}
      />
    </ToggleAppearanceContext.Provider>
  );
}
