# AGENTS.md

Working notes for coding agents on **pretty-ui**. Read this before touching any
file. `CLAUDE.md` is a symlink to this file — one document, two names.

---

## What this project is

`@dofortech/pretty-ui` is an accessible React component library built on
[Base UI](https://base-ui.com) primitives, styled with CSS Modules and a design
system that rebuilds its entire palette from **one colour variable** using CSS
relative colour syntax — no JavaScript, no build step, no runtime theming layer.

Three things make it different from the usual component library, and every
decision in the repo follows from them:

1. **Nothing is hardcoded.** Colour, spacing, radius, duration and easing all
   come from tokens. A component that inlines `8px` or `#7c3aed` has broken
   theming, density, radius presets and reduced motion in one line.
2. **Accessibility is measured, not asserted.** The contrast harness sweeps
   ~119k in-gamut seeds and fails the build if any pair the ramp promises drops
   below its WCAG floor.
3. **The consumer always wins.** Everything ships inside `@layer pretty-ui.*`,
   which loses to unlayered author CSS. No `!important` anywhere.

### Layout

```
packages/ui             the library
  src/components/<name>/  <Name>.tsx · <Name>.module.css · index.ts
  src/styles/             layers · properties · tokens · motion · a11y · patterns
  scripts/                ramp.mjs · motion.mjs (source of truth) + generators
apps/docs               the docs site — Next.js 16, MDX, Shiki, Tailwind v4
  app/components/<name>/page.mdx   the written page
  app/globals.css                  the CSS that could not be a utility — read it
  app/tailwind.css                 the pretty-ui token bridge — read before styling anything
  components/styles.ts             class strings two components have to agree on
  lib/cn.ts                        clsx + a CONFIGURED tailwind-merge
  mdx-components.tsx               the prose typography, per element
  demos/<name>/<demo>.tsx          runnable demos, rendered AND shown as source
```

### Commands

```bash
pnpm dev                                    # docs site at :3000
pnpm build                                  # everything
pnpm typecheck                              # the real gate — there is no linter
pnpm --filter @dofortech/pretty-ui test     # contrast harness (--fine sweep)
pnpm --filter @dofortech/pretty-ui tokens   # regenerate generated CSS
pnpm --filter @dofortech/pretty-ui-docs registry  # regenerate the demo registry
```

`pnpm lint` is currently a no-op — neither package defines a `lint` script.
`typecheck` and `check:contrast` are the gates that actually catch things.

### Generated files — never edit by hand

| File | Source of truth | Regenerate with |
| :-- | :-- | :-- |
| `packages/ui/src/styles/tokens.color.css` | `scripts/ramp.mjs` | `pnpm ... tokens` |
| `packages/ui/src/styles/motion.css` | `scripts/motion.mjs` | `pnpm ... tokens` |
| `packages/ui/docs-data/props.json` | component TSX doc comments | `pnpm ... docgen` |
| `apps/docs/demos/registry.ts` | the files in `demos/` | `pnpm ... registry` |

If a value is missing, add it to the **table** in `ramp.mjs` / `motion.mjs` and
regenerate. Never patch the output.

The two CSS generators are not there to save typing — they exist because those
blocks carry **equalities that must hold and that CSS cannot express**:

```
:root                  ≡ [data-pui-motion="full"]      (23 declarations)
@media prefers-reduced ≡ [data-pui-motion="reduce"]    (23 declarations)
accent ramp            ≡ secondary ramp                (one shared curve)
```

`full` means "explicitly opt into base behaviour", so it must equal `:root`; the
in-page reduce control must match the OS preference exactly, or the motion
toggle and the user's system setting silently disagree. Hand-editing one side
and missing the other produces a bug visible only under a subtree
`data-pui-motion` — which is the one configuration nobody tests. Generating all
the blocks from one table makes that class of mistake impossible. Do not
"simplify" by inlining the output and deleting the scripts.

### When to run a generator

A cold `pnpm dev` or `pnpm build` runs all four for you: turbo's `dev` depends
on `^build`, and the library's `build` is `tokens && docgen && vite build`,
while the docs' `dev` and `build` both start with `build-registry`.

**So you only run these by hand after changing something while the dev server
is already running.** What the library leaves running is `vite build --watch`,
which does not re-run `tokens` or `docgen`.

| You changed | Run |
| :-- | :-- |
| a value in `scripts/ramp.mjs` | `tokens`, then `check:contrast` |
| a value in `scripts/motion.mjs` | `tokens` |
| a prop — added, renamed, removed, retyped, or its JSDoc | `docgen` |
| the *set* of files in `apps/docs/demos/` — added, renamed, moved, deleted | `registry` |

Nothing to regenerate when you edit a component's `.module.css` or `.tsx` body,
an MDX page, a docs component, or the *contents* of an existing demo —
`registry.ts` keys on the file set only, and `?raw` re-reads the bytes at build.

`check:contrast` pairs with `ramp.mjs` alone. It is the only thing that catches
a curve tweak silently dropping one hue band below AA, so do not skip it there
and do not bother running it anywhere else.

### Introducing a new token

Most new tokens are **not** generated. Find the family first:

| Token | Lives in | How to add one |
| :-- | :-- | :-- |
| `--pui-accent-*` `--pui-secondary-*` `--pui-gray-*` | generated `tokens.color.css` | add to the curve table in `ramp.mjs`, run `tokens`, then `check:contrast` |
| `--pui-duration-*` `--pui-ease-*` `--pui-travel-*` `--pui-scale-*` `--pui-spin-*` `--pui-pulse-*` `--pui-motion-*` | generated `motion.css` | add to the table in `motion.mjs`, run `tokens` |
| `--pui-color-*` `--pui-space-*` `--pui-radius-*` `--pui-control-*` `--pui-font-*` `--pui-shadow-*` `--pui-target-*` and the rest | hand-written `tokens.css` | edit the CSS; no generator involved |
| `--pui-focus-ring-*` | hand-written `a11y.css` | edit the CSS |
| `--pui-<component>-*` | the component's own root rule | not a global token — declare it at the top of `.root` |

For a hand-written token, the selector it goes on is load-bearing:

- **`:root, .pui-theme, [data-pui-theme]`** — if it derives from a seed a scope
  can override. It has to be restated on all three, because a `var()` inside an
  unregistered property resolves where it is *declared*, so a scope that
  overrides only the seed will not recompute it.
- **`:root` alone** — if a `data-pui-radius` / `data-pui-density` preset
  rewrites it (`--pui-radius-*`, `--pui-control-*`, `--pui-surface-p`,
  `--pui-list-item-py`). Restating these on the scope selectors ties at (0,1,0),
  the nearer element wins, and a demo frame inside a `pill`-themed page snaps
  back to the default radius.

Ask: *does a preset rewrite it?* Yes → `:root` alone, and restate it in **every**
preset block, since each preset is a complete statement rather than a patch.
No → all three selectors.

Register it in `properties.css` when it is an input consumed inside `calc()` or a
colour function — where one malformed value would poison everything derived from
it — or when it must animate, or needs a guaranteed fallback if no rule matched
(that is `--pui-direction`).

Then add the name to the inventory in `CONTRIBUTING.md` by hand. Nothing
regenerates that list, which is exactly how `--pui-direction` went missing.

**Generated output outranks any prose that describes it.** No script writes a
`.md` file — every list of tokens, props or demos appearing in documentation is
a hand-copied snapshot and is free to drift. When a doc and a generated file
disagree, the generated file is right and the doc is stale. Fix the doc; never
"correct" working code to match a list. Before deleting or renaming anything on
the authority of a written inventory, check it against the source:

```bash
grep -ho -- '--pui-[a-z0-9-]*\s*:' packages/ui/src/styles/*.css | sed 's/[[:space:]]*:$//' | sort -u
```

If you do find drift, update the prose in the same change — a stale list that
claims to be exhaustive is worse than no list.

---

## Design principles

**Tokens are the API.** Consume them; never invent a value. A typo in a `var()`
fails *silently* — the declaration becomes invalid at computed-value time and
the element inherits instead — so check the name against
`packages/ui/src/styles/*.css`, which is what actually ships. The inventory in
[`packages/ui/CONTRIBUTING.md`](packages/ui/CONTRIBUTING.md) is a readable
index of the same names, but it is hand-maintained and nothing regenerates it —
read it for orientation, not as proof a token does or does not exist. It is
currently missing `--pui-direction`, which `Switch` relies on for RTL.

**Two independent axes, not an exploding variant list.** `variant` is how loud
a component is; `tone` is which semantic colour set it draws from. Each tone
defines a handful of colour slots and each variant decides which slots become
background, text and border. Every combination then works for free. Resist
adding a third axis or a bespoke one-off variant.

**State lives on `data-*`, never in class names.** `data-variant`, `data-size`,
`data-tone`, `data-disabled`, `data-loading`. This is what lets a consumer
target states from plain CSS or Tailwind arbitrary variants
(`data-[variant=solid]:...`) without wrapping the component.

**Parts live on `data-pui`.** Every element a component renders carries
`data-pui="<component>"` (the `styles.root` element) or
`data-pui="<component>-<part>"` (the kebab-cased style key). The hashed CSS
Modules class names change between releases, so this marker is the only
selector a consumer can write against a part and keep — it is public API, and
renaming one is a breaking change. Full placement rules and the two exceptions
(SVG descendants, composed pretty-ui components) are rule 9 in
`CONTRIBUTING.md`.

**Component knobs are declared on the component's own root element.** A knob
like `--pui-button-radius` is declared at the top of `.root`, defaulting to a
semantic token. That placement is load-bearing: an element's own declaration
beats an inherited value, so knobs must be set *on that element*, while the
global tokens they resolve to can be re-pointed from `:root` or a theme scope.

**`className` goes last.** `clsx(styles.root, "pui-focus-ring", className)`.

**Layer discipline.** `reset → tokens → patterns → components → a11y →
overrides`. `a11y` sits after `components` on purpose: layer order outranks
specificity completely, so an accessibility override placed earlier can never
win. Forced-colors rules go in a separate `@layer pretty-ui.a11y` block at the
bottom of the file, not nested inside the components block.

**Accessibility beyond what Base UI gives you.** Two-tone focus rings carried by
`outline`; `.pui-focus-ring` on every focusable part, plus `data-focus-inset`
inside clipping containers; `.pui-hc-surface` on every floating surface; 24×24
minimum targets (SC 2.5.8); decorative SVG gets `aria-hidden`, and state that
matters goes in a `.pui-visually-hidden` span.

**Comments explain why, and what breaks otherwise.** This is the house style and
it is unusually strict here — read any existing `.module.css` header. A comment
that restates the code is noise; a comment that records the bug the line
prevents is the reason this codebase is maintainable. Match the density and the
tone of the file you are editing.

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
`[data-starting-style]` / `[data-ending-style]`. A transition can be cancelled
mid-flight, so closing a dialog while it is still opening reverses smoothly
instead of snapping. Keyframes cannot do this.

**2 — Never write `@media (prefers-reduced-motion)` in a component file.**
`motion.css` is the only place it exists. The tokens collapse their own
geometry: `--pui-travel-md` becomes `0px`, `--pui-scale-enter` becomes `1`. A
component that consumes tokens gets correct behaviour without knowing reduced
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
someone who cannot rely on fill colour, so they animate on a *duration* (the
tick draws via `stroke-dashoffset` over `pathLength="1"`), not on a travel or
scale token that would collapse. Where motion *is* suppressed, a non-positional
cue fades in — that is what `--pui-motion-off` and `--pui-pulse-dip` are for.

**7 — Hover is a colour cue by default; geometry is opt-in.** A hover lift moves
the hit box: with the pointer resting on the button's edge, the lift can hover
the element out from under the cursor and oscillate. Hence
`--pui-button-hover-lift` defaults to `0px`, with `--pui-control-hover-lift` /
`--pui-control-hover-scale` left undefined as the app-level escape hatch.

**8 — Snap in, spring out.** Press uses `--pui-duration-instant` so activation
feels immediate; release runs on the spring.

**9 — Animate `translate` and `scale` as independent properties,** not through
the `transform` shorthand, so two effects at different speeds do not fight over
one property. Reserve `transform` for the enter/exit gesture that has to
compose *on top* of them (see the nested-dialog stacking in `Dialog`).

**10 — Pair a spring easing with its matching duration token.** A shorter
duration truncates the spring mid-bounce and looks broken:
`--pui-ease-spring-snappy` goes with `--pui-duration-spring-snappy`.

**11 — Gate any literal geometry on `--pui-motion-ok`.** It is `1` normally and
`0` under reduced motion, so `calc(-1 * var(--x) * var(--pui-motion-ok))`
collapses to identity without a media query.

**12 — The inline axis has no logical form.** `translate` and `transform` are
physical, so anything moving along the inline axis multiplies its (always
positive) distance by `--pui-direction`, which is `1` in LTR and `-1` in RTL.
Test RTL — the demo frame has a toggle for it.

### Which duration to reach for

| Token | Use it for |
| :-- | :-- |
| `--pui-duration-instant` (1ms) | press feedback, anything that must feel immediate |
| `--pui-duration-fast` (160ms) | hover, colour changes, small fades, popup enter/exit |
| `--pui-duration-normal` (240ms) | dialog enter, larger surfaces |
| `--pui-duration-slow` (400ms) | rare; page-level transitions |
| `--pui-duration-move` (220ms) | positional moves measured at runtime (the Tabs indicator) |
| `--pui-duration-spring-*` | paired with the matching `--pui-ease-spring-*` |
| `--pui-duration-loop-*` | spinners and pulses; **never** collapsed, a 1ms loop is a WCAG 2.3.1 flashing hazard |

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
as the **`@dofortech/pretty-ui/tailwind.css` bridge** (source:
[`packages/ui/src/styles/tailwind.css`](packages/ui/src/styles/tailwind.css)),
which is the same file a consumer imports. It re-points Tailwind's theme at
the pretty-ui tokens, deletes the stock scales, and pins the cascade-layer
order `theme, base, pretty-ui, components, utilities` — for a consumer that
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
`--color-panel: var(--pui-color-panel)` on `:root` and points utilities at
*that* — which freezes the value at `:root`, because a `var()` inside an
unregistered custom property is substituted where it is declared. Every demo
renders inside `DemoFrame`, a `.pui-theme` scope carrying `data-theme` and
`data-pui-motion`, so `bg-panel` would keep the page's colour when the frame's
light/dark toggle is flipped. `inline` substitutes the token into the utility
itself (`background-color: var(--pui-color-panel)`), which resolves at the
element and makes scopes, `data-pui-density` and `data-pui-radius` all work.

**Tailwind's own scales are deleted, not extended.** `--color-*`, `--spacing-*`,
`--text-*`, `--radius-*`, `--shadow-*`, `--ease-*` and friends are reset to
`initial` and rebuilt from the pretty-ui tokens, so `bg-red-500`, `p-13` and
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
| `gap: var(--pui-space-5)` | `gap-5` — the eight steps map 1:1, so `gap-6` is 2rem, not Tailwind's stock 1.5rem |
| `padding: var(--pui-surface-p)` | `p-surface` |
| `font-size: var(--pui-font-size-2)` | `text-2` |
| `border-radius: var(--pui-radius-control)` | `rounded-control` (also `-surface`, `-pill`, and `rounded-1`…`6`) |
| `color: var(--pui-color-foreground-muted)` | `text-foreground-muted` |
| `transition-duration: var(--pui-duration-fast)` | `duration-fast` (namespace is `--transition-duration-*`) |
| `inline-size: min(32rem, 100%)` | `w-full max-w-lg` — the `--container-*` scale is untouched |
| the site's own measures | `h-header`, `scroll-mt-anchor`, `max-w-shell`, `max-w-measure`, `max-w-hero` |
| a layout breakpoint | `max-toc:`, `max-two-col:`, `max-split:`, `max-nav:` — named for the column that stops fitting |
| any other token | `h-(--pui-control-h-md)` — v4's shorthand for `var()`, and it resolves at the element |

Four named `@custom-variant`s exist because their guard is an `@supports`
nested in a `@media`, which the bracket syntax can express only as a class name
nobody reads twice — and the half that would get dropped in the shortening is
always the accessibility half: `frosted:` (backdrop blur, not under reduced
transparency), `scroll-driven:` (a view timeline exists), `gradient-text:`
(`background-clip: text` will actually paint, so not under forced colours).

Three things stay in a `style` object, and are not oversights:

- **Component knobs** — `--pui-spinner-thickness`, `--pui-button-radius`. They
  are declared on the component's own root for a reason (see *Design
  principles*), and a utility class cannot set an arbitrary custom property.
- **Anything gated on `--pui-motion-ok`.** A `translate-y-*` utility cannot
  carry the `calc(... * var(--pui-motion-ok))` that collapses it under reduced
  motion, so a demo that moves something writes CSS, the way a component does.
- **Values computed at runtime.**

### `cn`, and why it is configured

[`apps/docs/lib/cn.ts`](apps/docs/lib/cn.ts) is the usual
`twMerge(clsx(inputs))` plus an `extend` block, which is not optional.
tailwind-merge ships knowing Tailwind's DEFAULT theme, and the bridge replaced
most of it. A class it does not recognise is not an error — it is simply never
merged, so two competing values both survive and the cascade decides. Its stock
validators expect t-shirt sizes (`rounded-md`) or bare numbers (`p-4`), so
every renamed scale needs its actual names listed — and `text` / `shadow` for
a second reason: tailwind-merge's colour scale matches *any* value, so
`text-2` parses as a text *colour* and `cn("text-2", "text-foreground-muted")`
silently returns only the colour. Listing the steps makes them sizes again.
That same match-anything colour scale is why colours need no entry at all, and
neither do `font-*`, `font-weight-*`, `leading-*` or `tracking-*`, whose names
are Tailwind's own.

Like the bridge, the library half of this config ships with the package:
[`packages/ui/src/tailwind-merge.ts`](packages/ui/src/tailwind-merge.ts)
exports `tailwindMergeConfig` (plain data — the package does not depend on
tailwind-merge) covering `spacing: surface`, `text`, `shadow`, `radius`,
`ease` and the `duration` group. A ready-made helper built on it ships as
`@dofortech/pretty-ui/cn` ([`packages/ui/src/cn.ts`](packages/ui/src/cn.ts)),
which is why tailwind-merge is an *optional* peer dependency, externalised in
`vite.config.ts` — only that subpath needs it. The docs cannot use the shipped
`cn` precisely because of their extra keys, which makes `cn.ts` here the
worked example of the bring-your-own-keys path. `cn.ts` spreads it and adds only what the
DOCS added to the theme: `spacing: header/anchor`, `animate: reveal`, and the
`container` measures. **A key added to a scale still gets added in two files —
they are just paired by owner now**: a library token goes in the bridge and
`packages/ui/src/tailwind-merge.ts`; a docs measure goes in
`apps/docs/app/tailwind.css` and `cn.ts`. A name missed on the merge side does
not error, it just stops overriding its own family.

### What is still CSS, and why

[`globals.css`](apps/docs/app/globals.css) holds four blocks, each of which
targets something no class can reach:

- **A Preflight substitute** — `box-sizing` on every element, the `a` colour and
  underline reset, and the global `:focus-visible` ring. Preflight itself is
  deliberately not imported: it would strip the UA list markers and heading
  sizes the MDX prose builds on.
- **Shiki's output** — `pre.shiki`, `.shiki span`, `.line.highlighted`. It
  arrives as an HTML string from the highlighter or the rehype plugin; there is
  no element to hang a class on.
- **The palette cross-fade** — it transitions custom properties by name across
  `.themeTransition *`.

Prose typography is NOT in there. It lives in
[`mdx-components.tsx`](apps/docs/mdx-components.tsx), one class list per
element, which is what keeps it from reaching into a demo: a `<p>` inside a
demo is authored in the demo's own file and never passes through the mapping.
That is why the old `margin: revert-layer` rule aimed at the demo frame is
gone.

Layer order still matters: `pretty-ui.* → docs → theme, base, components,
utilities`, declared at the top of
[`apps/docs/app/globals.css`](apps/docs/app/globals.css) and fixed by the
import order in `layout.tsx`. It is what lets a utility beat the site's own
base rules without a single `!important`.

---

## Adding or changing a component

1. Read [`packages/ui/CONTRIBUTING.md`](packages/ui/CONTRIBUTING.md) first — it
   holds the full rule list and the token inventory. Every rule there exists
   because breaking it causes a specific, usually silent, bug.
2. Files: `<Name>.tsx` (`"use client"`), `<Name>.module.css` (inside
   `@layer pretty-ui.components`), `index.ts`. Register in `src/index.ts`.
3. Keep Base UI's anatomy. Do not invent parts the primitive does not have.
4. Declare knobs at the top of the root rule; consume tokens below.
5. Interactive parts: `.pui-focus-ring` (+ `data-focus-inset` inside a clipping
   container), a `cursor` per the table above, and a 24×24 minimum target.
6. Floating surfaces: `.pui-hc-surface`, and forced-colors rules in a separate
   `@layer pretty-ui.a11y` block.
7. Inside a `.module.css`, `.pui-*` selectors are **local** — CSS Modules hashes
   them and they match nothing. Wrap as `:global(.pui-icon)`, or better, target
   the element (`svg`) or rely on `currentColor`.
8. Write the doc comments on the props — `docgen` turns them into the prop table.
9. Add demos in `apps/docs/demos/<name>/`, regenerate the registry, and write
   the MDX page. Demos are imported twice from the same file (once to render,
   once through `?raw`), so the code shown is provably the code that runs —
   which is also why their layout is Tailwind rather than a `style` object; see
   *Styling the docs site* above.
10. Add the page to the `NAV` array in
    [`apps/docs/components/sidebar.tsx`](apps/docs/components/sidebar.tsx).

### Before you call it done

```bash
pnpm --filter @dofortech/pretty-ui typecheck
pnpm --filter @dofortech/pretty-ui test     # only if you touched ramp.mjs
pnpm dev                                    # then look at it
```

Check it in the docs demo frame with light **and** dark, LTR **and** RTL, and
the reduced-motion toggle — the frame has a control for each.

A scratch page under `apps/docs/app/` is a fine way to compare motion options
side by side while you work, but it is not a deliverable: delete it in the same
PR that ships the decision, the way `motion-lab/` went out with the Dialog exit
in #8.

---

## Things that will bite you

- A `var()` inside an unregistered custom property is substituted **where the
  property is declared**, not where it is used. This is why theme scopes have to
  re-declare the whole ramp, and why setting `--pui-accent-seed` on an arbitrary
  element does nothing.
- `transparent` is **not** preserved under forced-colors — it is replaced with a
  system colour. That is a feature (`.pui-hc-surface` relies on it) and a trap
  (the gap in `Spinner`'s ring would fill in).
- `opacity` is one of the few properties forced-colors does **not** override, so
  a `0.55` disabled control keeps full contrast and reads as enabled. `GrayText`
  at `opacity: 1` in the `a11y` layer is the fix.
- `position: relative` alone does not open a stacking context. Use `isolation:
  isolate` when you need one without a `z-index` side effect.
- Base UI keeps an outgoing panel mounted until its exit transition finishes.
  Overlap panels in one grid cell; stacking them in flow makes the component
  grow and snap back.
