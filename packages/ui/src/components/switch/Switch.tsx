"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { clsx } from "clsx";
import styles from "./Switch.module.css";

export type SwitchSize = "sm" | "md" | "lg";

type BaseSwitchRootProps = React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>;

export interface SwitchProps
  extends Omit<BaseSwitchRootProps, "className" | "children"> {
  /**
   * Size of the switch. Track, thumb and travel distance all scale together,
   * so the thumb always lands flush against the end of the track.
   * @default "md"
   */
  size?: SwitchSize;
  /**
   * Draw a checkmark inside the thumb while the switch is on.
   *
   * This is the switch's non-positional state cue, and it is why the default
   * is `true`: a user who cannot perceive the thumb sliding still gets a
   * glyph appearing. Turning it off leaves colour as the only cue that does
   * not depend on noticing movement.
   * @default true
   */
  stateIcon?: boolean;
  /**
   * Whether the rendered element is a native `<button>`. Base UI defaults
   * this to `false` here — the opposite of trigger-style parts — because the
   * root renders a `<span>` so that an enclosing `<label>` stays valid HTML.
   *
   * Set it (together with `render={<button />}`) for the sibling-label
   * `htmlFor`/`id` pattern. Note that it also moves `id`: with `nativeButton`
   * the `id` lands on the root element, otherwise on the hidden input.
   * @default false
   */
  nativeButton?: boolean | undefined;
  /**
   * The id of the hidden `<input>` element — or of the root element when
   * `nativeButton` is `true`. Point a sibling `<label htmlFor>` at whichever
   * of the two your `nativeButton` setting produces.
   */
  id?: string | undefined;
  /**
   * Additional class name(s) for the track. Applied after the internal styles
   * so consumer utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /**
   * Additional class name(s) for the thumb, for the same reason.
   */
  thumbClassName?: string;
}

/**
 * A switch built on Base UI's unstyled `Switch` primitive.
 *
 * Labeling — a switch has no text of its own, so it needs one of:
 *
 * ```tsx
 * // Simplest correct pattern: an enclosing label.
 * <label><Switch /> Notifications</label>
 *
 * // Sibling label. Needs a native button so htmlFor/id resolve; with
 * // nativeButton the id lands on the root rather than the hidden input.
 * <label htmlFor="notify">Notifications</label>
 * <Switch id="notify" nativeButton render={<button />} />
 *
 * // A native button INSIDE a wrapping label needs the render callback, so
 * // the hidden input is placed outside the label and the HTML stays valid.
 * <Switch
 *   nativeButton
 *   render={(buttonProps) => (
 *     <label><button {...buttonProps} /> Notifications</label>
 *   )}
 * />
 * ```
 *
 * Motion — the thumb's position *is* the state, not decoration, so its travel
 * is never multiplied by `--pui-motion-ok`. Under reduced motion the thumb
 * still moves; only the spring flattens, because the duration token it rides
 * on shortens. The track colour, the thumb colour and the checkmark change
 * alongside it so state never rests on movement alone.
 */
export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(
  { size = "md", stateIcon = true, className, thumbClassName, ...props },
  ref,
) {
  return (
    <BaseSwitch.Root
      ref={ref}
      // `pui-target` grows the hit area to the SC 2.5.8 minimum without
      // changing the painted track, which is only 20px tall at `md`.
      className={clsx(styles.root, "pui-focus-ring", "pui-target", className)}
      data-pui="switch"
      data-size={size}
      {...props}
    >
      <BaseSwitch.Thumb className={clsx(styles.thumb, thumbClassName)} data-pui="switch-thumb">
        {stateIcon ? (
          // Decorative: the checked state already reaches assistive tech
          // through the root's role="switch" + aria-checked.
          <svg
            className={clsx(styles.icon, "pui-icon")}
            data-pui="switch-icon"
            viewBox="0 0 12 12"
            aria-hidden="true"
            focusable="false"
          >
            {/* `stroke="currentColor"` rather than a class, so forced-colors
             * follows the thumb's forced `color` instead of painting a
             * system-coloured block. `fill="none"` is a presentation
             * attribute and still beats the inherited fill from
             * `.pui-icon`. */}
            <path
              d="M2.6 6.3 4.9 8.6 9.4 3.7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </BaseSwitch.Thumb>
    </BaseSwitch.Root>
  );
});
