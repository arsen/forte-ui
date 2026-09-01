# Changelog

<!--
  Newest first. A new release is inserted directly below [Unreleased] —
  above every existing version — never appended to the bottom.
-->

All notable changes to the forte-ui packages — `@forte-ui/react`, `forte-ui` and `create-forte-ui` — are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-alpha.5] - 2026-09-01

### create-forte-ui

- Added a `--library` flag that pins the version spec used for the `@forte-ui/react` install — exact (`1.0.0-alpha.4`), a dist-tag (`alpha`), or a range — forwarded to the package manager unvalidated, so a bad spec fails with the registry's own error naming the exact spec rather than a generic "re-run the install" suggestion. It's a dev/CI knob only: no interactive prompt asks for it, and the Theme Studio's "Scaffold this theme" dialog does not use it. Defaults to the `latest` dist-tag, unchanged from before.
- The scaffolder now installs the forte-ui agent skill (`skills add arsen/forte-ui -s forte-ui`) into the new project by default, so AI tooling working in the scaffolded app starts past the library's documented traps. A new `--no-skill` flag opts out on its own; `--no-install` continues to skip it along with everything else it installs. A failed skill install now only warns, with the manual command to retry, instead of failing the scaffold — the app itself is unaffected.

## [1.0.0-alpha.4] - 2026-08-31

### Button

- Added `--forte-button-icon-size`, a size-scaled token that sizes an `<svg>` dropped directly into a button's content — an unsized icon set's default (lucide draws at 24px) no longer inflates `iconOnly`'s square. Reassigned per `size`; a consumer wanting a different size sets `--forte-button-icon-size` directly, or wins outright with an unlayered rule or a utility class on the icon.

### Calendar

- Fixed a selected day that was also today repainting its number in the accent colour instead of the fill's own text colour; today's marker now only applies when the day is not selected, so the `on-primary` / `primary` pair holds.
- Fixed `--forte-calendar-day-radius` pointing at a raw scale step (`--forte-radius-2`) instead of the semantic `--forte-radius-control`, so a day cell now follows the `soft` and `pill` `data-forte-radius` presets like every other control — previously only `none` had any effect.

### Card

- New component: a static grouping surface with eight parts — `Card.Root`,
  `Card.Header`, `Card.Title`, `Card.Description`, `Card.Action`,
  `Card.Content`, `Card.Footer` and `Card.Media` — replacing the hand-rolled
  `rounded-surface border border-border-muted bg-panel p-surface` panel.
  Three variants (`outline`, `soft`, `elevated`) share one footprint: the
  border is reserved even where it is painted transparent, so switching
  variants moves nothing and forced-colors mode keeps an edge on all three.
  Padding is a single `--forte-card-p` knob driven by `data-forte-density`,
  and `Card.Media` spends it locally to run edge to edge, clipping itself to
  the card's corner radius when it opens or closes the card. The parts are
  also exported flat (`CardRoot`, `CardHeader`, …) for React Server
  Components, where the `Card.Root` spelling cannot cross the client
  boundary.

### Kbd

- New component: `Kbd`, a key cap rendering a real `<kbd>` element, and
  `KbdGroup` for chords and sequences drawn as separate caps. The cap derives
  its fill and edge from `currentColor`, so the same cap works in running
  text, on `Tooltip`'s inverted popup, inside a solid `Button` and on a
  highlighted menu row; its text is pinned LTR with `unicode-bidi: isolate`
  so glyph chords (`⌘X`) do not reorder in RTL pages. Themeable through
  `--forte-kbd-*` knobs.

### Menu

- `Menu.Shortcut` now draws its keys in a composed `Kbd` cap instead of bare
  dimmed text; the wrapper `<span>` (and its `data-forte="menu-shortcut"`
  marker, `aria-hidden` behaviour and row positioning) is unchanged, and the
  cap inherits the row's muted/highlighted colour.

### Select

- `Select.Popup`'s `align` now defaults to `"start"` instead of falling through to Base UI's `"center"`, matching `Menu` — a popup wider than its trigger drops from the trigger's start edge instead of hanging off both. Only affects the dropdown-style placement reached with `alignItemWithTrigger={false}` (or Base UI's own touch/tight-viewport fallback); the default aligned mode ignores `align` entirely.

### Tabs

- Fixed the `pill` variant's strip radius being measured against `--forte-tabs-radius` (the panel's radius) instead of the indicator's own `--forte-tabs-indicator-radius`, so the strip's curve is now concentric with the pill it contains at every `data-forte-radius` preset — previously only `none` and `pill` happened to agree. A `pill` tab's own corners now match the indicator too, so its focus ring and hover fill trace the same shape as the thumb underneath.

### Tooltip

- **Breaking:** `Tooltip.Shortcut` is now a composed `Kbd` — it renders a
  `<kbd>` element carrying `data-forte="kbd"` instead of a `<span>` carrying
  `data-forte="tooltip-shortcut"`. Scope it from outside as
  `[data-forte="tooltip-popup"] [data-forte="kbd"]`. The
  `--forte-tooltip-shortcut-*` knobs keep working — they now re-point the
  cap's `--forte-kbd-*` set — and `TooltipShortcutProps` gains `Kbd`'s
  `render` prop.
- Fixed the popup breaking mixed inline content: it was a flex column, so
  prose like `Press <Kbd>?</Kbd> to search` split into three stacked flex
  items with the whitespace between them dropped. The popup is now block-flow
  at rest and only becomes a flex row when a `Tooltip.Shortcut` is present.

### create-forte-ui

- New package: `pnpm create forte-ui` (or `npm create forte-ui@latest`) scaffolds a fresh app already wired up with forte-ui. It runs `create-vite` / `create-next-app` non-interactively for the framework half and then applies only the forte-ui overlay — the same steps as the [getting-started guides](https://forte-ui.com/getting-started/nextjs/), which are its spec, so a scaffolded app diffs against the walkthrough and shows only your own answers. Four questions (name, framework, Tailwind, accent colour) reach a running app; secondary colour, neutral tint, radius, density, motion and fonts hide behind one "customize further?" gate. Every prompt has a flag twin (`--seed`, `--radius`, `--font-sans`, `--pm`, `--yes`, `--no-install`, …), so the [Theme Studio](https://forte-ui.com/theme/)'s "Scaffold this theme" dialog can hand back a complete, copy-pasteable command line. A skipped answer writes nothing — no restated defaults, no attributes for default presets — so the scaffolded app keeps following the library's own defaults as they change. `pnpm --filter create-forte-ui smoke` builds all four framework × Tailwind combinations against the workspace library as its drift check.

### Design tokens & motion

- Consolidated the anchored-popup arrow (geometry, SVG sizing, forced-colors repaint) and content-swap viewport mechanics — previously hand-copied across `Popover`, `PreviewCard`, `Tooltip` and `NavigationMenu` — into shared `.forte-popup-*` patterns in `patterns.css`, and the duplicated `--available-width` registered property into one `--forte-popup-available-width` in `properties.css`. Each component's own `--forte-*` knobs, defaults and `data-forte` markers are unchanged; a build that imports only one of `Popover` / `PreviewCard` no longer risks shipping without the shared property's registration.

### General

- Fixed a docs-data generation bug where two parts sharing a prop name in one file (for example `ScrollArea.Root`'s `orientation="both"` and `ScrollArea.Scrollbar`'s `orientation="vertical"`) could overwrite each other's documented default in the published `docs-data/props.json`; defaults are now read from each component's own declaration.

## [1.0.0-alpha.3] - 2026-08-31

### Button

- Fixed `data-icon-only` being silently erased when `Button` is composed as
  another forte-ui component's `render` target (for example
  `<DialogClose render={<Button iconOnly />} />`); the button's own value now
  survives Base UI's prop merge instead of being overwritten by the outer
  part's unset attribute.

### Dialog

- Fixed `DialogClose`'s `data-icon-only` attribute clobbering a composed
  `render` target's own value — `<DialogClose render={<Button iconOnly />} />`
  no longer un-squares the button.

### Drawer

- A drawer rendered without its scrim (`backdrop={false}`) now draws a
  hairline border, marked on the popup as `data-no-backdrop` and themed by the
  new `--forte-drawer-border-width` / `--forte-drawer-border-color` knobs.
  Without the dim, the shadow was the only thing separating the surface from
  the page, which in dark mode is nearly nothing. On an `edge` drawer the side
  resting against the screen edge stays borderless, so an overdrag does not
  expose the hairline as a seam across the skirt.
- Fixed a non-modal drawer (`modal={false}`) making the entire page
  unclickable while open: the full-screen viewport that positions the popup
  was silently absorbing every pointer event aimed at the page. The viewport
  is now permanently `pointer-events: none` with the popup restoring its own
  events — modal behaviour (scrim, outside-press dismissal) and the
  click-through during the exit animation are unchanged.
- Fixed `DrawerClose`'s `data-icon-only` attribute clobbering a composed
  `render` target's own value, the same fix as `Dialog` and `Popover`'s close
  buttons.

### Popover

- Fixed `PopoverClose`'s `data-icon-only` attribute clobbering a composed
  `render` target's own value — `<PopoverClose render={<Button iconOnly />} />`
  no longer un-squares the button.

### ScrollArea

- New `orientation` prop on `ScrollArea.Root` (`"both"` (default) |
  `"vertical"` | `"horizontal"`). Naming the axis turns the other one off —
  its `overflow` becomes `hidden` on the viewport and its overscroll is no
  longer contained — so a wheel or trackpad gesture along the axis with
  nothing to scroll falls through to the page instead of being claimed (and,
  on macOS, rubber-banded) by a viewport that cannot move. The resolved value
  is exposed as `data-orientation` on the root and viewport.

### Tabs

- The scroll area `Tabs.List` wraps itself in now inherits the strip's
  `orientation`, so scrolling across the strip — vertically over horizontal
  tabs, horizontally over vertical ones — reaches the page instead of
  bouncing a viewport with nothing to scroll on that axis.
- Fixed the `pill` variant's list radius being pinned to a fixed step instead
  of concentric with its tabs, so under a rounder radius preset the strip's
  corners no longer run a visibly tighter curve than the pills inside it.
- The `line` variant's sliding indicator now squares off the two corners
  against the rail — the same treatment the tab itself gets — instead of
  rounding all four, so the bar reads as attached to the rail rather than
  floating above it.

### Toggle

- Fixed `data-icon-only` on `Toggle` being erased when composed via `render`,
  the same class of bug fixed on `Button`.

## [1.0.0-alpha.2] - 2026-08-30

### NavList

- **Breaking:** the `marker` prop's `"rail"` option is now `"edge"`. The
  active-row cue is repainted as the row's own inline-start border (so it now
  follows the row's corner radius) instead of a separately-inset bar; the
  theming knobs move with it — `--forte-nav-list-rail-width` /
  `--forte-nav-list-rail-color` are renamed to `--forte-nav-list-edge-width` /
  `--forte-nav-list-edge-color`, and `--forte-nav-list-rail-inset` is removed
  (the border now runs the row's full height, so there is nothing left to
  inset).
- Added a `revealActive` prop: when set, the active row scrolls into view on
  mount or when it becomes active, without moving a container it doesn't own or
  fighting the browser's own scroll restoration. The landing offset is
  controlled by the new `--forte-nav-list-reveal-margin` token.

### General

- Added the unscoped `forte-ui` package as a functional alias of
  `@forte-ui/react`. It re-exports the root entry along with the `cn` and
  `tailwind-merge` subpaths, and proxies `theme.css` / `tailwind.css` via
  `@import`. Its version tracks `@forte-ui/react` release-for-release, so
  `forte-ui@X.Y.Z` always installs `@forte-ui/react@X.Y.Z`.

## [1.0.0-alpha.1] - 2026-08-30

Initial release.

### Added

- 45 accessible components built on [Base UI](https://base-ui.com) primitives:
  Accordion, Alert, AspectRatio, Avatar, Badge, Breadcrumb, Button,
  ButtonGroup, Calendar, Checkbox, Collapsible, ColorPicker, Combobox,
  ContextMenu, DatePicker, Dialog, Drawer, Field, Fieldset, Form, Input,
  InputGroup, Menu, Menubar, NavList, NavigationMenu, NumberField, OtpField,
  Popover, PreviewCard, Progress, Radio, Resizable, ScrollArea, Select,
  Separator, Skeleton, Slider, Spinner, Switch, Tabs, Textarea, Toast, Toggle,
  Toolbar, Tooltip.
- Token-driven design system: the full palette derives from a single accent
  seed via CSS relative colour syntax — no JavaScript, no build step, no
  runtime theming layer.
- Theming via `data-forte-theme`, `data-forte-radius`, `data-forte-density`
  and per-component `--forte-<component>-*` knobs, all scoped under
  `@layer forte.*` so consumer CSS always wins.
- Pure-CSS motion system with spring easings sampled into `linear()`, honouring
  `prefers-reduced-motion` through collapsing geometry tokens, plus an in-page
  `data-forte-motion` override.
- Accessibility baseline: WCAG-gated contrast harness over the generated
  ramps, two-tone focus rings, forced-colors support, 24×24 minimum targets,
  and RTL support via `--forte-direction`.
- Tailwind v4 bridge (`@forte-ui/react/tailwind.css`) that re-points
  Tailwind's theme at the forte-ui tokens, plus a pre-configured `cn` /
  `createCn` with the matching tailwind-merge config.
- Documentation site with runnable demos, generated prop and theming tables,
  and a token inventory.

[Unreleased]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.5...HEAD
[1.0.0-alpha.5]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.4...v1.0.0-alpha.5
[1.0.0-alpha.4]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.3...v1.0.0-alpha.4
[1.0.0-alpha.3]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.2...v1.0.0-alpha.3
[1.0.0-alpha.2]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.1...v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/arsen/forte-ui/releases/tag/v1.0.0-alpha.1
