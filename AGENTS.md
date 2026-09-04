# AGENTS.md

Working notes for coding agents on **forte-ui**. Read this before touching any
file. `CLAUDE.md` is a stub that `@`-imports this one — it was a symlink
until git checkouts on Windows proved that does not travel. Edit this file;
`CLAUDE.md` carries no content of its own.

---

## What this project is

`@forte-ui/react` is an accessible React component library built on
[Base UI](https://base-ui.com) primitives, styled with CSS Modules and a design
system that rebuilds its entire palette from **one color variable** using CSS
relative color syntax — no JavaScript, no build step, no runtime theming layer.

Three things make it different from the usual component library, and every
decision in the repo follows from them:

1. **Nothing is hardcoded.** Color, spacing, radius, duration and easing all
   come from tokens. A component that inlines `8px` or `#7c3aed` has broken
   theming, density, radius presets and reduced motion in one line.
2. **Accessibility is measured, not asserted.** The contrast harness sweeps
   ~119k in-gamut seeds and fails the build if any pair the ramp promises drops
   below its WCAG floor.
3. **The consumer always wins.** Everything ships inside `@layer forte.*`,
   which loses to unlayered author CSS. No `!important` anywhere.

### Layout

```
packages/react             the library
  src/components/<name>/  <Name>.tsx · <Name>.module.css · index.ts
  src/styles/             layers · properties · tokens · motion · a11y · patterns
  scripts/                ramp.mjs · motion.mjs (source of truth) + generators
packages/create-forte-ui   the scaffolding CLI (`pnpm create forte-ui`)
  src/templates.ts        the starter files — the getting-started GUIDES are its spec
  src/fonts.ts            the font catalog, MODULE OF RECORD (docs re-export it)
  src/color.ts            the color maths, MODULE OF RECORD (docs re-export it)
  scripts/smoke.mjs       scaffold+build all four paths — run before releasing it
apps/docs               the docs site — Next.js 16, MDX, Shiki, Tailwind v4
  app/page.tsx                     the home page — the one route outside the docs shell
  app/(docs)/layout.tsx            the docs shell: sidebar · page column · section rail
  app/(docs)/components/page.mdx          the component index — cards, from the catalog
  app/(docs)/components/<name>/page.mdx   the written page
  app/(docs)/changelog/page.mdx    GENERATED — the ten most recent releases, from the root CHANGELOG.md
  app/globals.css                  the CSS that could not be a utility — read it
  app/tailwind.css                 the forte-ui token bridge — read before styling anything
  components/styles.ts             class strings two components have to agree on
  components/site-header.tsx       the app bar — the shell's top row, on the library's AppBar
  components/analytics.tsx         Firebase page views — inert without NEXT_PUBLIC_FIREBASE_* in .env.local
  components/nav.tsx               the page list itself — rail and drawer share it
  components/sidebar.tsx           the page list — the shell's left column
  components/toc.tsx               the section rail — the shell's right column
  components/shell-drawers.tsx     both columns again, for screens without room
  components/toc-registry.ts       GENERATED — the rail's server-rendered seed
  components/component-catalog.ts  GENERATED — the library's catalog, resolved to routes
  components/component-index.tsx   the index page's cards, grouped by category
  lib/cn.ts                        clsx + a CONFIGURED tailwind-merge
  lib/env.ts                       the ONLY `process.env` reads — typed exports, nothing else touches the env
  lib/site.ts                      the site's ORIGIN and name — metadata, sitemap and cards all read it
  app/opengraph-image.tsx          the share card; four more, one per section, inherited by their pages
  components/og-card.tsx           the card renderer — satori, so no tokens, no CSS and no components
  lib/og-palette.ts                the cards' palette, derived from the seed defaults at build time
  app/robots.ts · app/sitemap.ts   the crawler files; the sitemap walks `app/` rather than trusting a list
  firebase.json                    hosting — and the one header rule the share cards cannot ship without
  mdx-components.tsx               the prose typography, per element
  demos/<name>/<demo>.tsx          runnable demos, rendered AND shown as source
```

### Commands

```bash
pnpm dev                                    # docs site at :3000
pnpm build                                  # everything
pnpm generate                               # re-run ALL six generators
pnpm typecheck                              # the real gate — there is no linter
pnpm test                                   # contrast harness (--fine) + popup parity
pnpm release                                # build packages/*, preview, confirm, publish
```

`pnpm generate` is the one to reach for after editing a source of truth while
the dev server is already running — it fans out to `generate` in both packages
(`tokens && docgen` in the library, `registry && changelog && toc && catalog`
in the docs).
The two used to run in parallel. They no longer can: `build-catalog.mjs` reads
the library's `docs-data/components.json` to resolve every component page, so
turbo orders the docs behind the library with `^generate` — otherwise a run that
adds a component reads the PREVIOUS run's catalog and emits a site index
missing the page that same run just created. A couple of seconds, and it is
deliberately **not** turbo-cached: these scripts write
checked-in files, so a cache hit on an unchanged input set would leave a hand
edit to `tokens.color.css` or `registry.ts` sitting in the tree — the exact
drift the command exists to repair.

Each generator still has its own script when you want just one:

```bash
pnpm --filter @forte-ui/react tokens         # the generated CSS
pnpm --filter @forte-ui/react docgen         # props.json + theming.json
pnpm --filter @forte-ui/react check:contrast # the ramp gate
pnpm --filter @forte-ui/react check:parity   # the popup-parity gate
pnpm --filter @forte-ui/docs registry  # the demo registry
pnpm --filter @forte-ui/docs changelog # the changelog page
pnpm --filter @forte-ui/docs toc       # the "On this page" seed
pnpm --filter @forte-ui/docs catalog   # the component index + the sidebar
```

`check:contrast` and `check:parity` are deliberately outside `generate` —
they are gates, not generators, and they write nothing.

Every root script is `turbo run <task>`, never the `turbo <task>` shorthand.
`generate` is *also* a built-in turbo command (the plop-based code generator)
and the shorthand loses to it, dropping into an interactive "add a custom
generator?" prompt instead of running the task. `run` everywhere means the next
task name to collide does not repeat this.

`pnpm lint` is currently a no-op — neither package defines a `lint` script.
`typecheck`, `check:contrast` and `check:parity` are the gates that actually
catch things.

### Generated files — never edit by hand

| File | Source of truth | Regenerate with |
| :-- | :-- | :-- |
| `packages/react/src/styles/tokens.color.css` | `scripts/ramp.mjs` | `tokens` |
| `packages/react/src/styles/motion.css` | `scripts/motion.mjs` | `tokens` |
| `packages/react/docs-data/props.json` | component TSX doc comments | `docgen` |
| `packages/react/docs-data/components.md` | `@summary` / `@category` / `@partOf` tags on component-root doc comments | `docgen` |
| `packages/react/docs-data/components.json` | the same tags — the catalog as data | `docgen` |
| `packages/react/docs-data/theming.json` | `/** … */` doc comments in component `.module.css` | `docgen` |
| `packages/react/docs-data/tokens.json` | every `--forte-*` declaration in `src/styles/*.css` | `docgen` |
| `apps/docs/demos/registry.ts` | the files in `demos/` | `registry` |
| `apps/docs/app/(docs)/changelog/page.mdx` | the root `CHANGELOG.md` — its ten most recent releases | `changelog` |
| `apps/docs/components/toc-registry.ts` | the h2/h3 headings in `app/**/page.mdx` | `toc` |
| `apps/docs/components/component-catalog.ts` | `docs-data/components.json` + the dirs under `app/(docs)/components/` | `catalog` |

`pnpm generate` from the root runs every row of that table.

If a value is missing, add it to the **table** in `ramp.mjs` / `motion.mjs` and
regenerate. Never patch the output.

The two CSS generators are not there to save typing — they exist because those
blocks carry **equalities that must hold and that CSS cannot express**:

```
:root                  ≡ [data-forte-motion="full"]      (23 declarations)
@media prefers-reduced ≡ [data-forte-motion="reduce"]    (23 declarations)
accent ramp            ≡ secondary ramp                (one shared curve)
```

`full` means "explicitly opt into base behavior", so it must equal `:root`; the
in-page reduce control must match the OS preference exactly, or the motion
toggle and the user's system setting silently disagree. Hand-editing one side
and missing the other produces a bug visible only under a subtree
`data-forte-motion` — which is the one configuration nobody tests. Generating all
the blocks from one table makes that class of mistake impossible. Do not
"simplify" by inlining the output and deleting the scripts.

### When to run a generator

A cold `pnpm dev` or `pnpm build` runs all six for you: turbo's `dev` depends
on `^build`, and both packages' `build` now starts with their own `generate` —
`generate && vite build` in the library, `generate && next build` in the docs.
That chaining is why the per-package `generate` scripts exist at all rather than
only the root one: it keeps the build's generator list and `pnpm generate`'s
from drifting apart.

**So you only run these by hand after changing something while the dev server
is already running.** What the library leaves running is `vite build --watch`,
which does not re-run `tokens` or `docgen`.

| You changed | Run |
| :-- | :-- |
| a value in `scripts/ramp.mjs` | `tokens`, then `check:contrast` |
| a value in `scripts/motion.mjs` | `tokens` |
| a prop — added, renamed, removed, retyped, or its JSDoc | `docgen` |
| a component root's `@summary` / `@category` / `@partOf` doc-comment tag | `docgen`, then `catalog` |
| the set of pages under `app/(docs)/components/` — added, renamed, removed | `catalog` |
| a theming knob in a `.module.css` — added, renamed, its default or its `/** … */` doc comment | `docgen` |
| any `--forte-*` declaration in `src/styles/*.css` — added, renamed, removed, its value or selector | `docgen` (rebuilds `tokens.json`; after a `ramp.mjs` / `motion.mjs` change run `tokens` first) |
| the *set* of files in `apps/docs/demos/` — added, renamed, moved, deleted | `registry` |
| a release section in the root `CHANGELOG.md` — added, or an entry reworded | `changelog`, then `toc` |
| an `##` / `###` heading in a `page.mdx` — added, renamed, reordered, removed | `toc` |

Nothing to regenerate when you edit the prose of an MDX page, a docs component,
the *contents* of an existing demo (`registry.ts` keys on the file set only, and
`?raw` re-reads the bytes at build), or the parts of a `.module.css` / `.tsx`
body that carry no doc comments — but a custom-property declaration under a
`/** … */` doc comment is published to `theming.json`, name and default
included, so touching one is a `docgen` change like editing a prop.

`toc` is the one that is safe to forget, and deliberately so. `toc-registry.ts`
is a SEED: it exists to put the "On this page" rail in the server HTML, because
the rail is rendered by the root layout and a layout cannot read its child
page's `tableOfContents` export. `Toc` then reconciles it against the rendered
headings on mount, so a heading renamed mid-session shows the NEW heading — the
stale seed costs a re-render nobody sees, not a wrong rail. Run it anyway
before committing, or the file lands in the diff on somebody else's next build.

`catalog` is the opposite of `toc`, and worth knowing before it stops a build.
It is a GATE as much as a generator: it resolves every catalog entry to a page
under `app/(docs)/components/` and fails if the two disagree in either
direction — a component with no page, or a page no component resolves to. There
is deliberately no fallback. An earlier draft resolved a missing page to the
component's source DIRECTORY, which is right for the four entries documented on
a sibling's page and silently wrong for the case that matters: a new component
whose page nobody wrote would have resolved to its neighbour's and looked
documented. The four say so themselves instead, with `@partOf` in the library
source, and everything else is an error naming the file to fix.

`check:contrast` pairs with `ramp.mjs` alone. It is the only thing that catches
a curve tweak silently dropping one hue band below AA, so do not skip it there
and do not bother running it anywhere else.

`check:parity` pairs with the anchored popups — Menu, Popover, PreviewCard,
Tooltip, NavigationMenu — whose enter/exit blocks are deliberate per-component
copies that must stay identical modulo their knob prefix, and whose arrow and
viewport mechanics are shared `.forte-popup-*` patterns in `patterns.css` that
each popup wires up by mapping its knobs onto generic `--forte-popup-*`
properties. Run it after touching any of those files; when it fails on a
change you meant, apply the change to every copy it names (the script header
has the details).

### Introducing a new token

Most new tokens are **not** generated. Find the family first:

| Token | Lives in | How to add one |
| :-- | :-- | :-- |
| `--forte-accent-*` `--forte-secondary-*` `--forte-gray-*` | generated `tokens.color.css` | add to the curve table in `ramp.mjs`, run `tokens`, then `check:contrast` |
| `--forte-duration-*` `--forte-ease-*` `--forte-travel-*` `--forte-scale-*` `--forte-spin-*` `--forte-pulse-*` `--forte-motion-*` | generated `motion.css` | add to the table in `motion.mjs`, run `tokens` |
| `--forte-color-*` `--forte-space-*` `--forte-radius-*` `--forte-control-*` `--forte-font-*` `--forte-shadow-*` `--forte-target-*` and the rest | hand-written `tokens.css` | edit the CSS; no generator involved |
| `--forte-focus-ring-*` | hand-written `a11y.css` | edit the CSS |
| `--forte-<component>-*` | the component's own root rule | not a global token — declare it at the top of `.root` |

For a hand-written token, the selector it goes on is load-bearing:

- **`:root, .forte-theme, [data-forte-theme]`** — if it derives from a seed a scope
  can override. It has to be restated on all three, because a `var()` inside an
  unregistered property resolves where it is *declared*, so a scope that
  overrides only the seed will not recompute it.
- **`:root` alone** — if a `data-forte-radius` / `data-forte-density` preset
  rewrites it (`--forte-radius-*`, `--forte-control-*`, `--forte-surface-p`,
  `--forte-list-item-py`). Restating these on the scope selectors ties at (0,1,0),
  the nearer element wins, and a demo frame inside a `pill`-themed page snaps
  back to the default radius.

Ask: *does a preset rewrite it?* Yes → `:root` alone, and restate it in **every**
preset block, since each preset is a complete statement rather than a patch.
No → all three selectors.

Register it in `properties.css` when it is an input consumed inside `calc()` or a
color function — where one malformed value would poison everything derived from
it — or when it must animate, or needs a guaranteed fallback if no rule matched
(that is `--forte-direction`).

Then run `docgen` — `tokens-docgen.mjs` rebuilds
`packages/react/docs-data/tokens.json`, the generated inventory of every global
token — and add the name to the readable list in `CONTRIBUTING.md` by hand.
Nothing regenerates that prose list, which is exactly how `--forte-direction`
went missing from it; when the two disagree, `tokens.json` is the one that is
right.

**Generated output outranks any prose that describes it.** No script writes a
`.md` file — every list of tokens, props or demos appearing in documentation is
a hand-copied snapshot and is free to drift. When a doc and a generated file
disagree, the generated file is right and the doc is stale. Fix the doc; never
"correct" working code to match a list. Before deleting or renaming anything on
the authority of a written inventory, check it against the source:

```bash
grep -ho -- '--forte-[a-z0-9-]*\s*:' packages/react/src/styles/*.css | sed 's/[[:space:]]*:$//' | sort -u
```

If you do find drift, update the prose in the same change — a stale list that
claims to be exhaustive is worse than no list.

---

## Design principles

**Tokens are the API.** Consume them; never invent a value. A typo in a `var()`
fails *silently* — the declaration becomes invalid at computed-value time and
the element inherits instead — so check the name against
`packages/react/src/styles/*.css`, which is what actually ships. The inventory in
[`packages/react/CONTRIBUTING.md`](packages/react/CONTRIBUTING.md) is a readable
index of the same names, but it is hand-maintained and nothing regenerates it —
read it for orientation, not as proof a token does or does not exist. It is
currently missing `--forte-direction`, which `Switch` relies on for RTL.

**Two independent axes, not an exploding variant list.** `variant` is how loud
a component is; `tone` is which semantic color set it draws from. Each tone
defines a handful of color slots and each variant decides which slots become
background, text and border. Every combination then works for free. Resist
adding a third axis or a bespoke one-off variant.

**State lives on `data-*`, never in class names.** `data-variant`, `data-size`,
`data-tone`, `data-disabled`, `data-loading`. This is what lets a consumer
target states from plain CSS or Tailwind arbitrary variants
(`data-[variant=solid]:...`) without wrapping the component.

**Parts live on `data-forte`.** Every element a component renders carries
`data-forte="<component>"` (the `styles.root` element) or
`data-forte="<component>-<part>"` (the kebab-cased style key). The hashed CSS
Modules class names change between releases, so this marker is the only
selector a consumer can write against a part and keep — it is public API, and
renaming one is a breaking change. Full placement rules and the two exceptions
(SVG descendants, composed forte-ui components) are rule 9 in
`CONTRIBUTING.md`.

**Component knobs are declared on the component's own root element.** A knob
like `--forte-button-radius` is declared at the top of `.root`, defaulting to a
semantic token. That placement is load-bearing: an element's own declaration
beats an inherited value, so knobs must be set *on that element*, while the
global tokens they resolve to can be re-pointed from `:root` or a theme scope.

**`className` goes last.** `clsx(styles.root, "forte-focus-ring", className)`.

**Layer discipline.** `reset → tokens → patterns → components → a11y →
overrides`. `a11y` sits after `components` on purpose: layer order outranks
specificity completely, so an accessibility override placed earlier can never
win. Forced-colors rules go in a separate `@layer forte.a11y` block at the
bottom of the file, not nested inside the components block.

**Accessibility beyond what Base UI gives you.** Two-tone focus rings carried by
`outline`; `.forte-focus-ring` on every focusable part, plus `data-focus-inset`
inside clipping containers; `.forte-hc-surface` on every floating surface; 24×24
minimum targets (SC 2.5.8); decorative SVG gets `aria-hidden`, and state that
matters goes in a `.forte-visually-hidden` span.

**Comments explain why, and what breaks otherwise.** This is the house style and
it is unusually strict here — read any existing `.module.css` header. A comment
that restates the code is noise; a comment that records the bug the line
prevents is the reason this codebase is maintainable. Match the density and the
tone of the file you are editing. The one sanctioned "what" comment is the
`/** … */` doc comment above a theming-knob declaration: it is not a comment so
much as published documentation — `theming-docgen` ships it to the docs site —
and it coexists with, never replaces, a `/* why */` note on the same knob.

---

## Pointer affordance — hard rule

> **Anything that performs an action gets `cursor: pointer` on hover.**
> Buttons, select triggers, dropdown options, tabs, switches, checkboxes,
> close buttons, links, menu items, clickable rows, icon buttons — all of them.

This has to be stated because the platform defaults are wrong for us in both
directions:

- A native `<button>` gets `cursor: default` from the UA stylesheet, not
  `pointer`.
- Base UI builds most parts out of `<div>` / `<span>`, which get `auto`.

Neither is what we want, so **every interactive part declares its cursor
explicitly**, on the part's own root rule.

We deliberately do *not* follow the "native `<select>` uses an arrow" desktop
convention. In this library a control that does something looks like it does
something. Consistency across the set beats matching a native widget that we do
not otherwise resemble.

### The decision table

| The element… | Cursor |
| :-- | :-- |
| performs an action on click / activation | `pointer` |
| is disabled | `not-allowed` |
| is read-only or otherwise inert but not disabled | `default` |
| is a label, caption, or other non-interactive chrome | `default` (with `user-select: none`) |
| is a text input or editable region | leave the UA `text` cursor alone |
| is decorative and sits inside an interactive part | `pointer-events: none`, so the parent's cursor shows through |

Order matters inside the file: the `pointer` declaration goes on the base rule,
and `[data-disabled]` / `[data-readonly]` override it further down.

```css
.root {
  cursor: pointer;
}

.root[data-readonly] {
  cursor: default;
}

.root[data-disabled] {
  cursor: not-allowed;
  opacity: 0.55;
}
```

Three places keep `default` on purpose — they are not oversights, leave them
alone: `Select`'s `.label` (a label, not a control, even though clicking it
focuses the trigger), `Select`'s `.scrollArrow` (scrolls on *hover*, is
`aria-hidden`, and is never the only route to an item), and `[data-readonly]` on
`Select` and `Switch` (inert, per the table above).

`Tooltip`'s trigger deliberately sets no cursor at all, because it is normally
composed with a control that has its own — see the comment in
`Tooltip.module.css`.

---

## Motion principles

Motion is **pure CSS**. There is no animation library and nothing is added to a
consumer's bundle. Springs are real damped-harmonic-oscillator solutions
sampled into `linear()` easings and resolved at author time.

**1 — Transitions, not keyframes, for enter and exit.** Use Base UI's
`[data-starting-style]` / `[data-ending-style]`. A transition can be canceled
mid-flight, so closing a dialog while it is still opening reverses smoothly
instead of snapping. Keyframes cannot do this.

**2 — Never write `@media (prefers-reduced-motion)` in a component file.**
`motion.css` is the only place it exists. The tokens collapse their own
geometry: `--forte-travel-md` becomes `0px`, `--forte-scale-enter` becomes `1`. A
component that consumes tokens gets correct behavior without knowing reduced
motion exists. Writing the query locally also tends to produce a hard
`transition: none`, which removes the opacity fade reduced-motion users
actually benefit from.

**3 — Never put an `infinite` animation on a Popup or Positioner part.** Base UI
awaits `Promise.all(el.getAnimations().map(a => a.finished))` to decide when a
popup may unmount, and an infinite animation's promise never settles — the
popup stays in the DOM forever. `getAnimations()` is not called with
`subtree: true`, so put spinners on an inner child.

**4 — Durations never reach `0s`.** At exactly zero no transition object is
created, so `transitionend` never fires and code awaiting it deadlocks. The
floor is `1ms`.

**5 — Reduce, do not remove.** Under reduced motion, geometry goes to zero but
durations only *shorten*. Scales interpolate toward `1`, never toward `0` —
`scale(calc(0.95 * ok))` would collapse the element to nothing.

**6 — Motion that carries information keeps working.** The Switch thumb's
position and the Checkbox tick are the only signal separating on from off for
someone who cannot rely on fill color, so they animate on a *duration* (the
tick draws via `stroke-dashoffset` over `pathLength="1"`), not on a travel or
scale token that would collapse. Where motion *is* suppressed, a non-positional
cue fades in — that is what `--forte-motion-off` and `--forte-pulse-dip` are for.

**7 — Hover is a color cue by default; geometry is opt-in.** A hover lift moves
the hit box: with the pointer resting on the button's edge, the lift can hover
the element out from under the cursor and oscillate. Hence
`--forte-button-hover-lift` defaults to `0px`, with `--forte-control-hover-lift` /
`--forte-control-hover-scale` left undefined as the app-level escape hatch.

**8 — Snap in, spring out.** Press uses `--forte-duration-instant` so activation
feels immediate; release runs on the spring.

**9 — Animate `translate` and `scale` as independent properties,** not through
the `transform` shorthand, so two effects at different speeds do not fight over
one property. Reserve `transform` for the enter/exit gesture that has to
compose *on top* of them (see the nested-dialog stacking in `Dialog`).

**10 — Pair a spring easing with its matching duration token.** A shorter
duration truncates the spring mid-bounce and looks broken:
`--forte-ease-spring-snappy` goes with `--forte-duration-spring-snappy`.

**11 — Gate any literal geometry on `--forte-motion-ok`.** It is `1` normally and
`0` under reduced motion, so `calc(-1 * var(--x) * var(--forte-motion-ok))`
collapses to identity without a media query.

**12 — The inline axis has no logical form.** `translate` and `transform` are
physical, so anything moving along the inline axis multiplies its (always
positive) distance by `--forte-direction`, which is `1` in LTR and `-1` in RTL.
Test RTL — the demo frame has a toggle for it.

### Which duration to reach for

| Token | Use it for |
| :-- | :-- |
| `--forte-duration-instant` (1ms) | press feedback, anything that must feel immediate |
| `--forte-duration-fast` (160ms) | hover, color changes, small fades, popup enter/exit |
| `--forte-duration-normal` (240ms) | dialog enter, larger surfaces |
| `--forte-duration-slow` (400ms) | rare; page-level transitions |
| `--forte-duration-move` (220ms) | positional moves measured at runtime (the Tabs indicator) |
| `--forte-duration-spring-*` | paired with the matching `--forte-ease-spring-*` |
| `--forte-duration-loop-*` | spinners and pulses; **never** collapsed, a 1ms loop is a WCAG 2.3.1 flashing hazard |

---

## Styling the docs site — Tailwind

The docs site is styled with Tailwind v4 and nothing else: there are no CSS
modules left in `apps/docs`, and `globals.css` is 159 lines of things a utility
class provably cannot express. Demos are still the reason it is set up this
way — a demo is documentation, so the class list a reader copies out of one is
the example they paste into their own app — but the chrome now uses the same
vocabulary, which is what stops the two drifting.

Reach for utilities instead of a `style={{ ... }}` object for anything that is
layout or typography.

The token mapping itself is no longer a docs file: it ships from the library
as the **`@forte-ui/react/tailwind.css` bridge** (source:
[`packages/react/src/styles/tailwind.css`](packages/react/src/styles/tailwind.css)),
which is the same file a consumer imports. It re-points Tailwind's theme at
the forte-ui tokens, deletes the stock scales, and pins the cascade-layer
order `theme, base, forte, components, utilities` — for a consumer that
statement is what stops Preflight (in `base`) from blanking the components
and keeps `utilities` able to beat them, which is why the bridge must be
imported *before* `tailwindcss`. Add a token family to the bridge and it
reaches the docs and every consumer at once; regenerating nothing — it is
hand-written CSS.

[`apps/docs/app/tailwind.css`](apps/docs/app/tailwind.css) imports the bridge
(its layer statement is a no-op there — `theme.css` and `globals.css` fixed
the order first, with the `docs` layer the bridge knows nothing about) and
keeps only what the DOCS own: the `@source` list, three named variants, and
the site's chrome measures. Three things about the setup are load-bearing:

**The theme is `@theme inline`, and must stay that way.** Plain `@theme` emits
`--color-panel: var(--forte-color-panel)` on `:root` and points utilities at
*that* — which freezes the value at `:root`, because a `var()` inside an
unregistered custom property is substituted where it is declared. Every demo
renders inside `DemoFrame`, a `.forte-theme` scope carrying `data-theme` and
`data-forte-motion`, so `bg-panel` would keep the page's color when the frame's
light/dark toggle is flipped. `inline` substitutes the token into the utility
itself (`background-color: var(--forte-color-panel)`), which resolves at the
element and makes scopes, `data-forte-density` and `data-forte-radius` all work.

**Tailwind's own scales are deleted, not extended.** `--color-*`, `--spacing-*`,
`--text-*`, `--radius-*`, `--shadow-*`, `--ease-*` and friends are reset to
`initial` and rebuilt from the forte-ui tokens, so `bg-red-500`, `p-13` and
`text-white` simply do not compile. That is the "nothing is hardcoded" rule
with teeth — those classes would survive review and then fail to respond to a
seed change.

**`@source` is an explicit list, and a missing entry fails quietly.** Automatic
detection would take its base directory from this file's location and miss both
`demos/` and `mdx-components.tsx`. An unscanned file's classes are simply never
emitted — and because most class names also appear somewhere scanned, the
breakage is partial: `mb-3` works, `mt-8` does not, and the page looks slightly
off rather than obviously broken. Add the path when you add the file.

| Want | Write |
| :-- | :-- |
| `gap: var(--forte-space-5)` | `gap-5` — the eight steps map 1:1, so `gap-6` is 2rem, not Tailwind's stock 1.5rem |
| `padding: var(--forte-surface-p)` | `p-surface` |
| `font-size: var(--forte-font-size-2)` | `text-2` |
| `border-radius: var(--forte-radius-control)` | `rounded-control` (also `-surface`, `-pill`, and `rounded-1`…`6`) |
| `color: var(--forte-color-foreground-muted)` | `text-foreground-muted` |
| `transition-duration: var(--forte-duration-fast)` | `duration-fast` (namespace is `--transition-duration-*`) |
| `inline-size: min(32rem, 100%)` | `w-full max-w-lg` — the `--container-*` scale is untouched |
| the site's own measures | `max-w-hero` — the header's height is the library's `--forte-app-bar-h-md`, read as `top-(--forte-app-bar-h-md)` |
| a layout breakpoint | `max-toc:`, `max-two-col:`, `max-split:`, `max-nav:` — named for the column that stops fitting |
| any other token | `h-(--forte-control-h-md)` — v4's shorthand for `var()`, and it resolves at the element |

Two named `@custom-variant`s exist because their guard is one the bracket
syntax can express only as a class name nobody reads twice — and the half
that would get dropped in the shortening is always the accessibility half:
`scroll-driven:` (a view timeline exists), `gradient-text:`
(`background-clip: text` will actually paint, so not under forced colors).
There is no `frosted:` any more: the site header is the library's `AppBar`
with `variant="frosted"`, and the blur guard lives in the component.

Three things stay in a `style` object, and are not oversights:

- **Component knobs** — `--forte-spinner-thickness`, `--forte-button-radius`. They
  are declared on the component's own root for a reason (see *Design
  principles*), and a utility class cannot set an arbitrary custom property.
- **Anything gated on `--forte-motion-ok`.** A `translate-y-*` utility cannot
  carry the `calc(... * var(--forte-motion-ok))` that collapses it under reduced
  motion, so a demo that moves something writes CSS, the way a component does.
- **Values computed at runtime.**

### Icons

The docs site draws its icons from **lucide-react**, with the one GitHub mark
coming from **react-icons** (`SiGithub`) because lucide dropped its brand set
and a brand mark should be the owner's own. Both are DOCS dependencies: the
library ships no icon catalog today, and when it grows one these imports are
what changes.

Size them with the `ICON` string from `components/styles.ts`
(`size-4 shrink-0`), never the libraries' own `size` prop — `size-4` is
`--forte-space-4` and a number is a number. Do **not** add `.forte-icon`: it sets
`fill: currentColor`, which is right for the solid glyphs the library's
components draw and turns a stroked outline into a solid blob.

### `cn`, and why it is configured

[`apps/docs/lib/cn.ts`](apps/docs/lib/cn.ts) is the usual
`twMerge(clsx(inputs))` plus an `extend` block, which is not optional.
tailwind-merge ships knowing Tailwind's DEFAULT theme, and the bridge replaced
most of it. A class it does not recognize is not an error — it is simply never
merged, so two competing values both survive and the cascade decides. Its stock
validators expect t-shirt sizes (`rounded-md`) or bare numbers (`p-4`), so
every renamed scale needs its actual names listed — and `text` / `shadow` for
a second reason: tailwind-merge's color scale matches *any* value, so
`text-2` parses as a text *color* and `cn("text-2", "text-foreground-muted")`
silently returns only the color. Listing the steps makes them sizes again.
That same match-anything color scale is why colors need no entry at all, and
neither do `font-*`, `font-weight-*`, `leading-*` or `tracking-*`, whose names
are Tailwind's own.

Like the bridge, the library half of this config ships with the package, in
two tiers. [`packages/react/src/tailwind-merge.ts`](packages/react/src/tailwind-merge.ts)
exports `tailwindMergeConfig` (plain data — the package does not depend on
tailwind-merge) covering `spacing: surface`, `text`, `shadow`, `radius`,
`ease` and the `duration` group. On top of it,
[`packages/react/src/cn.ts`](packages/react/src/cn.ts) ships `cn` (pre-configured)
and `createCn(extension)` — the extension routes through tailwind-merge's
`mergeConfigs`, whose `extend` APPENDS to a scale, so app keys land beside
the library's instead of replacing them. That subpath is why tailwind-merge
is an *optional* peer dependency, externalised in `vite.config.ts`. The docs'
`cn.ts` is `createCn` with the three DOCS-owned additions (`spacing:
header/anchor`, `animate: reveal`, the `container` measures) — the worked
example of the extend path. `cn.ts` spreads it and adds only what the
DOCS added to the theme: `spacing: header/anchor`, `animate: reveal`, and the
`container` measures. **A key added to a scale still gets added in two files —
they are just paired by owner now**: a library token goes in the bridge and
`packages/react/src/tailwind-merge.ts`; a docs measure goes in
`apps/docs/app/tailwind.css` and `cn.ts`. A name missed on the merge side does
not error, it just stops overriding its own family.

### What is still CSS, and why

[`globals.css`](apps/docs/app/globals.css) holds four blocks, each of which
targets something no class can reach:

- **A Preflight substitute** — `box-sizing` on every element, the `a` color and
  underline reset, and the global `:focus-visible` ring. Preflight itself is
  deliberately not imported: it would strip the UA list markers and heading
  sizes the MDX prose builds on.
- **Shiki's output** — `pre.shiki`, `.shiki span`, `.line.highlighted`. It
  arrives as an HTML string from the highlighter or the rehype plugin; there is
  no element to hang a class on.
- **The palette cross-fade** — the clock for the `::view-transition-*(root)`
  pseudo-elements the home page's swatches fade through; a pseudo-element has
  no element to carry a class.

Prose typography is NOT in there. It lives in
[`mdx-components.tsx`](apps/docs/mdx-components.tsx), one class list per
element, which is what keeps it from reaching into a demo: a `<p>` inside a
demo is authored in the demo's own file and never passes through the mapping.
That is why the old `margin: revert-layer` rule aimed at the demo frame is
gone.

There is no reading measure anywhere, and that is deliberate. A component
page's column is full width — a prop table, a sixteen-cell demo and a long
import line all want the room — and the paragraphs now run to the same right
edge as the demo frame under them. A 48rem cap on `p` / `ul` / `ol` did exist,
and it read as a layout bug: a paragraph stopping a couple of hundred pixels
short of the code block beneath it looks broken, not readable. The only width
on a component page is the page COLUMN's own cap in `app/(docs)/layout.tsx`. Do not
reintroduce a per-element one; `--container-measure` is gone from the theme
along with it.

Layer order still matters: `forte.* → docs → theme, base, components,
utilities`, declared at the top of
[`apps/docs/app/globals.css`](apps/docs/app/globals.css) and fixed by the
import order in `layout.tsx`. It is what lets a utility beat the site's own
base rules without a single `!important`.

---

## Adding or changing a component

1. Read [`packages/react/CONTRIBUTING.md`](packages/react/CONTRIBUTING.md) first — it
   holds the full rule list and the token inventory. Every rule there exists
   because breaking it causes a specific, usually silent, bug.
2. Files: `<Name>.tsx` (`"use client"`), `<Name>.module.css` (inside
   `@layer forte.components`), `index.ts`. Register in `src/index.ts`.
3. Keep Base UI's anatomy. Do not invent parts the primitive does not have.
4. Declare knobs at the top of the root rule; consume tokens below.
5. Interactive parts: `.forte-focus-ring` (+ `data-focus-inset` inside a clipping
   container), a `cursor` per the table above, and a 24×24 minimum target.
6. Floating surfaces: `.forte-hc-surface`, and forced-colors rules in a separate
   `@layer forte.a11y` block.
7. Inside a `.module.css`, `.forte-*` selectors are **local** — CSS Modules hashes
   them and they match nothing. Wrap as `:global(.forte-icon)`, or better, target
   the element (`svg`) or rely on `currentColor`.
8. Write the doc comments on the props — `docgen` turns them into the prop
   table. Same for the knobs: a `/** … */` doc comment directly above a
   `--forte-<component>-*` declaration publishes it (name, declared default,
   part, and every reassigning selector) to `theming.json`, which is where the
   docs' `<ThemingTable />` reads from. A knob without one does not appear.
   Plain `/* … */` comments stay private — the why/what split is deliberate.
   The root's doc comment additionally carries `@summary` (a one-line
   when-to-use, naming the nearest alternative where one is confusable) and
   `@category` (one of the six buckets in `docgen.mjs`) — `docgen` assembles
   them into `docs-data/components.md`, the catalog agents pick components
   from, and `components.json`, the same data, which the docs site builds its
   component index and its sidebar out of. It **fails the build** if either tag
   is missing, so this step cannot be skipped. A third tag, `@partOf <Component>`,
   is for the exception: an entry documented on a sibling's page rather than one
   of its own — `AlertDialog` on Dialog's, `KbdGroup` on Kbd's. It must name a
   catalog entry in the same directory, and it is what keeps a component with
   a genuinely missing page from being mistaken for one of these.
9. Add demos in `apps/docs/demos/<name>/`, regenerate the registry, and write
   the MDX page. Demos are imported twice from the same file (once to render,
   once through `?raw`), so the code shown is provably the code that runs —
   which is also why their layout is Tailwind rather than a `style` object; see
   *Styling the docs site* above.
10. Run `catalog`, then `toc`. There is no navigation list to edit: the
    Components group in
    [`apps/docs/components/nav.tsx`](apps/docs/components/nav.tsx) — the list
    `Sidebar` and the navigation drawer both render — and the cards on
    `/components/` are both spread in from `component-catalog.ts`, so `catalog`
    adds the page to the rail, the phone and the index at once. It also fails
    if the page and the component do not line up, which is the point.
    `toc` then puts the right-hand "On this page" rail in the server HTML for
    the new route. It will find the headings without you — reading them off the
    rendered page is what it falls back to — but until the seed is regenerated
    they arrive a frame after hydration instead of with the document.

### Before you call it done

```bash
pnpm --filter @forte-ui/react typecheck
pnpm --filter @forte-ui/react test     # only if you touched ramp.mjs
pnpm dev                                    # then look at it
```

Check it in the docs demo frame with light **and** dark, LTR **and** RTL, and
the reduced-motion toggle — the frame has a control for each.

A scratch page under `apps/docs/app/` is a fine way to compare motion options
side by side while you work, but it is not a deliverable: delete it in the same
PR that ships the decision, the way `motion-lab/` went out with the Dialog exit
in #8.

Do **not** add a `CHANGELOG.md` entry for it. That file belongs to release prep
alone — see *Releases and the changelog* below.

---

## Releases and the changelog

> **Never edit `CHANGELOG.md` as part of a feature, fix or refactor.** It is
> written during release prep and nowhere else — by `/release-prep`, or by hand
> when the user explicitly asks for a changelog entry. Shipping a change does
> not mean logging it.

The reason is that the changelog is drafted from the **diff over a commit
range**, in one pass, by someone looking at the whole release. Entries added
one commit at a time are written without that view: they duplicate what
`/release-prep` will find anyway, they conflict on every merge because every
branch appends to the same `[Unreleased]` block, and they describe a change as
its author saw it mid-work rather than as a consumer will meet it. A missing
entry is recovered from the diff in seconds; a wrong or duplicated one has to
be spotted first.

So: make the change, and stop. If a change genuinely needs a note the diff
cannot carry — a migration step, a reason a breaking change was worth it — say
it in the PR body or the commit message, which is where `/release-prep` reads
from.

The site's `/changelog/` page is GENERATED from the file —
`apps/docs/scripts/build-changelog.mjs` emits the ten most recent releases as
an MDX page, verbatim, with a link to the file for the rest — so an entry is
fixed in `CHANGELOG.md` and nowhere else, and a release edit is not finished
until `pnpm --filter @forte-ui/docs changelog` and `toc` have run and their
output is committed alongside it. `/release-prep` does that in its APPLY
phase; miss it by hand and `pnpm release` refuses the tree, because the
build's generators change a tracked file. The script is also a gate: a
heading that is not `## [<version>] - <YYYY-MM-DD>`, a version with no link
definition at the foot, or an entry MDX cannot compile (a bare `<` or `{`
outside a code span) fails the build naming the `CHANGELOG.md` line.

`CHANGELOG.md` at the repo root follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and is ordered
**newest first**: `[Unreleased]` stays at the top, and a new version heading is
inserted directly below it, above every existing version — never appended to
the bottom. Cutting a release renames that section to the new version with a
date, re-creates an empty `[Unreleased]` above it, and updates the comparison
links at the bottom of the file.

The publishable packages — `@forte-ui/react`, `forte-ui`, `create-forte-ui` —
carry **one version number and move in lockstep**: a release bumps every one
of them, including a package nothing in the range touched. An unchanged
package gets no changelog section, but it still gets the bump; a release that
moves one and leaves the others behind is drift, and the next one has to
repair it. `apps/docs/package.json` mirrors the same number even though the
docs app is private and never published: the site is a snapshot of one
library version, and `pnpm release` refuses to run if the two disagree. The
version the site *shows* — the pill in the app bar and in the home page hero,
both from `apps/docs/lib/version.ts` — is read from `@forte-ui/react`'s own
`package.json` at build time, never from the docs' copy.

Publishing is `pnpm release` — [`scripts/release.mjs`](scripts/release.mjs),
a plain script rather than a turbo task because the unit of work is the whole
set and turbo's TUI cannot ask "publish these?" once. It refuses a dirty tree
or a branch other than `main`, builds `packages/*` through turbo, refuses
again if the build's generators changed a tracked file, prints each package's
local version next to what the registry currently serves under the dist-tag
(`alpha` for a `-alpha.N` version, `latest` for a stable one), asks, and
runs `pnpm -r publish`, which skips versions already on npm and orders the
alias after `@forte-ui/react`. It must stay on `pnpm publish`: `forte-ui`
depends on the library as `workspace:^`, which pnpm rewrites in the tarball
and npm ships verbatim. A successful publish creates the `v<version>` tag,
because `/release-prep` reads the last `v*` tag as the start of the next
range, and pushes `main` and the tag to origin; a failed push prints the
command to retry rather than failing the run, since the upload has already
happened. `--dry-run`, `--yes`, `--skip-build`, `--tag <t>` and `--otp <code>`
(one authenticator code forwarded to every publish) are the flags.

Within a release, entries are grouped by **component** — `### NavList`, plus
`### Design tokens & motion`, `### General`, and a section per other
publishable package (`### create-forte-ui`) for what belongs to no single
one — rather than by Keep a Changelog's Added/Changed/Fixed buckets. A library
this size changes one component at a time, and that is the axis a reader
upgrades along. Breaking entries lead with `**Breaking:**`. `/release-prep`
drafts a section in exactly this shape.

---

## Things that will bite you

- A `var()` inside an unregistered custom property is substituted **where the
  property is declared**, not where it is used. This is why theme scopes have to
  re-declare the whole ramp, and why setting `--forte-accent-seed` on an arbitrary
  element does nothing.
- `transparent` is **not** preserved under forced-colors — it is replaced with a
  system color. That is a feature (`.forte-hc-surface` relies on it) and a trap
  (the gap in `Spinner`'s ring would fill in).
- `opacity` is one of the few properties forced-colors does **not** override, so
  a `0.55` disabled control keeps full contrast and reads as enabled. `GrayText`
  at `opacity: 1` in the `a11y` layer is the fix.
- `position: relative` alone does not open a stacking context. Use `isolation:
  isolate` when you need one without a `z-index` side effect.
- Base UI keeps an outgoing panel mounted until its exit transition finishes.
  Overlap panels in one grid cell; stacking them in flow makes the component
  grow and snap back.
- The getting-started guides are executable: `create-forte-ui`'s templates
  mirror their setup steps file for file. Change a setup step in a guide and
  change `packages/create-forte-ui/src/templates.ts` in the same PR (and vice
  versa); `pnpm --filter create-forte-ui smoke` builds all four paths and is
  the check.
- Vite's CSS pipeline rewrites `@layer` statements (Tailwind's compiler
  re-slots them, the minifier merges them), so the bridge's own layer-order
  statement does not survive a stock Vite + Tailwind app — Preflight ends up
  beating the components and buttons render as bare text. The fix is a
  document-level pin: `<style>@layer theme, base, forte, components,
  utilities;</style>` in `index.html`'s head. The Vite guide documents it and
  the scaffolder writes it. Next.js keeps the statement intact but has its own
  version of the race: it emits CSS in import order, and the library's
  component CSS arrives with the library's JS. A layout that imports
  `@forte-ui/react` (for `ThemeToggle`) *above* `./globals.css` ships a
  stylesheet that opens with `@layer forte.components { … }`, which pins
  `forte` first and hands Preflight the same win. `./globals.css` must be the
  root layout's first import; the Next.js guide and `nextLayoutTsx` in the
  scaffolder both say so, and the scaffolder used to get it wrong.
- Do not put a `transition` on the registered seeds to cross-fade a palette.
  The home page did, and in the desktop app's Chromium (148) every
  `border: 1px solid var(--…)` shorthand on the page — Card, the outline
  Button — painted its edge in `currentColor` for the length of the fade,
  while a longhand `border-color: var(--…)` on the same token held. It does
  not reproduce on a forced style read mid-fade, nor in headless Chrome 152;
  only a screen recording of a live fade shows it. It was also a full-page
  style recalc per frame, ~100ms each. The palette cross-fade is a view
  transition now (`hero-themer.tsx`): one recalc, then a compositor fade
  between two snapshots.
- A generated `opengraph-image.tsx` emits a file with **no extension** —
  `out/opengraph-image`, and `out/components/opengraph-image-1pqg0z` for a
  nested one, where the suffix changes with the content. Firebase Hosting
  types a response from its extension, so those ship as
  `application/octet-stream`, and X, Discord, Slack and Facebook all reject a
  non-image content-type: the card silently does not render, which looks
  exactly like having no card at all. The fix is the `headers` block in
  `apps/docs/firebase.json`, matching `**/opengraph-image*` and
  `**/apple-icon*` — a PREFIX match, because of that content hash. Verify it
  the way it was verified the first time, against the real thing rather than
  against a guess about globs:

  ```bash
  cd apps/docs && pnpm build && firebase emulators:start --only hosting
  ```

  then `curl -sI` each image route and read the `Content-Type`. Note the
  emulator falls back off port 5000 on macOS, where AirPlay Receiver holds it
  — read the port out of its own banner.
- The root layout's `openGraph` deliberately carries **no `title` and no
  `description`**, and adding either quietly breaks every other page. Next
  REPLACES `openGraph` rather than merging it, and no `page.mdx` declares one,
  so whatever is written there wins on all sixty-eight routes — every
  component page would share as "Forte UI". Left unset, Next's own
  `inheritFromMetadata` fills them at the end of resolution from the page's
  own resolved title and description, which is what gives `/components/dialog/`
  its real title for free. `twitter` is the same, one level on: it auto-fills
  from the resolved `openGraph`, so it only carries the card type and the
  account.
- Every metadata image route needs `export const dynamic = "force-static"`.
  Under `output: "export"` Next refuses to collect page data for a route
  handler that has not declared itself static, and an `opengraph-image`
  compiles to one — in an error naming `dynamic` and `revalidate` that reads
  as though the image were request-dependent. It cannot be re-exported from a
  shared module: route segment config is read off the route module itself.
