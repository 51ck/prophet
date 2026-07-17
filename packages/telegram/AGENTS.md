# packages/telegram — Grammy adapter

## Purpose

Telegram channel adapter for Pythia. Owns bot I/O only; calls `@prophet/core`.

## Ownership

- Grammy bot (DM first)
- Mapping Telegram user id → core seeker/session
- `/start`, `/new`, text turns → Pythia `agent.generate`

## Local Contracts

- No ritual truth here — core owns deck state
- Phase 1: private chats only
- Phase 1 outbound `parse_mode`: **HTML** (`PHASE1_PARSE_MODE`) — not MarkdownV2
- Formatting reference for agents: [docs/formatting.md](docs/formatting.md) (links Bot API formatting + rich messages)
- Follow [tech/architecture.md](../../tech/architecture.md)

## Work Guidance

```bash
# from repo root (loads .env)
bun run bot
```

Before T2 send-path work, read [docs/formatting.md](docs/formatting.md).

## Verification

- `bun run typecheck` in this package
- Manual: DM bot `/start`, complete a short reading

## Child DOX Index

- [docs/formatting.md](docs/formatting.md) — Telegram HTML / parse_mode / Rich Messages pointer for T2+