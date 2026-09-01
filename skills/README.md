# Agent skills

Skills in this directory teach AI coding agents how to *consume* forte-ui —
they are not contributor docs (those are `CLAUDE.md` and
`packages/react/CONTRIBUTING.md`).

Install into any supported agent (Claude Code, Cursor, Copilot, …) via
[skills.sh](https://www.skills.sh/):

```bash
npx skills add arsen/forte-ui
```

## Design notes

`forte-ui/SKILL.md` is hand-written and deliberately contains **no inventories**
— no component index, no token lists, no prop tables, no knob catalogues.
Those live in the installed package itself (`@forte-ui/react/docs-data/`:
`components.md` for choosing a component, the `*.json` files for exact APIs —
all generated at build time), and the skill instructs the agent to read them
from the consumer's own `node_modules`. That way the skill describes the
stable concepts while the volatile facts always match whatever version the
consumer actually has — the skill only needs updating when a concept changes.
