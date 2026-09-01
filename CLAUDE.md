# CLAUDE.md

The working notes for coding agents on this repo live in
[`AGENTS.md`](AGENTS.md) — that file is the single source of truth, and this
one only points at it.

@AGENTS.md

This was a symlink to `AGENTS.md` until now. It is a real file because git
symlinks do not survive a checkout on Windows without `core.symlinks=true`
and developer mode, so contributors there got a nine-byte text file reading
`AGENTS.md` rather than the document. The `@AGENTS.md` line above is Claude
Code's import syntax: it inlines the whole file, so the pointer costs
nothing — edit `AGENTS.md`, never this file.
