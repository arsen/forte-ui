"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import styles from "./Textarea.module.css";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaVariant = "outline" | "soft" | "ghost";
export type TextareaResize = "vertical" | "none" | "both";

type BaseControlProps = React.ComponentPropsWithoutRef<typeof BaseField.Control>;

type TextareaElementProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "className"
>;

export interface TextareaProps extends TextareaElementProps {
  /**
   * Size of the control. Inline padding, block padding and font size move
   * together, and the numbers come from the same `--pui-control-*` tokens
   * `Input` and `Select.Trigger` read — so a textarea stacked under an input
   * shares its optical inset at every `data-pui-density` setting.
   *
   * A `<textarea>` has no native `size` attribute, so unlike `Input` this
   * shadows nothing.
   * @default "md"
   */
  size?: TextareaSize;
  /**
   * How much visual weight the control carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance — the
   * same three `Input` has.
   * @default "outline"
   */
  variant?: TextareaVariant;
  /**
   * The number of rows the box is at its shortest. Sets the native `rows`
   * attribute and the floor the control can never shrink below — including
   * under `autoResize`, and including a drag on the resize handle.
   * @default 3
   */
  rows?: number;
  /**
   * The number of rows the box may grow to before it starts scrolling
   * instead. Only a ceiling: a textarea shorter than this is unaffected.
   * Unset means no ceiling.
   */
  maxRows?: number;
  /**
   * Grow with the content as the user types, between `rows` and `maxRows`.
   *
   * Implemented with the CSS `field-sizing` property where the browser has it,
   * so there is no measurement, no reflow per keystroke and no inline height
   * on the element. Older engines fall back to a resize observer and a
   * `scrollHeight` read, which behaves identically and costs a layout per
   * change.
   *
   * Forces `resize` to `"none"`: a handle whose value the next keystroke
   * overwrites is not a control.
   * @default false
   */
  autoResize?: boolean;
  /**
   * Which axes the user may drag the control along. `vertical` is the default
   * because `both` lets the box escape the column it sits in — legitimate for
   * a full-width composer, wrong for a field in a form.
   * @default "vertical"
   */
  resize?: TextareaResize;
  /**
   * Stretch the control to fill the width of its container. Only needed
   * outside a `Field.Root` — a field is a flex column, so a textarea inside
   * one already stretches.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
  /** Replace the rendered element. Defaults to a `<textarea>`. */
  render?: BaseControlProps["render"];
  /** Callback fired when the value changes. Use when controlled. */
  onValueChange?: BaseControlProps["onValueChange"];
}

/**
 * `useLayoutEffect` warns when React renders it on the server, and every page
 * that server-renders a form would print it. The usual shim: the layout timing
 * only exists in a browser, so ask for it only there.
 */
const useIsoLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * The `autoResize` fallback for engines without `field-sizing` — Chrome landed
 * it in 123, Firefox in 152 and Safari in 26.2, which still leaves a real
 * share of users on a textarea that would silently not grow.
 *
 * Deliberately a no-op where the property IS supported: one CSS declaration
 * does the whole job during layout, and an inline `block-size` written on top
 * of it would fight the stylesheet's own min/max clamps.
 */
function useAutoSize(enabled: boolean) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  const syncRef = React.useRef<() => void>(() => {});

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled || CSS.supports?.("field-sizing", "content")) {
      return;
    }

    const sync = () => {
      // `scrollHeight` is content + padding and stops at the border, but the
      // box is `border-box` — so without adding the border back the control
      // loses two pixels of height on every keystroke until the text clips.
      const border = el.offsetHeight - el.clientHeight;
      // Shrinking needs the reset: `scrollHeight` can never report less than
      // the current height, so a textarea that has grown can only ever grow.
      el.style.blockSize = "auto";
      el.style.blockSize = `${el.scrollHeight + border}px`;
    };

    syncRef.current = sync;
    sync();
    el.addEventListener("input", sync);

    // Re-wrapping at a new width changes the line count without firing an
    // `input` event, so a box that grew on a narrow screen would stay tall
    // when the column widens. Only the INLINE size is a reason to re-measure —
    // reacting to the block size we just set ourselves would loop.
    let inlineSize = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === inlineSize) {
        return;
      }
      inlineSize = el.clientWidth;
      sync();
    });
    observer.observe(el);

    return () => {
      syncRef.current = () => {};
      el.removeEventListener("input", sync);
      observer.disconnect();
      el.style.blockSize = "";
    };
  }, [enabled]);

  // A controlled value replaced from outside — a draft restored, a form reset,
  // a template inserted — changes the content without an `input` event. No
  // dependency array on purpose: the check is one layout read, which is what
  // the listener above costs anyway.
  useIsoLayoutEffect(() => {
    syncRef.current();
  });

  return ref;
}

/**
 * A multi-line text control.
 *
 * Base UI has no textarea primitive, so this is built on `Field.Control` — the
 * same component `Input` is — rendered as a `<textarea>`. That is what makes it
 * participate in a `Field` with no wiring: drop one inside a `Field.Root` and
 * it picks up the label, the description, the error message, the `name` used on
 * submit, and the validity attributes.
 *
 * ```tsx
 * <Field.Root name="bio">
 *   <Field.Label>Bio</Field.Label>
 *   <Textarea rows={4} placeholder="Tell us about yourself" />
 *   <Field.Error />
 * </Field.Root>
 * ```
 *
 * Height is expressed in rows rather than pixels — `rows` is the floor,
 * `maxRows` the ceiling, and `autoResize` moves between them as the user types.
 *
 * State is exposed on `data-*` (`data-disabled`, `data-invalid`, `data-valid`,
 * `data-dirty`, `data-touched`, `data-filled`, `data-focused`) and every visual
 * decision is a `--pui-textarea-*` custom property, so it can be re-skinned
 * from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[invalid]:...`) without wrapping.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      size = "md",
      variant = "outline",
      rows = 3,
      maxRows,
      autoResize = false,
      resize = "vertical",
      fullWidth = false,
      render,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const autoSizeRef = useAutoSize(autoResize);

    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        autoSizeRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref, autoSizeRef],
    );

    const controlProps = {
      ref: setRef,
      render: render ?? <textarea />,
      // No `pui-target`: the SC 2.5.8 floor is about pointer targets under
      // 24px, and the shortest textarea this component can produce is three
      // rows tall.
      className: clsx(styles.root, "pui-focus-ring", className),
      "data-pui": "textarea",
      "data-size": size,
      "data-variant": variant,
      // A drag handle whose height the next keystroke overwrites is broken, so
      // `autoResize` decides this rather than merely competing with it. The
      // attribute carries the EFFECTIVE value so what is in the DOM is true.
      "data-resize": autoResize ? "none" : resize,
      "data-auto-resize": autoResize || undefined,
      "data-full-width": fullWidth || undefined,
      rows,
      style: {
        // Row counts reach CSS as custom properties because the height they
        // describe is `calc(rows * 1lh + padding + border)` — a value only the
        // stylesheet knows the other terms of. The native `rows` attribute
        // above still sets the same height on its own; this is what keeps the
        // floor in place once `field-sizing: content` starts ignoring it.
        "--pui-textarea-rows": String(rows),
        ...(maxRows != null ? { "--pui-textarea-max-rows": String(maxRows) } : null),
        // Consumer last, per the same rule that puts `className` last.
        ...style,
      } as React.CSSProperties,
      ...props,
    };

    // `Field.Control` is typed for the `<input>` it renders by default. The
    // element swap is the whole point of this component, so the props bag is
    // typed as a textarea's and re-typed once, here, at the boundary.
    return <BaseField.Control {...(controlProps as unknown as BaseControlProps)} />;
  },
);
