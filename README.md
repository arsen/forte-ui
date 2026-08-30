# forte-ui

An accessible React component library built on [Base UI](https://base-ui.com),
styled with CSS Modules and a design system that rebuilds itself around a single
colour.

```bash
npm install @forte-ui/react
```

```tsx
import "@forte-ui/react/theme.css";
import { Button } from "@forte-ui/react";

export function Example() {
  return <Button tone="danger">Delete</Button>;
}
```

## Getting started

The quick version, for a fresh Next.js (App Router) project. The docs site has
the [full step-by-step walkthrough](apps/docs/app/getting-started/nextjs/page.mdx)
at `/getting-started/nextjs`, including why each line is where it is.

### Next.js

```bash
npx create-next-app@latest my-app --typescript --app --no-tailwind
cd my-app
npm install @forte-ui/react
```

Import the one stylesheet at the root — `app/layout.tsx`:

```tsx
import "@forte-ui/react/theme.css";
import "./globals.css";
```

Set your brand colour in `app/globals.css`:

```css
:root {
  --forte-accent-seed: #6d43d4;
}
```

Then use components anywhere. They ship with `"use client"` already in place,
so pages stay server components:

```tsx
import { Button } from "@forte-ui/react";

export default function Home() {
  return <Button>It works</Button>;
}
```

### Next.js + Tailwind v4

Same install, but keep Tailwind in `create-next-app`, and replace
`app/globals.css` with:

```css
@import "@forte-ui/react/tailwind.css";
@import "tailwindcss";
@import "@forte-ui/react/theme.css";

:root {
  --forte-accent-seed: #6d43d4;
}
```

The order is load-bearing: the bridge's first line pins the cascade-layer
order, so it must come before `tailwindcss` (or utilities lose to component
CSS) *and* before `theme.css` (or Tailwind's Preflight blanks the components).
The bridge re-points Tailwind's theme at the forte-ui tokens — `bg-primary`,
`gap-5`, `rounded-control` — and deletes the stock scales, so `bg-slate-800`
fails at build time instead of shipping a colour that ignores your theme.

A walkthrough for Vite-based React apps is planned.

## Theming

One variable re-skins everything:

```css
:root {
  --forte-accent-seed: #6d43d4;
}
```

All twelve accent steps, the brand-tinted neutrals, and a readable text colour
for solid fills derive from it — in both light and dark mode, with no JavaScript
and no build step. It works through CSS relative colour syntax:

```css
--forte-accent-3: oklch(from var(--forte-accent-seed) 0.954 min(0.043, calc(c * 0.17)) h);
```

Also available: `--forte-secondary-seed`, `--forte-neutral-tint` (how much brand hue
bleeds into the greys), and `data-forte-radius` / `data-forte-density` /
`data-forte-motion` / `data-theme` attributes.

Scoping works too — put `.forte-theme` or `data-forte-theme` on any element to
re-theme just that subtree. The ramps are re-declared on those selectors
specifically so this works; overriding the seed on an arbitrary element does
not, because a `var()` inside a custom property is substituted where the
property is *declared*.

## Contrast is measured, not asserted

`pnpm --filter @forte-ui/react test` sweeps **119,108 in-gamut seeds** and
asserts every pair the ramp promises. Current floors:

| Pair | Minimum | Requirement |
| :-- | --: | :-- |
| Text on a solid fill | 4.50:1 | 4.5 (SC 1.4.3) |
| Accent text on app background | 5.42:1 | 4.5 |
| High-contrast text on background | 10.82:1 | 7 (AAA) |
| Neutral body text | 5.81:1 | 4.5 |

Picking black or white text for an arbitrary fill is harder than it looks: the
crossover is not a fixed lightness, because OKLCH weights the channels
differently from WCAG relative luminance. It rises for pinks and purples and
falls for greens. A first-order hue correction tracks it closely enough to clear
AA on its own, and `contrast-color()` supersedes it where supported.

Supported seed envelope: lightness 0.45–0.90, chroma 0.02–0.30, inside sRGB.
The Theme Studio warns when a colour falls outside it.

## Motion

Pure CSS. No animation library, so nothing is added to your bundle.

Enter and exit transitions use Base UI's `[data-starting-style]` /
`[data-ending-style]`, which means they are **interruptible** — close a dialog
while it is still opening and it reverses smoothly instead of snapping. Spring
curves are real damped-harmonic-oscillator solutions sampled into `linear()`
easings, resolved at author time.

Reduced motion is handled once, in the token layer, so no component stylesheet
contains a media query:

- Geometry tokens (`--forte-travel-*`, `--forte-scale-*`) collapse; durations
  shorten rather than disappearing, because an opacity fade is the part that
  helps.
- Scales interpolate toward `1`, never toward `0`.
- Where movement carries *information* — the Switch thumb's position, the
  Checkbox mark — it still moves, and a non-positional cue backs it up.
- Durations never reach `0s`: at exactly zero no transition object is created,
  so `transitionend` never fires and code awaiting it deadlocks.

## Accessibility

Beyond what Base UI provides:

- **Focus rings are two-tone** — a dark inner and light outer ring that contrast
  with each other, so one boundary always clears 3:1 whatever is behind the
  control. Carried by `outline`, which follows `border-radius`, is not clipped
  by `overflow: hidden`, and survives forced-colors mode where shadows are
  stripped.
- **Forced colors (Windows High Contrast)** is handled in a dedicated cascade
  layer ordered *after* components, so the overrides win by layer order rather
  than by specificity games. Disabled controls resolve to `GrayText` at full
  opacity, because forced-colors does not override `opacity`.
- **`prefers-contrast`** and **`prefers-reduced-transparency`** retune tokens.
- **Target size** meets SC 2.5.8 (24×24) even for icon-only controls.

## Overriding

Everything ships inside `@layer forte.*`, which loses to unlayered author
CSS — your rules and utility classes win without `!important`.

The flip side is a documented opt-out: an unlayered `transition` or
`--forte-motion-ok: 1` in your app will also defeat the library's reduced-motion
handling.

Note that component knobs such as `--forte-button-radius` are declared on the
component's own root element, so they must be set **on that element** (through
`className` or `style`), not on an ancestor — an element's own declaration beats
an inherited value. The global `--forte-color-*` / `--forte-radius-*` /
`--forte-space-*` tokens the knobs resolve to *are* inherited, so those can be
re-pointed from `:root` or a theme scope.

## Repository

```
packages/react     the library — Vite build, CSS Modules, generated token CSS
apps/docs       the documentation site — Next.js 16, MDX, Shiki
```

```bash
pnpm dev         # docs site at :3000
pnpm build       # everything
pnpm typecheck
pnpm --filter @forte-ui/react test   # the contrast harness
```

Conventions for adding a component are in
[packages/react/CONTRIBUTING.md](packages/react/CONTRIBUTING.md), including the
complete token inventory. Each rule there exists because breaking it causes a
specific, usually silent, bug.

## License

MIT
