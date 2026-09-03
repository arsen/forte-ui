# create-forte-ui

Scaffold a brand-new app wired up with [forte-ui](https://forte-ui.com) — Vite
or Next.js, with or without Tailwind, themed from your answers.

```bash
pnpm create forte-ui my-app
npm create forte-ui@latest my-app
```

Four questions get you to a running app (name, framework, Tailwind, accent
color); everything else — secondary color, neutral tint, radius, density,
motion, light/dark, fonts — hides behind one "customize further?" gate. Every prompt has a
flag twin, so the [Theme Studio](https://forte-ui.com/theme/) can hand you a
complete command line and `--yes` runs without a single question:

```bash
pnpm create forte-ui my-app --seed "#e11d48" --radius pill --font-sans "Inter" --yes
```

Run `create-forte-ui --help` for the full flag list.

## How it works

The framework scaffold is not ours: `create-next-app` / `create-vite` run
non-interactively and stay current upstream. This CLI applies only the
forte-ui overlay on top — the same steps as the
[getting-started guides](https://forte-ui.com/getting-started/nextjs/), which
are the spec: a scaffolded app should diff against the walkthrough and show
only your answers.

Answers you skip write **nothing** — no restated defaults, no attributes for
default presets — so the app keeps following the library when its defaults
are tuned.

## Maintaining

- The starter files live in `src/templates.ts`; when a guide step changes,
  change the matching builder in the same commit.
- The font catalog (`src/fonts.ts`) and color maths (`src/color.ts`) are
  the modules of record — the docs' Theme Studio re-exports them from this
  package.
- `pnpm --filter create-forte-ui smoke` scaffolds and builds all four
  framework × Tailwind paths against the workspace library (network, takes
  minutes). Run it before releasing this package or after editing a guide's
  setup steps.
