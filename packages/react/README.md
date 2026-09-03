# @forte-ui/react

An accessible React component library built on [Base UI](https://base-ui.com)
primitives. One CSS variable re-themes the entire system, motion respects every
user preference, and nothing ships a runtime: theming, dark mode, density,
radius presets and reduced motion are all resolved by the browser from plain
CSS custom properties.

- **One seed, whole palette.** Set `--forte-accent-seed` and every color — all
  twelve accent steps, brand-tinted neutrals, readable text on solid fills, in
  light and dark — is derived from it with CSS relative color syntax. The
  derived pairs are contrast-checked against WCAG floors across ~119k seeds in
  CI.
- **Your CSS always wins.** Everything ships inside `@layer forte.*`,
  which loses to unlayered author CSS by design. No `!important` anywhere, in
  either direction.
- **Styling-solution agnostic.** State is exposed as `data-*` attributes,
  parts as stable `data-forte` markers, and every knob is a custom property — so
  plain CSS, CSS Modules, Tailwind, or CSS-in-JS all work without wrappers.

## Install

```bash
pnpm add @forte-ui/react
```

React 18 or 19 is a peer dependency. Then import the one required stylesheet
once, at the root of your app, before any component renders:

```tsx
import "@forte-ui/react/theme.css";
```

Per-component styles load automatically with each component you import — they
require a bundler that understands CSS imports from `node_modules` (Vite,
Next.js and webpack all qualify).

```tsx
import { Button } from "@forte-ui/react";

<Button variant="soft" tone="danger" size="lg">
  Delete
</Button>;
```

## Theming

```css
:root {
  --forte-accent-seed: #7c3aed; /* one variable re-skins everything */
}
```

Also available:

| Control | Values | What it does |
| :-- | :-- | :-- |
| `--forte-secondary-seed` | any in-gamut color | second brand color, same derivation |
| `--forte-neutral-tint` | `0` … `1` | pure gray → brand-tinted grays |
| `data-theme` | `"light"` / `"dark"` | otherwise follows the OS |
| `data-forte-radius` | `"none"` / `"soft"` / `"pill"` | radius preset |
| `data-forte-density` | `"compact"` / `"spacious"` | control heights and padding |
| `data-forte-motion` | `"reduce"` / `"off"` / `"full"` | motion preference override |

The `data-forte-*` switches work on any element and apply to its whole subtree.
To re-theme just a subtree (a different seed, a forced-dark panel), add
`.forte-theme` or `data-forte-theme` to the subtree root and set the seed there —
the ramps are re-declared on those selectors precisely so this works;
overriding the seed on an arbitrary element does nothing.

Supported seed envelope: lightness 0.45–0.90, chroma 0.02–0.30, inside the
sRGB gamut. Outside it the ramp still renders, but the derived contrast
guarantees no longer hold.

## Styling and overriding

The library's side of the contract, and what each part is for:

**Layers — your CSS wins.** All shipped CSS lives in
`@layer forte.reset → tokens → patterns → components → a11y → overrides`.
Every layer loses to *unlayered* author CSS, so a flat rule in your stylesheet
overrides anything the library sets, at any specificity, without
`!important`. (The flip side is a documented opt-out: an unlayered
`transition` or `--forte-motion-ok: 1` of yours will also defeat the library's
reduced-motion handling.)

**`className` on every part, applied last.** Every exported component and
sub-component accepts `className` after the internal classes, so utility
classes win their cascade ties.

**State is `data-*`, never a class name.** `data-variant`, `data-tone`,
`data-size`, `data-disabled`, `data-loading`, plus everything Base UI sets
(`data-checked`, `data-open`, …). Target it from plain CSS
(`[data-variant="solid"]`) or Tailwind arbitrary variants
(`data-[variant=solid]:…`) without wrapping the component.

**Parts are `data-forte`.** The hashed CSS Modules class names are not part of
the API — they change between releases. Every element the library renders
carries a stable `data-forte="<component>"` (root) or
`data-forte="<component>-<part>"` marker instead:

```css
/* every dialog surface, forever, regardless of release */
[data-forte="dialog-popup"] {
  border: 2px solid var(--forte-color-border-strong);
}

/* the spinner inside a button, scoped by composition */
[data-forte="button"] [data-forte="spinner"] {
  opacity: 0.8;
}
```

**Knobs are `--forte-<component>-*`.** Each component declares its knobs on its
own root element, defaulting to a global token — `--forte-button-radius` starts
at `var(--forte-radius-control)`. Set the knob on one element to re-skin one
instance; re-point the global token on `:root` or a theme scope to re-skin
every instance:

```css
.my-toolbar [data-forte="button"] {
  --forte-button-radius: var(--forte-radius-pill);
}
```

**Everything else is a token.** Color, spacing, radius, control geometry,
shadows, durations, easings — the full inventory is in
[CONTRIBUTING.md](./CONTRIBUTING.md). Consume them in your own CSS freely;
they are the same values the components use, so the two stay in step through
every theme change.

## Using Tailwind (v4)

The package ships a bridge that points Tailwind's theme at the forte-ui
tokens. Import it **before** Tailwind in the stylesheet that sets Tailwind up:

```css
@import "@forte-ui/react/tailwind.css";
@import "tailwindcss";
```

(`theme.css` is still required once in the app; the bridge only teaches
Tailwind the token names.)

The order is load-bearing. Tailwind v4's own styles are *layered*, and
cascade-layer order is fixed at first declaration — the bridge declares
`theme, base, forte, components, utilities`, which places Preflight below
the components (so `button { background: transparent }` cannot blank a Button)
and utilities above them (so `p-4` on a Button beats the button's own
padding). Import Tailwind first and `forte-ui` ends up above `utilities`
instead, and utility overrides on components silently stop working.

With the bridge in place, utilities and components are one system:

| Write | Get |
| :-- | :-- |
| `bg-primary`, `text-foreground-muted`, `border-border` | the semantic color slots the components use |
| `bg-accent-9`, `bg-gray-3` | the raw 12-step ramps |
| `gap-5`, `p-4` | the eight `--forte-space-*` steps (`gap-5` is 1.5rem — steps, not a multiplier) |
| `p-surface` | density-aware surface padding |
| `text-2`, `font-medium`, `leading-tight` | the type scale |
| `rounded-control`, `rounded-surface`, `rounded-pill`, `rounded-1`…`6` | radius, following the `data-forte-radius` preset |
| `shadow-1`…`4` | elevation |
| `duration-fast`, `ease-spring-snappy` | the motion system (pair a spring easing with its matching duration) |
| `h-(--forte-control-h-md)` | any other token, via v4's `var()` shorthand |

Tailwind's stock `--color-*`, `--spacing-*`, `--text-*`, `--radius-*`,
`--shadow-*`, `--ease-*` and `--animate-*` scales are deliberately **deleted**
by the bridge: `bg-red-500` and `p-13` do not compile, because they would
survive review and then ignore the seed, dark mode and every theme scope.
(The stock spacing multiplier also cannot coexist with the token steps — the
steps go non-linear past 4, so mixing the two would make `p-8` larger than
`p-9`.) To opt back into a stock scale anyway, re-declare it in your own
`@theme` after the import. The `--container-*` scale (`max-w-lg`, …) and the
breakpoints are untouched.

Component state composes as arbitrary variants, no wrappers needed:

```tsx
<Button className="data-[variant=solid]:shadow-2 data-[loading]:animate-pulse" />
```

### If you use `tailwind-merge`

`tailwind-merge` ships knowing Tailwind's default theme, and the bridge
replaced most of it. Unrecognized classes are not merged — both survive and
the cascade decides — and, worse, the stock color scale matches *any* name,
so `text-2` (a font size here) parses as a text color and
`twMerge("text-2", "text-foreground-muted")` silently drops one. The package
ships a `cn` already configured for the bridge:

```ts
import { cn } from "@forte-ui/react/cn";

cn("p-4", condition && "p-6"); // -> "p-6" when condition holds
```

`tailwind-merge` is an *optional* peer dependency — install it alongside the
package to use this subpath; apps that never import it pay nothing.

If your app adds its own `@theme` keys, the bare `cn` cannot know them —
extend it with `createCn`, which takes the same `{ extend, override }` shape
as tailwind-merge itself and *appends* your names to the library's scales:

```ts
import { createCn } from "@forte-ui/react/cn";

export const cn = createCn({
  extend: {
    theme: {
      spacing: ["header"], // lands beside the library's `surface`
      animate: ["reveal"],
    },
  },
});
```

For setups that are not `cn`-shaped at all, the underlying
`tailwindMergeConfig` stays exported from `@forte-ui/react/tailwind-merge`
as a plain data object.

Colors need no entry — the color scale already matches any name — and
neither do `font-*`, `font-weight-*`, `leading-*` or `tracking-*`, whose names
are Tailwind's own. A missed name does not error, it just stops overriding
its own family.

## Other styling setups

Nothing above is Tailwind-specific except the bridge. For CSS Modules,
vanilla-extract, styled-components or plain stylesheets, the same three hooks
carry the whole story: unlayered CSS beats the library, `data-*` selects
state and parts, and custom properties re-skin one instance or every
instance. If your setup puts *your* styles into cascade layers too, declare
your layers after `forte-ui` (import `theme.css` first, or name `forte-ui`
in your own `@layer` statement) so they keep winning.

## Contributing

Development conventions, the token inventory, and the accessibility rules
live in [CONTRIBUTING.md](./CONTRIBUTING.md).
