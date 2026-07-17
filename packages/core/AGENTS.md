# packages/core — Pythia core

## Purpose

Channel-agnostic prophet core: ritual engine, session arc, seeker memory, Mastra Pythia agent and tools. No Telegram I/O here.

## Ownership

- Deck state and shuffle/draw/open mechanics — pile + desk; pile addressing (top / bottom / index); free verbs per [tech/ritual-tasks.md](../../tech/ritual-tasks.md)
- Session state machine
- Seeker memory store
- Pythia agent + tool wiring
- Closed “ask with options” verb (`askWithOptions`: 2…N≤6 options, optional skip; no channel chrome)
- Light Seer’s structured deck data for Phase 1

## Local Contracts

- Must not invent card outcomes; tools mutate real deck state only
- Follow [tech/architecture.md](../../tech/architecture.md) and [spec/](../../spec/AGENTS.md)
- No channel adapters in this package

## Work Guidance

- `bun run typecheck` / `bun test` from repo root or package
- Keep ritual engine free of LLM calls

## Verification

- `bun test` in this package
- `bun run typecheck`

## Child DOX Index

(none)
