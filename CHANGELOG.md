# Changelog

<!--
  Newest first. A new release is inserted directly below [Unreleased] —
  above every existing version — never appended to the bottom.
-->

All notable changes to `@forte-ui/react` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.3...HEAD
[1.0.0-alpha.3]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.2...v1.0.0-alpha.3
[1.0.0-alpha.2]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.1...v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/arsen/forte-ui/releases/tag/v1.0.0-alpha.1
