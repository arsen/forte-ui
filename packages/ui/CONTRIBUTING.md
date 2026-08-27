# Contributing to pretty-ui

Conventions every component must follow. They are not style preferences — each
one exists because breaking it causes a specific, usually silent, bug.

## Anatomy of a component

```
src/components/<name>/
  <Name>.tsx          "use client" wrapper around the Base UI primitive
  <Name>.module.css   styles, inside @layer pretty-ui.components
  index.ts            re-exports the component and its types
```

Register the component in `src/index.ts`. Every file that renders is
`"use client"` — Base UI primitives use context and refs.

## The rules

**1. Consume tokens; never hardcode a value.** No hex colours, no `px`
durations, no literal radii. If a value is missing from the inventory below,
add it to `scripts/ramp.mjs` or `scripts/motion.mjs` and regenerate — do not
inline it. Component-level knobs are exposed as `--pui-<component>-*` custom
properties declared at the top of the root rule, defaulting to semantic tokens,
so a consumer can re-skin without forking. Give every knob a `/** … */` doc
comment directly above its declaration — `scripts/theming-docgen.mjs` publishes
it, together with the declared default, as the component's Theming table in the
docs (`docs-data/theming.json`), exactly the way JSDoc on a prop becomes the
prop table. A knob without one is invisible there; plain `/* … */` comments
stay private.

**2. Never write `@media (prefers-reduced-motion)` in a component file.** The
motion tokens already collapse their own geometry: `--pui-travel-md` becomes
`0px` and `--pui-scale-enter` becomes `1`. A component that consumes them gets
correct behaviour without knowing reduced motion exists. Writing the query
locally also tends to produce a hard `transition: none`, which removes the
opacity fade that reduced-motion users actually benefit from.

**3. Animate with transitions, not keyframes, for enter/exit.** Use Base UI's
`[data-starting-style]` and `[data-ending-style]`. A transition can be
cancelled mid-flight, so closing a dialog while it is still opening reverses
smoothly instead of snapping. Keyframe animations cannot do this.

**4. Never put an `infinite` animation on a Popup or Positioner part.** Base UI
awaits `Promise.all(element.getAnimations().map(a => a.finished))` to decide
when a popup may unmount. An infinite animation's promise never settles, so the
popup stays in the DOM permanently. `getAnimations()` is not called with
`subtree: true`, so descendants are safe — put spinners on an inner child.

**5. Focusable parts get `.pui-focus-ring`.** Add `data-focus-inset` when the
part sits inside a clipping container (list rows, tab strips, select items),
which flips the ring inward so `overflow: hidden` cannot crop it.

Where the element that HOLDS focus is not the element that should look focused —
Slider's and ColorPicker's thumbs over their hidden inputs, NumberField's group
over its text field — the wrapper takes `.pui-focus-ring-within` instead. That
class already suppresses the UA ring on the descendant it rings for, so do not
restate `outline: none` in the component. It does not suppress a nested part
that rings itself, which is how NumberField's steppers keep their own.

Both are still beaten by an app-level global `:focus-visible` rule, since every
`pretty-ui` layer loses to an app's own CSS by design. That is only visible on
the `-within` components, where it draws a second ring on the inner control; the
fix belongs in the app, and `apps/docs/app/globals.css` carries the worked
example.

**5b. Forced-colors rules go in `@layer pretty-ui.a11y`, not in your component
layer.** Layer order outranks specificity entirely, and `a11y` is ordered after
`components`. A forced-colors fix written inside your `@layer
pretty-ui.components` block competes with your own ordinary rules on
specificity and usually loses — most visibly with `opacity`, which forced-colors
does not override, so `[data-disabled] { opacity: 0.55 }` survives and a
disabled control keeps full system-colour contrast. Close the components layer
and open a second block:

```css
@layer pretty-ui.components { /* ... normal styles ... */ }

@layer pretty-ui.a11y {
  @media (forced-colors: active) {
    .root[data-disabled] { opacity: 1; color: GrayText; border-color: GrayText; }
  }
}
```

**6. Floating surfaces get `.pui-hc-surface`.** It carries a transparent border
that is invisible normally but becomes a system-coloured boundary in forced-
colors mode, where all shadows are stripped and an unbordered popup would
otherwise dissolve into the page.

**6b. Inside a `.module.css`, a `.pui-*` selector is LOCAL, not global.** CSS
Modules hashes every bare class selector, so a rule written as
`.pui-icon { ... }` compiles to `._pui-icon_a1b2c3` and matches nothing —
silently. Components apply these pattern classes as plain strings, so they stay
unhashed in the DOM. To target one from a module, wrap it: `:global(.pui-icon)`.
Better still, target the element (`svg`) or rely on `currentColor`.

**7. `className` goes last.** `clsx(styles.root, "pui-focus-ring", className)`
— consumer classes must be able to win without `!important`.

**8. State goes on `data-*` attributes, not in class names.** `data-variant`,
`data-size`, `data-tone`. This is what lets consumers target states from plain
CSS or Tailwind arbitrary variants without wrapping the component.

**9. Every rendered element carries `data-pui="<component>"` (root) or
`data-pui="<component>-<part>"`,** the part name being the kebab-cased style
key. The hashed CSS Modules class names change between releases, so this
marker is the only selector a consumer can write against a part and keep — it
is public API, and renaming one is a breaking change. Place it right after
`className` and before any `{...props}` spread, so a caller can override it.
Two exceptions: SVG descendants of a tagged element get nothing (target them
through the svg), and a composed pretty-ui component is never handed a marker
by its host — it tags its own root, and consumers scope with a descendant
selector (`[data-pui="button"] [data-pui="spinner"]`).

**10. Decorative SVG gets `aria-hidden="true"`,** and anything conveying state
to assistive technology goes in a `.pui-visually-hidden` span.

## Available pattern classes

`.pui-focus-ring` · `.pui-focus-ring-within` · `.pui-hc-surface` ·
`.pui-visually-hidden` · `.pui-target` · `.pui-scrim` · `.pui-icon` ·
`.pui-link` · `.pui-hc-decorative` · `.pui-preserve-color`

## Verifying

```bash
pnpm --filter @dofortech/pretty-ui tokens          # regenerate generated CSS
pnpm --filter @dofortech/pretty-ui check:contrast  # WCAG harness over the ramps
pnpm --filter @dofortech/pretty-ui typecheck
```

`check:contrast` sweeps ~119k in-gamut seeds and enforces AA on every pair the
ramp promises. Run it after any edit to `scripts/ramp.mjs`; the curve caps were
tuned against it and a plausible-looking tweak can silently drop a hue below AA.

## Token inventory

Only these exist. Anything else is a typo, and a typo in a `var()` fails
silently — the declaration becomes invalid at computed-value time and the
element inherits instead.

**accent** (12)
`--pui-accent-1` · `--pui-accent-10` · `--pui-accent-11` · `--pui-accent-12` · `--pui-accent-2` · `--pui-accent-3` · `--pui-accent-4` · `--pui-accent-5` · `--pui-accent-6` · `--pui-accent-7` · `--pui-accent-8` · `--pui-accent-9`

**color** (44)
`--pui-color-background` · `--pui-color-border` · `--pui-color-border-muted` · `--pui-color-border-strong` · `--pui-color-danger` · `--pui-color-danger-border` · `--pui-color-danger-hover` · `--pui-color-danger-soft` · `--pui-color-danger-text` · `--pui-color-focus-ring` · `--pui-color-foreground` · `--pui-color-foreground-muted` · `--pui-color-foreground-subtle` · `--pui-color-info` · `--pui-color-info-text` · `--pui-color-on-danger` · `--pui-color-on-primary` · `--pui-color-on-secondary` · `--pui-color-on-success` · `--pui-color-on-warning` · `--pui-color-overlay` · `--pui-color-panel` · `--pui-color-panel-active` · `--pui-color-panel-hover` · `--pui-color-primary` · `--pui-color-primary-active` · `--pui-color-primary-border` · `--pui-color-primary-hover` · `--pui-color-primary-soft` · `--pui-color-primary-soft-active` · `--pui-color-primary-soft-hover` · `--pui-color-primary-text` · `--pui-color-secondary` · `--pui-color-secondary-active` · `--pui-color-secondary-border` · `--pui-color-secondary-hover` · `--pui-color-secondary-soft` · `--pui-color-secondary-soft-active` · `--pui-color-secondary-soft-hover` · `--pui-color-secondary-text` · `--pui-color-success` · `--pui-color-success-text` · `--pui-color-warning` · `--pui-color-warning-text`

**control** (7)
`--pui-control-gap` · `--pui-control-h-lg` · `--pui-control-h-md` · `--pui-control-h-sm` · `--pui-control-px-lg` · `--pui-control-px-md` · `--pui-control-px-sm`

**danger** (6)
`--pui-danger-10` · `--pui-danger-11` · `--pui-danger-2` · `--pui-danger-3` · `--pui-danger-7` · `--pui-danger-9`

**direction** (1)
`--pui-direction`

**duration** (12)
`--pui-duration-fast` · `--pui-duration-instant` · `--pui-duration-loop-pulse` · `--pui-duration-loop-spin` · `--pui-duration-loop-sweep` · `--pui-duration-move` · `--pui-duration-normal` · `--pui-duration-slow` · `--pui-duration-spring-bouncy` · `--pui-duration-spring-gentle` · `--pui-duration-spring-precise` · `--pui-duration-spring-snappy`

**ease** (8)
`--pui-ease-emphasized` · `--pui-ease-exit` · `--pui-ease-in-out` · `--pui-ease-spring-bouncy` · `--pui-ease-spring-gentle` · `--pui-ease-spring-precise` · `--pui-ease-spring-snappy` · `--pui-ease-standard`

**focus** (4)
`--pui-focus-ring-inner` · `--pui-focus-ring-offset` · `--pui-focus-ring-outer` · `--pui-focus-ring-width`

**font** (12)
`--pui-font-mono` · `--pui-font-sans` · `--pui-font-size-1` · `--pui-font-size-2` · `--pui-font-size-3` · `--pui-font-size-4` · `--pui-font-size-5` · `--pui-font-size-6` · `--pui-font-weight-bold` · `--pui-font-weight-medium` · `--pui-font-weight-normal` · `--pui-font-weight-semibold`

**glass** (1)
`--pui-glass-alpha`

**gray** (12)
`--pui-gray-1` · `--pui-gray-10` · `--pui-gray-11` · `--pui-gray-12` · `--pui-gray-2` · `--pui-gray-3` · `--pui-gray-4` · `--pui-gray-5` · `--pui-gray-6` · `--pui-gray-7` · `--pui-gray-8` · `--pui-gray-9`

**info** (2)
`--pui-info-11` · `--pui-info-9`

**letter** (2)
`--pui-letter-spacing-normal` · `--pui-letter-spacing-tight`

**line** (2)
`--pui-line-height-normal` · `--pui-line-height-tight`

**list** (1)
`--pui-list-item-py`

**motion** (2)
`--pui-motion-off` · `--pui-motion-ok`

**on** (3)
`--pui-on-hue-cos` · `--pui-on-hue-sin` · `--pui-on-threshold`

**pulse** (1)
`--pui-pulse-dip`

**radius** (10)
`--pui-radius-1` · `--pui-radius-2` · `--pui-radius-3` · `--pui-radius-4` · `--pui-radius-5` · `--pui-radius-6` · `--pui-radius-control` · `--pui-radius-full` · `--pui-radius-pill` · `--pui-radius-surface`

**scale** (3)
`--pui-scale-enter` · `--pui-scale-exit` · `--pui-scale-press`

**scrim** (2)
`--pui-scrim-blur` · `--pui-scrim-color`

**secondary** (12)
`--pui-secondary-1` · `--pui-secondary-10` · `--pui-secondary-11` · `--pui-secondary-12` · `--pui-secondary-2` · `--pui-secondary-3` · `--pui-secondary-4` · `--pui-secondary-5` · `--pui-secondary-6` · `--pui-secondary-7` · `--pui-secondary-8` · `--pui-secondary-9`

**shadow** (4)
`--pui-shadow-1` · `--pui-shadow-2` · `--pui-shadow-3` · `--pui-shadow-4`

**space** (8)
`--pui-space-1` · `--pui-space-2` · `--pui-space-3` · `--pui-space-4` · `--pui-space-5` · `--pui-space-6` · `--pui-space-7` · `--pui-space-8`

**spin** (1)
`--pui-spin-turn`

**success** (4)
`--pui-success-11` · `--pui-success-2` · `--pui-success-3` · `--pui-success-9`

**surface** (1)
`--pui-surface-p`

**target** (2)
`--pui-target-comfortable` · `--pui-target-min`

**travel** (5)
`--pui-travel-lg` · `--pui-travel-md` · `--pui-travel-page` · `--pui-travel-sm` · `--pui-travel-xs`

**warning** (4)
`--pui-warning-11` · `--pui-warning-2` · `--pui-warning-3` · `--pui-warning-9`
