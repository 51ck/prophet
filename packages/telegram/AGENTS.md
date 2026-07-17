# packages/telegram — Grammy adapter

## Purpose

Telegram channel adapter for Pythia. Owns bot I/O only; calls `@prophet/core`.

## Ownership

- Grammy bot (DM first)
- Mapping Telegram user id → core seeker/session
- `/start`, `/new`, text turns → Pythia `agent.generate`
- Inline keyboard chrome for core `askWithOptions` (callback → seeker turn)

## Local Contracts

- No ritual truth here — core owns deck state
- Phase 1: private chats only
- Phase 1 outbound `parse_mode`: **HTML** (`PHASE1_PARSE_MODE`) — not MarkdownV2
- Outbound `reply()` runs `toTelegramHtml` (`src/format.ts`): light `*`/`_`/`**`/`__` → `<b>`/`<i>`, then escape remaining `<>&`
- On Telegram entity/parse reject (`isTelegramParseError`): resend original chunk as plain text (no `parse_mode`); other errors rethrow
- When generate yields `askWithOptions`: show inline keyboard; callback or free text feeds seeker turn (typed always claims pending — no force-retry until tap); typed decline phrases map to skip when `allowSkip`; expire/replace markup after answer so stale taps cannot double-submit
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
- `bun test packages/telegram` (format converter + parse-error fallback + ask keyboard/callback parse + free-text clears pending / typed decline)
- Manual: DM bot `/start`, complete a short reading

## Child DOX Index

- [docs/formatting.md](docs/formatting.md) — Telegram HTML / parse_mode / Rich Messages pointer for T2+