---
name: release-prep
description: Prepare a forte-ui release — draft a changelog from the publishable packages' diff, grouped by component, and bump the package versions after confirming the new version with the user. Use when the user asks to prepare a release, cut a release, draft the changelog, or "/release-prep", optionally with from/to commit hashes.
---

# Release prep

Delegate the analysis and the file writes to the `release-prepper` subagent
(it runs on sonnet for speed). Your job here is orchestration: parse the
arguments, relay the draft, get the user's confirmation on the version, and
send it back. Do not analyze the diff or edit the release files yourself.

## Steps

1. **Parse the arguments.** The user may pass a range as two hashes, a
   `from..to`, or nothing (then the agent defaults to last `v*` tag → `HEAD`).
   Anything else they typed — a target version, wording preferences — is an
   instruction to forward verbatim.

2. **Spawn the analysis** — foreground, since everything downstream depends
   on it:

   ```
   Agent({
     subagent_type: "release-prepper",
     description: "Analyze release range",
     run_in_background: false,
     prompt: "Phase ANALYZE. Repo: <cwd>. Range: <from and to, or 'default'>.
              <any forwarded user instructions>"
   })
   ```

3. **Handle the terminal statuses** in one line each and stop:
   - `nothing-to-release` → say the range contains no publishable changes.
   - `aborted` → relay the reason from `NOTES`. Do not retry, do not do the
     work yourself.

4. **Show the user the draft**: the changelog section verbatim (fenced as
   markdown), the range it covers, and the `BREAKING` lines if any. If the
   report has `QUESTIONS`, ask them now (AskUserQuestion, or plainly if they
   don't fit the option shape) and collect the answers before the next step.

5. **Confirm the version** with AskUserQuestion — offer the agent's
   `PROPOSED_VERSION` as the recommended option plus the sensible
   alternatives (e.g. the other bump levels); the user can always type their
   own. If the user's answers in step 4 change what the changelog should say,
   note the edits alongside.

6. **Send the confirmation back to the same agent** (SendMessage, so it keeps
   its analysis context — do not spawn a fresh one):

   ```
   Phase APPLY. Confirmed version: <version>.
   Changelog edits: <the user's edits, or "none — use the draft as returned">.
   ```

7. **Report the outcome**: the files written, the new version — naming every
   package it now applies to, and pointing out any that moved with no changes
   of their own so the user is not surprised by the diff — and a one-line
   reminder that nothing is committed — reviewing, committing, tagging and
   publishing stay in the user's hands. Do not commit for them, even if the
   diff looks perfect.

## Rules

- Never commit, tag, or publish from this skill, and never instruct the agent
  to. `/commit` exists for the commit, and it is the user's call.
- **One version for all the publishable packages, always.** Every release
  bumps every publishable `package.json` (`@forte-ui/react`, `forte-ui`,
  `create-forte-ui` today) to the same number, including a package with no
  changes in the range. If the user asks to "release create-forte-ui" or
  otherwise scope the bump to one package, explain that the set moves
  together and proceed with all of them — the changelog will simply have no
  section for the unchanged ones. If the report's `CURRENT_VERSION` shows the
  packages already out of step, tell the user before the version question;
  APPLY realigns them.
- If the user pre-supplied the version in the arguments, still show the draft
  (step 4), but skip the version question — forward their version straight to
  APPLY.
- The agent refuses to run on a dirty working tree — any modified, staged, or
  untracked file. When it aborts for that reason, show the user the file list
  from `NOTES` and tell them to commit or discard that work first (e.g. stage
  and `/commit`). Never stash, commit, or clean anything to get past the
  check, and never re-run the agent with instructions to skip it.
