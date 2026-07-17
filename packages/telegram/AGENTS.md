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
- Follow [tech/architecture.md](../../tech/architecture.md)

## Work Guidance

```bash
# from repo root (loads .env)
bun run bot
```

## Verification

- `bun run typecheck` in this package
- Manual: DM bot `/start`, complete a short reading

## Child DOX Index

(none)
