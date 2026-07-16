# In-repo ticket system

Binding process for agentic (and human) build work. Product truth stays in [`spec/`](../spec/AGENTS.md). Architecture stays in [`architecture.md`](architecture.md). **Boards** under `tech/` hold build tickets only.

## Why

Agents need stable IDs, clear done-when, and one source of queue truth in git. External trackers (GitHub Issues, Linear) are optional glue — not the product brief.

## Layers

| Layer | Owns | Does not own |
|-------|------|----------------|
| `spec/` | Problem, session, character, UX principles, roadmap phases | Eng ticket lists |
| `tech/architecture.md` | Stack, core vs adapters, deploy | Backlog chatter |
| **Ticket boards** (`tech/*-tasks.md`) | Buildable slices with IDs | Product philosophy essays |
| GitHub Issues / PRs (optional) | Who / which PR | Alternate product truth |

## Board files

- One board per durable theme/surface: e.g. [`telegram-tasks.md`](telegram-tasks.md)
- Name: `tech/<theme>-tasks.md`
- Index every board from [`tech/AGENTS.md`](AGENTS.md) Child DOX Index
- New board only when a theme has lasting multi-ticket work — not for one-off chores

## Ticket ID scheme

- **Theme:** `T<n>` — epic/theme header (e.g. `T1` buttons)
- **Slice:** `T<n>.<m>` — PR-sized checkbox (e.g. `T1.3`)
- IDs are stable once published — do not renumber; mark cancelled instead
- Agents invent new IDs only by **writing them on the board** first

## Slice shape (required)

Each `T<n>.<m>` checkbox line should be readable alone. Theme section should include:

| Field | Required | Notes |
|-------|----------|-------|
| **Problem** | theme | Why this theme exists |
| **Done when** | theme or slice | Verifiable outcome |
| **Depends on** | theme | Other IDs or prerequisites |
| **Spec / arch links** | theme | Pointers into `spec/` / architecture |
| **Out of scope** | board or theme | Explicit non-goals |

Prefer short slice titles on the checkbox. Put detail in the theme body, not a novel per checkbox.

## Status

- `[ ]` open
- `[x]` done (keep the line; do not delete history of the ID)
- Optional prefix in title if blocked: `(blocked: T1.2)` — rare; prefer Depends on

No separate status database. Board checkboxes are status.

## Agent operating loop

1. Read the relevant board + linked `spec/` / architecture
2. Take **one** open slice (`T<n>.<m>`) — or one theme only if slices are not yet split
3. Plan → implement → verify (`bun run lint`, `bun run typecheck`, tests when relevant)
4. Mark `[x]` on that slice
5. DOX pass if contracts/indexes changed
6. Commit refs the ID, e.g. `feat(telegram): T2.1 choose HTML parse_mode`

Do not start a second open slice in the same turn unless the user explicitly batches them.

## Human / agent rules

- Spec open questions stay in `spec/` until locked; then a board slice implements the lock
- Roadmap phases stay milestones — boards hold the tickets inside a phase
- Do not duplicate the same ticket on two boards
- If using GitHub Issues: title starts with `T1.3: …`, body links to the board section; close issue from PR

## Creating a board

1. Copy structure from [`telegram-tasks.md`](telegram-tasks.md) (themes → slices → order → non-goals → related)
2. Add to [`tech/AGENTS.md`](AGENTS.md) Child DOX Index
3. Link from the owning `spec/` doc if product-facing (one line)
4. Suggested build order at bottom of the board

## Related

- Example board: [telegram-tasks.md](telegram-tasks.md)
- DOX owner: [AGENTS.md](AGENTS.md)
