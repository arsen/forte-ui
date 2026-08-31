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

[Unreleased]: https://github.com/arsen/forte-ui/compare/v1.0.0-alpha.1...HEAD
[1.0.0-alpha.1]: https://github.com/arsen/forte-ui/releases/tag/v1.0.0-alpha.1
