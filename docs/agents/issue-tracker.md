# Issue tracker: In-repo ticket boards

Issues and build tickets for this repo live as checkbox lines on markdown boards under `tech/`, not as GitHub Issues. Full process: [`tech/tickets.md`](../../tech/tickets.md).

## Conventions

- **Board files**: one per durable theme/surface, named `tech/<theme>-tasks.md` (e.g. `tech/telegram-tasks.md`, `tech/ritual-tasks.md`). Indexed from [`tech/AGENTS.md`](../../tech/AGENTS.md) Child DOX Index.
- **Ticket ID scheme**: `T<n>` for a theme/epic header, `T<n>.<m>` for a PR-sized slice (e.g. `T1.3`). IDs are stable once published — never renumber; mark cancelled instead of deleting.
- **Status**: `[ ]` open, `[x]` done. No separate status database — the checkbox is the status. Optional `(blocked: T1.2)` prefix, rare, prefer a `Depends on` field instead.
- **Slice shape**: each theme should carry Problem, Done when, Depends on, Spec/arch links, Out of scope. Slice checkbox lines stay short; detail lives in the theme body.
- New board only for a theme with lasting multi-ticket work — not for one-off chores.

## When a skill says "publish to the issue tracker"

Write a new `T<n>.<m>` checkbox line under the relevant theme on the matching `tech/<theme>-tasks.md` board (create the board per the steps in `tech/tickets.md` if no matching theme exists yet). Do not create a GitHub issue unless the user asks for the optional glue below.

## When a skill says "fetch the relevant ticket"

Read the theme section and slice line on the board the ticket ID belongs to. The user will normally pass the ID (`T<n>.<m>`) directly; search all `tech/*-tasks.md` boards if the owning board isn't obvious.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(This repo does not treat external PRs as feature requests; flip to yes only if that changes.)_

## GitHub Issues (optional glue only)

GitHub Issues are not the source of truth here and normally should not be created by agents. If the user explicitly asks to mirror a ticket to GitHub: title starts with `T1.3: …`, body links to the board section, and the issue is closed from the PR that completes the slice. Do not let a GitHub issue hold ticket state that isn't also on the board.

## Wayfinding operations

Used by `/wayfinder`. Map this repo's board/theme/slice shape onto the wayfinder map/child model:

- **Map**: the theme header (`T<n>`) on a board — holds the Problem / Done when / Depends on / Spec-arch-links / Out-of-scope fields that stand in for Notes / Decisions-so-far / Fog.
- **Child ticket**: a `T<n>.<m>` slice checkbox line under that theme.
- **Blocking**: the theme's `Depends on` field, or a slice's `(blocked: T<n>.<m>)` prefix. A slice is unblocked when every ID it depends on is `[x]`.
- **Frontier query**: scan the owning board for `[ ]` slices under the theme with no unresolved `Depends on` / blocked prefix; first in board order wins.
- **Claim**: no assignee mechanism — claiming is starting work on the branch for that slice; keep to one open slice per agent turn per [`tech/tickets.md`](../../tech/tickets.md) Agent operating loop.
- **Resolve**: mark `[x]` on the slice line, then follow the repo's implementer/reviewer loop (see root [`AGENTS.md`](../../AGENTS.md) User Preferences) before opening a PR.
