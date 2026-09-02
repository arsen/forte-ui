# Contributing to forte-ui

Conventions every component must follow. They are not style preferences — each
one exists because breaking it causes a specific, usually silent, bug.

## Anatomy of a component

```
src/components/<name>/
  <Name>.tsx          "use client" wrapper around the Base UI primitive
  <Name>.module.css   styles, inside @layer forte.components
  index.ts            re-exports the component and its types
```

Register the component in `src/index.ts`. Every file that renders is
`"use client"` — Base UI primitives use context and refs.

## The rules

**1. Consume tokens; never hardcode a value.** No hex colours, no `px`
durations, no literal radii. If a value is missing from the inventory below,
add it to `scripts/ramp.mjs` or `scripts/motion.mjs` and regenerate — do not
inline it. Component-level knobs are exposed as `--forte-<component>-*` custom
properties declared at the top of the root rule, defaulting to semantic tokens,
so a consumer can re-skin without forking. Give every knob a `/** … */` doc
comment directly above its declaration — `scripts/theming-docgen.mjs` publishes
it, together with the declared default, as the component's Theming table in the
docs (`docs-data/theming.json`), exactly the way JSDoc on a prop becomes the
prop table. A knob without one is invisible there; plain `/* … */` comments
stay private.

**2. Never write `@media (prefers-reduced-motion)` in a component file.** The
motion tokens already collapse their own geometry: `--forte-travel-md` becomes
`0px` and `--forte-scale-enter` becomes `1`. A component that consumes them gets
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

**5. Focusable parts get `.forte-focus-ring`.** Add `data-focus-inset` when the
part sits inside a clipping container (list rows, tab strips, select items),
which flips the ring inward so `overflow: hidden` cannot crop it.

Where the element that HOLDS focus is not the element that should look focused —
Slider's and ColorPicker's thumbs over their hidden inputs, NumberField's group
over its text field — the wrapper takes `.forte-focus-ring-within` instead. That
class already suppresses the UA ring on the descendant it rings for, so do not
restate `outline: none` in the component. It does not suppress a nested part
that rings itself, which is how NumberField's steppers keep their own.

Both are still beaten by an app-level global `:focus-visible` rule, since every
`forte-ui` layer loses to an app's own CSS by design. That is only visible on
the `-within` components, where it draws a second ring on the inner control; the
fix belongs in the app, and `apps/docs/app/globals.css` carries the worked
example.

**5b. Forced-colors rules go in `@layer forte.a11y`, not in your component
layer.** Layer order outranks specificity entirely, and `a11y` is ordered after
`components`. A forced-colors fix written inside your `@layer
forte.components` block competes with your own ordinary rules on
specificity and usually loses — most visibly with `opacity`, which forced-colors
does not override, so `[data-disabled] { opacity: 0.55 }` survives and a
disabled control keeps full system-colour contrast. Close the components layer
and open a second block:

```css
@layer forte.components { /* ... normal styles ... */ }

@layer forte.a11y {
  @media (forced-colors: active) {
    .root[data-disabled] { opacity: 1; color: GrayText; border-color: GrayText; }
  }
}
```

**6. Floating surfaces get `.forte-hc-surface`.** It carries a transparent border
that is invisible normally but becomes a system-coloured boundary in forced-
colors mode, where all shadows are stripped and an unbordered popup would
otherwise dissolve into the page.

**6b. Inside a `.module.css`, a `.forte-*` selector is LOCAL, not global.** CSS
Modules hashes every bare class selector, so a rule written as
`.forte-icon { ... }` compiles to `._forte-icon_a1b2c3` and matches nothing —
silently. Components apply these pattern classes as plain strings, so they stay
unhashed in the DOM. To target one from a module, wrap it: `:global(.forte-icon)`.
Better still, target the element (`svg`) or rely on `currentColor`.

**7. `className` goes last.** `clsx(styles.root, "forte-focus-ring", className)`
— consumer classes must be able to win without `!important`.

**8. State goes on `data-*` attributes, not in class names.** `data-variant`,
`data-size`, `data-tone`. This is what lets consumers target states from plain
CSS or Tailwind arbitrary variants without wrapping the component.

**9. Every rendered element carries `data-forte="<component>"` (root) or
`data-forte="<component>-<part>"`,** the part name being the kebab-cased style
key. The hashed CSS Modules class names change between releases, so this
marker is the only selector a consumer can write against a part and keep — it
is public API, and renaming one is a breaking change. Place it right after
`className` and before any `{...props}` spread, so a caller can override it.
Two exceptions: SVG descendants of a tagged element get nothing (target them
through the svg), and a composed forte-ui component is never handed a marker
by its host — it tags its own root, and consumers scope with a descendant
selector (`[data-forte="button"] [data-forte="spinner"]`).

**10. Decorative SVG gets `aria-hidden="true"`,** and anything conveying state
to assistive technology goes in a `.forte-visually-hidden` span.

## Available pattern classes

`.forte-focus-ring` · `.forte-focus-ring-within` · `.forte-hc-surface` ·
`.forte-visually-hidden` · `.forte-target` · `.forte-scrim` · `.forte-icon` ·
`.forte-link` · `.forte-hc-decorative` · `.forte-preserve-color` ·
`.forte-popup-arrow` (+ `-svg` / `-fill` / `-border`) · `.forte-popup-viewport`

The two `forte-popup-*` families are the shared anchored-popup mechanics: the
arrow geometry (Popover, PreviewCard, Tooltip, NavigationMenu) and the
content-swap viewport (Popover, PreviewCard). They read generic
`--forte-popup-*` custom properties that each component's popup maps its own
published knobs onto — see the "Wiring for the shared anchored-popup
patterns" block in any of those components' `.module.css`. A popup that
applies the class without the mapping silently gets the pattern's fallbacks;
`check:parity` fails the build for exactly that.

## Verifying

```bash
pnpm --filter @forte-ui/react tokens          # regenerate generated CSS
pnpm --filter @forte-ui/react check:contrast  # WCAG harness over the ramps
pnpm --filter @forte-ui/react check:parity    # anchored-popup parity gate
pnpm --filter @forte-ui/react typecheck
```

`check:contrast` sweeps ~119k in-gamut seeds and enforces AA on every pair the
ramp promises. Run it after any edit to `scripts/ramp.mjs`; the curve caps were
tuned against it and a plausible-looking tweak can silently drop a hue below AA.

`check:parity` holds the anchored popups' hand-kept twin blocks equal — the
per-`data-side` displacement, enter/exit gesture, size scale and viewport
resize rules must match across Menu, Popover, PreviewCard, Tooltip and
NavigationMenu modulo each one's knob prefix, and every popup that uses a
shared `.forte-popup-*` pattern must declare its wiring. Run it after editing
any of those blocks; the header of `scripts/check-popup-parity.mjs` explains
what to do when it fails.

## Token inventory

Only these exist. Anything else is a typo, and a typo in a `var()` fails
silently — the declaration becomes invalid at computed-value time and the
element inherits instead.

This list is hand-maintained prose and can drift. The generated, authoritative
inventory is [`docs-data/tokens.json`](docs-data/tokens.json) — every `--forte-*`
declaration in `src/styles/*.css` with its default, every overriding selector
(presets, dark mode, forced colours), and its `@property` registration where
one exists. `pnpm --filter @forte-ui/react docgen` rebuilds it. When this
list and that file disagree, the file is right; fix the list.

**accent** (13)
`--forte-accent-1` · `--forte-accent-10` · `--forte-accent-11` · `--forte-accent-12` · `--forte-accent-2` · `--forte-accent-3` · `--forte-accent-4` · `--forte-accent-5` · `--forte-accent-6` · `--forte-accent-7` · `--forte-accent-8` · `--forte-accent-9` · `--forte-accent-seed`

**app** (3)
`--forte-app-bar-h-lg` · `--forte-app-bar-h-md` · `--forte-app-bar-h-sm`

**color** (51)
`--forte-color-background` · `--forte-color-border` · `--forte-color-border-muted` · `--forte-color-border-strong` · `--forte-color-danger` · `--forte-color-danger-border` · `--forte-color-danger-hover` · `--forte-color-danger-soft` · `--forte-color-danger-text` · `--forte-color-focus-ring` · `--forte-color-foreground` · `--forte-color-foreground-muted` · `--forte-color-foreground-subtle` · `--forte-color-info` · `--forte-color-info-border` · `--forte-color-info-soft` · `--forte-color-info-text` · `--forte-color-on-danger` · `--forte-color-on-info` · `--forte-color-on-primary` · `--forte-color-on-secondary` · `--forte-color-on-success` · `--forte-color-on-warning` · `--forte-color-overlay` · `--forte-color-panel` · `--forte-color-panel-active` · `--forte-color-panel-hover` · `--forte-color-primary` · `--forte-color-primary-active` · `--forte-color-primary-border` · `--forte-color-primary-hover` · `--forte-color-primary-soft` · `--forte-color-primary-soft-active` · `--forte-color-primary-soft-hover` · `--forte-color-primary-text` · `--forte-color-secondary` · `--forte-color-secondary-active` · `--forte-color-secondary-border` · `--forte-color-secondary-hover` · `--forte-color-secondary-soft` · `--forte-color-secondary-soft-active` · `--forte-color-secondary-soft-hover` · `--forte-color-secondary-text` · `--forte-color-success` · `--forte-color-success-border` · `--forte-color-success-soft` · `--forte-color-success-text` · `--forte-color-warning` · `--forte-color-warning-border` · `--forte-color-warning-soft` · `--forte-color-warning-text`

**control** (7)
`--forte-control-gap` · `--forte-control-h-lg` · `--forte-control-h-md` · `--forte-control-h-sm` · `--forte-control-px-lg` · `--forte-control-px-md` · `--forte-control-px-sm`

**danger** (6)
`--forte-danger-10` · `--forte-danger-11` · `--forte-danger-2` · `--forte-danger-3` · `--forte-danger-7` · `--forte-danger-9`

**direction** (1)
`--forte-direction`

**duration** (12)
`--forte-duration-fast` · `--forte-duration-instant` · `--forte-duration-loop-pulse` · `--forte-duration-loop-spin` · `--forte-duration-loop-sweep` · `--forte-duration-move` · `--forte-duration-normal` · `--forte-duration-slow` · `--forte-duration-spring-bouncy` · `--forte-duration-spring-gentle` · `--forte-duration-spring-precise` · `--forte-duration-spring-snappy`

**ease** (8)
`--forte-ease-emphasized` · `--forte-ease-exit` · `--forte-ease-in-out` · `--forte-ease-spring-bouncy` · `--forte-ease-spring-gentle` · `--forte-ease-spring-precise` · `--forte-ease-spring-snappy` · `--forte-ease-standard`

**focus** (4)
`--forte-focus-ring-inner` · `--forte-focus-ring-offset` · `--forte-focus-ring-outer` · `--forte-focus-ring-width`

**font** (12)
`--forte-font-mono` · `--forte-font-sans` · `--forte-font-size-1` · `--forte-font-size-2` · `--forte-font-size-3` · `--forte-font-size-4` · `--forte-font-size-5` · `--forte-font-size-6` · `--forte-font-weight-bold` · `--forte-font-weight-medium` · `--forte-font-weight-normal` · `--forte-font-weight-semibold`

**glass** (1)
`--forte-glass-alpha`

**gray** (12)
`--forte-gray-1` · `--forte-gray-10` · `--forte-gray-11` · `--forte-gray-12` · `--forte-gray-2` · `--forte-gray-3` · `--forte-gray-4` · `--forte-gray-5` · `--forte-gray-6` · `--forte-gray-7` · `--forte-gray-8` · `--forte-gray-9`

**info** (5)
`--forte-info-11` · `--forte-info-2` · `--forte-info-3` · `--forte-info-7` · `--forte-info-9`

**letter** (2)
`--forte-letter-spacing-normal` · `--forte-letter-spacing-tight`

**line** (2)
`--forte-line-height-normal` · `--forte-line-height-tight`

**list** (1)
`--forte-list-item-py`

**motion** (2)
`--forte-motion-off` · `--forte-motion-ok`

**neutral** (1)
`--forte-neutral-tint`

**on** (3)
`--forte-on-hue-cos` · `--forte-on-hue-sin` · `--forte-on-threshold`

**popup** (1)
`--forte-popup-available-width` — registration only; each anchored popup
declares it on its own element to route `--available-width` through a typed
hop. Not a theming knob. (The other `--forte-popup-*` names are the
per-component wiring the shared patterns read — declared in component
modules, so they are deliberately not in this inventory.)

**pulse** (1)
`--forte-pulse-dip`

**radius** (10)
`--forte-radius-1` · `--forte-radius-2` · `--forte-radius-3` · `--forte-radius-4` · `--forte-radius-5` · `--forte-radius-6` · `--forte-radius-control` · `--forte-radius-full` · `--forte-radius-pill` · `--forte-radius-surface`

**scale** (3)
`--forte-scale-enter` · `--forte-scale-exit` · `--forte-scale-press`

**scrim** (2)
`--forte-scrim-blur` · `--forte-scrim-color`

**secondary** (13)
`--forte-secondary-1` · `--forte-secondary-10` · `--forte-secondary-11` · `--forte-secondary-12` · `--forte-secondary-2` · `--forte-secondary-3` · `--forte-secondary-4` · `--forte-secondary-5` · `--forte-secondary-6` · `--forte-secondary-7` · `--forte-secondary-8` · `--forte-secondary-9` · `--forte-secondary-seed`

**shadow** (4)
`--forte-shadow-1` · `--forte-shadow-2` · `--forte-shadow-3` · `--forte-shadow-4`

**space** (8)
`--forte-space-1` · `--forte-space-2` · `--forte-space-3` · `--forte-space-4` · `--forte-space-5` · `--forte-space-6` · `--forte-space-7` · `--forte-space-8`

**spin** (1)
`--forte-spin-turn`

**success** (5)
`--forte-success-11` · `--forte-success-2` · `--forte-success-3` · `--forte-success-7` · `--forte-success-9`

**surface** (1)
`--forte-surface-p`

**target** (2)
`--forte-target-comfortable` · `--forte-target-min`

**travel** (5)
`--forte-travel-lg` · `--forte-travel-md` · `--forte-travel-page` · `--forte-travel-sm` · `--forte-travel-xs`

**warning** (5)
`--forte-warning-11` · `--forte-warning-2` · `--forte-warning-3` · `--forte-warning-7` · `--forte-warning-9`
