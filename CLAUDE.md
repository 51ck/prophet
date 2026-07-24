# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Governing docs — read first

This repo's actual work contract is the **DOX framework** in the root [`AGENTS.md`](AGENTS.md), not this file. Before touching any path:

1. Read root `AGENTS.md`.
2. Walk from repo root to every path you intend to touch, reading each `AGENTS.md` along the way ([spec/](spec/AGENTS.md), [tech/](tech/AGENTS.md), [packages/core/](packages/core/AGENTS.md), [packages/telegram/](packages/telegram/AGENTS.md)).
3. Follow the closer doc for local detail; no child doc may weaken DOX.
4. After a meaningful change, do the DOX update pass (see root `AGENTS.md` § Update After Editing / Closeout) — refresh the owning `AGENTS.md`, not this file.

Build tickets live on `tech/*-tasks.md` boards (`T<n>.<m>` IDs) per [`tech/tickets.md`](tech/tickets.md) — take one open slice, mark `[x]` when done, ref the ID in the commit. GitHub Issues are optional glue only.

## Commands

```bash
bun install              # install workspace deps
bun run lint              # oxlint packages
bun run lint:fix
bun run typecheck         # bun run --filter '*' typecheck (tsc --noEmit, TS7)
bun test                  # bun test packages/core packages/telegram
bun test packages/core/src/ritual/engine.test.ts   # single file
bun test -t "some test name"                       # filter by test name
bun run bot               # runs packages/telegram/src/main.ts, loads .env
```

Pre-commit hook (`.githooks`, wired via `bun run prepare`) runs `bun run lint` + `bun run typecheck` — both must pass before commit.

Env: copy `.env.example` → `.env`; set `TELEGRAM_BOT_TOKEN`, one of `DEEPSEEK_API_KEY`/`OPENAI_API_KEY`, and `MODEL_ID` (e.g. `deepseek/deepseek-v4-flash`, `openai/gpt-4.1-mini`).

## Architecture

Bun workspaces monorepo, one process (not microservices). Two packages, strict direction of dependency: `telegram` → `core`, never the reverse.

```
TelegramAdapter (packages/telegram) → ProphetCore (packages/core)
                                         ├─ PythiaAgent (Mastra)
                                         ├─ RitualEngine
                                         └─ MemoryStore
```

- **`packages/core`** — channel-agnostic. Owns all ritual/deck truth (pile + desk state), the session arc state machine, seeker memory, and the Mastra Pythia agent + its tools. No I/O.
  - Deck mechanics are verbs, not a scripted flow: `shuffle`, `draw`/`drawToPositions`, `returnToPile`, `rotate`, `openPosition`, `getDeckSnapshot`. Tools only ever return the secrecy-safe snapshot shape — face-down `defId`/orientation and pile identity are never exposed. `peekDesk` exists only for trusted tests.
  - Spread catalog is fixed `SpreadDef`s in three tiers (simple: `card-of-day`, `single-focus`, `yes-no`, `two-poles`, `past-present-future`, `thoughts-feelings-actions`, `three-roads`; thematic: `relationship`, `work-finance`, `choice`; complex: `celtic-cross`, `twelve-houses`) — ids/roles defined in `spec/spreads.md`.
  - Session carries an optional `sessionPath` (`day-card` | `question` | null) chosen after presence; it gates which spreads are legal (`assertSpreadForSessionPath`) and which prompt/offer logic applies.
  - Seeker memory is profile fields (`language`, `preferredName`, `selfNotes`) plus continuity notes, keyed by seeker id and bound to `session.seekerId` — no cross-seeker selector, ever (hard isolation rule).
- **`packages/telegram`** — Grammy adapter, DM-only in Phase 1. Owns bot I/O only: maps Telegram user → core seeker/session, drives `agent.generate`, renders `askWithOptions` as inline keyboards, and converts outbound text to Telegram HTML (`src/format.ts`, light markdown → `<b>`/`<i>`, then escapes `<>&`; falls back to plain text on a Telegram parse-entity rejection). No ritual truth lives here — see `packages/telegram/AGENTS.md` for the language/name-self/session-path gating sequence before `/start` turns reach the agent.
- **`spec/`** — product idea (problem, Pythia character, session arc, decks/ritual, Telegram UX, roadmap). Implementation-free; changes here precede matching changes in `tech/architecture.md` then code.
- **`tech/`** — how the product gets built: stack lock (TS7, Bun, Mastra, Grammy, Docker Compose + GHCR), core-vs-adapter boundary, and the ticket board system.

Deploy: push to `master` → GitHub Actions builds → GHCR → VPS pulls via Docker Compose. Secrets are env-only, never in git.
