---
name: forte-ui
description: >-
  Build and style UI with @forte-ui/react — an accessible React component
  library themed entirely through CSS variables: seed colors (accent,
  secondary, neutral tint) rebuild the whole palette, and every size, radius,
  and duration is a token. Use this skill whenever the
  project depends on @forte-ui/react and the task touches UI in any way:
  installing or wiring the stylesheet, setting a brand color or dark mode,
  rendering or composing components (Button, Dialog, Select, Tabs, Toast, …),
  overriding or customizing component styles, integrating Tailwind v4, or
  looking up which props, tokens, or theming knobs exist. Also use it when
  styling looks broken in a forte-ui app (components lost their padding,
  utilities don't compile, a theme override "does nothing") — the usual causes
  are documented here.
---

# Using @forte-ui/react

forte-ui is a React component library built on Base UI primitives. Three design
decisions drive everything below, and most mistakes come from not knowing them:

1. **Tokens are the API.** Every color, size, radius, and duration a component
   renders resolves through a `--forte-*` CSS custom property. Theming means
   re-pointing tokens, never patching component CSS.
2. **The consumer always wins.** All library CSS ships inside `@layer forte.*`,
   and layered rules lose to unlayered author CSS regardless of specificity.
   Your plain CSS overrides anything — never write `!important` against
   forte-ui, and never target its class names (CSS Modules hashes them; they
   change between releases).
3. **Everything stable rides on data attributes.** Parts are addressed as
   `[data-forte="button"]`, `[data-forte="select-trigger"]`; states as
   `[data-variant]`, `[data-disabled]`, `[data-open]`, etc. These are public
   API covered by semver.

## Look up the installed API — don't recall it

The package ships its own machine-readable documentation, versioned with the
code, so what you read always matches what the app actually has installed.
Prefer these files over memory or web docs whenever you need an exact name:

```bash
node -e "console.log(require.resolve('@forte-ui/react/package.json'))"
```

That prints the package directory (works under npm, pnpm, and yarn hoisting;
if it fails, find the directory under `node_modules/@forte-ui/react`). Inside:

| File | What it holds |
| :-- | :-- |
| `package.json` | the installed version |
| `docs-data/components.md` | the component catalog — every component with a one-line *when to use this* and the exact `props.json` / `theming.json` keys to look up next. Small enough to read whole; **start here when choosing a component** |
| `docs-data/props.json` | every component part's props — keyed by part name (`ButtonProps` lives under `Button`, `SelectTrigger` under `SelectTrigger`), with descriptions, types, defaults |
| `docs-data/theming.json` | every per-component theming knob — keyed by component, each knob with its name, default, the part it lives on, and every variant/size selector that reassigns it |
| `docs-data/tokens.json` | every global `--forte-*` token — keyed by name, with its family, default value, and every declaration (including dark-mode and preset rewrites) |
| `dist/index.d.ts` | the full typed surface, including doc comments |

When a task needs "which component fits this UI" — read `components.md` whole
and pick from it. When it needs "what props does X take", "what knobs does X
expose", or "does token Y exist" — read the relevant JSON file. A `var()` typo
is not an error in CSS; the declaration silently becomes invalid and the
element inherits instead, so verifying token names against `tokens.json`
before writing them is the only guard.

## Setup

### Without Tailwind

One stylesheet, imported once at the app root, before the app's own CSS:

```tsx
import "@forte-ui/react/theme.css";
import "./globals.css";
```

Then seed the theme in the app's CSS:

```css
:root {
  --forte-accent-seed: #6d43d4; /* primary brand color — the minimum theme; see Theming for the other inputs */
}

body {
  margin: 0;
  background: var(--forte-color-background);
  color: var(--forte-color-foreground);
  font-family: var(--forte-font-sans);
}
```

**Trap — global resets.** A scaffold's unlayered `* { padding: 0; margin: 0 }`
beats every rule in `@layer forte.*` by design, stripping the components' own
padding (first visible casualty: a Button with no horizontal padding). Remove
such resets; keep `box-sizing` if wanted.

### With Tailwind v4

The package ships a bridge stylesheet that re-points Tailwind's theme at the
forte-ui tokens. In the stylesheet that imports Tailwind:

```css
@import "@forte-ui/react/tailwind.css";
@import "tailwindcss";
@import "@forte-ui/react/theme.css";

:root {
  --forte-accent-seed: #6d43d4;
}
```

Two orderings in that file are load-bearing — get them wrong and the breakage
is silent:

- **The bridge before `tailwindcss`.** Its first line pins the cascade-layer
  order to `theme, base, forte, components, utilities`, and a layer order is
  fixed at its first appearance. That is what keeps Tailwind's Preflight (in
  `base`) from blanking the components, and what lets utilities beat component
  styles (`p-4` on a `Button` wins). Import Tailwind first and its own layer
  statement wins the race instead.
- **`theme.css` after the bridge, in this same file** — not separately in a
  layout/entry file above it, or the `forte` layer gets pinned before `base`
  and Preflight's `button { background: transparent }` beats every component.

## Theming

### The seed

```css
:root {
  --forte-accent-seed: #7c3aed;   /* required: the brand color */
  --forte-secondary-seed: #0e7490; /* optional: drives tone="secondary" */
  --forte-neutral-tint: 0.5;       /* optional: 0 pure gray … 1 brand-tinted grays */
}
```

The seed derives twelve-step ramps (`--forte-accent-1…12`, same for
`secondary` and `gray`) in both light and dark mode, in pure CSS. Contrast is
certified for seeds with OKLCH lightness 0.45–0.90 and chroma 0.02–0.30 inside
sRGB. Status colors (danger/success/warning/info) are deliberately **not**
seed-derived — a brand color must not make an error look reassuring.

Components read semantic aliases, not ramp steps — override these for finer
control than the seed gives: `--forte-color-background` (page),
`--forte-color-panel` (raised surface), `--forte-color-primary` (solid fill),
`--forte-color-primary-soft` (tinted fill), `--forte-color-primary-text`
(accent text), `--forte-color-foreground`, `--forte-color-border`, and so on —
full list in `tokens.json`.

### Light and dark

With no attribute set, the page follows the OS. To pin a mode or drive a
toggle, set `data-theme="light" | "dark"` on any element (typically `<html>`).
With next-themes, use `<ThemeProvider attribute="data-theme">` — its default
writes `class="dark"`, which forte-ui does not read.

### Scoped themes

Add class `forte-theme` (or attribute `data-forte-theme`) to an element and set
seeds there — that subtree re-derives its whole palette. Scopes nest, and
`data-theme` works on a scope too (a permanently-dark sidebar in a light app
is one attribute).

**Trap — the scope marker is load-bearing.** Setting `--forte-accent-seed` on
a plain element does nothing: a custom property containing `var()` substitutes
where it is *declared*, and the ramp is declared only on `:root`,
`.forte-theme`, and `[data-forte-theme]`. When a seed override "doesn't work",
the missing scope marker is almost always why.

### Presets — radius, density, motion

Three data attributes retune a whole subtree, no CSS required. Put them on
`<html>` for the app, or any element for a subtree; the nearest ancestor's
setting wins in full (each preset restates its whole token group, never a
blend):

- `data-forte-radius="none" | "soft" | "pill"`
- `data-forte-density="compact" | "spacious"` — `compact` is the floor by
  design: controls bottom out at the 24px WCAG minimum target. Do not build a
  denser one.
- `data-forte-motion="reduce" | "off" | "full"` — `reduce` matches the OS
  reduced-motion preference exactly; `full` overrides the OS preference, so
  reach for it only where motion is the content, not because an app prefers
  its animations.

## Styling a component

Reach for these three mechanisms in order:

**1. Props.** `variant` is how loud a component is; `tone` is which semantic
color set it draws (e.g. `tone="danger"`); `size` when offered. Every
variant×tone combination works — check `props.json` for the accepted values.

**2. Theming knobs.** Per-component custom properties like
`--forte-button-radius`, each defaulting to a semantic token. Listed per
component in `theming.json`.

**Trap — knobs live on the component's root element.** An element's own
declaration beats anything inherited, so setting `--forte-button-radius` on
`:root` or a wrapper does nothing. Set it on the component itself (a class of
yours, or inline `style`). To move *all* buttons, re-point the global token
the knob defaults to instead (`--forte-radius-control` reaches every control).

**3. Your own CSS**, against the stable selectors:

```css
/* every select trigger, but only while its popup is open */
[data-forte="select-trigger"][data-popup-open] {
  border-color: var(--forte-color-primary-border);
}
```

No `!important`, no specificity contest — your unlayered CSS wins by layer
order. The same selectors work as Tailwind arbitrary variants
(`data-[variant=solid]:shadow-2`) and in any CSS-in-JS. Write your values as
tokens (`var(--forte-shadow-2)`, not a literal) so the customization keeps
responding to the seed, presets, and dark mode.

When restyling, preserve what the defaults guarantee: animate with
`var(--forte-duration-*)` / `var(--forte-travel-*)` so reduced-motion collapse
comes free (never write a literal `transition` or a local
`prefers-reduced-motion` query); re-check contrast when repainting text or
fills; keep `cursor: pointer`, visible focus outlines, and 24px minimum
targets on interactive parts.

**Trap — an unlayered `box-shadow` erases the focus ring's halo.** The
two-tone focus ring paints its inner tone with `outline` and its outer halo
with a *layered* `box-shadow`, so your unlayered shadow override wins over it
on focus and silently deletes the halo. When giving an interactive part a
resting shadow, restate both in a `:focus-visible` rule:

```css
[data-forte="button"][data-variant="solid"] {
  box-shadow: var(--forte-shadow-2);
}
[data-forte="button"][data-variant="solid"]:focus-visible {
  box-shadow:
    0 0 0 var(--forte-focus-ring-offset) var(--forte-focus-ring-outer),
    var(--forte-shadow-2);
}
```

## Tailwind specifics

The bridge **deletes and rebuilds** Tailwind's stock scales from the tokens —
`bg-slate-800`, `p-13`, `text-white` do not compile, deliberately: a hardcoded
color would survive review and then ignore the seed, dark mode, and every
theme scope. What compiles responds to all of them:

```
bg-primary        background-color: var(--forte-color-primary)
text-foreground   color: var(--forte-color-foreground)
gap-5             gap: var(--forte-space-5)          /* eight steps, 1:1 */
p-surface         padding: var(--forte-surface-p)    /* follows density */
text-2            font-size: var(--forte-font-size-2)
rounded-control   border-radius: var(--forte-radius-control)  /* follows radius preset */
shadow-2          box-shadow: var(--forte-shadow-2)
duration-fast     transition-duration: var(--forte-duration-fast)
```

Any other token is reachable with v4's variable shorthand —
`h-(--forte-control-h-md)` — and the `--container-*` scale is untouched
(`max-w-lg` still works). Colors resolve through `light-dark()`, so `bg-panel`
follows the theme by itself; a `dark:` variant is rarely needed, and Tailwind's
stock one keys on the OS preference, ignoring the `data-theme` toggle — re-key
it if needed:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

**Merging class lists:** use the shipped merger, not a stock `twMerge` — the
stock one doesn't know the renamed scales (it parses `text-2` as a text
*color* and silently drops sizes). It needs the optional peer dependency
`tailwind-merge` installed:

```ts
import { cn } from "@forte-ui/react/cn";
```

If the app adds its own `@theme` keys, extend rather than replace:

```ts
import { createCn } from "@forte-ui/react/cn";
export const cn = createCn({ extend: { theme: { spacing: ["header"] } } });
```

## React specifics

- Every export ships with `"use client"` — import straight from
  `@forte-ui/react`, no provider or config file needed for rendering.
- **Flat exports render from React Server Components; compound (dot-notation)
  parts do not.** `<Button>` works in a server component, but `Tabs.Root`,
  `Dialog.Trigger`, `Menu.Item` resolve to `undefined` through the
  client-reference proxy and React throws *"Element type is invalid … got:
  undefined"*. Put `"use client"` on the file that renders dot-notation parts.
- The imperative APIs (`useToast`, `useDialog`) pair with their providers —
  check `props.json` / the `.d.ts` for the wiring.

## Choosing a component

Do not pick from memory: read `docs-data/components.md` from the installed
package (see the table above). It is generated from the source at build time,
so it lists exactly the components this version ships — with a one-line
when-to-use for each, which entries are compound, and the `props.json` /
`theming.json` keys to read next.

## Pitfall checklist

When something looks broken, check these before anything else:

- Components lost their padding/margins → an unlayered global reset is beating
  the `forte.*` layers; remove it.
- Tailwind utilities blank the components, or can't beat them → the bridge was
  imported after `tailwindcss`, or `theme.css` was imported outside/above the
  Tailwind stylesheet.
- A seed or token override does nothing → it was set on a plain element
  (needs `:root` or a `forte-theme` scope marker), or — for a component knob —
  on `:root` instead of the component's own element.
- A style "randomly" doesn't apply → a `var(--forte-…)` typo failing silently;
  verify the name against `tokens.json` / `theming.json`.
- A utility "randomly" stops overriding another → class merging through a
  stock `twMerge` instead of `@forte-ui/react/cn`.
- "Element type is invalid … got: undefined" from a server component →
  dot-notation compound parts need a `"use client"` file.
- Never target the library's class names, add `!important` against it, write
  literal colors/sizes/durations next to it, or wrap components to reach their
  internals — tokens, knobs, and `data-forte` selectors cover every case.
