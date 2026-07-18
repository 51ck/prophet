# packages/telegram — Grammy adapter

## Purpose

Telegram channel adapter for Pythia. Owns bot I/O only; calls `@prophet/core`.

## Ownership

- Grammy bot (DM first)
- Mapping Telegram user id → core seeker/session
- `/start`, `/new`, text turns → Pythia `agent.generate`
- Introduce language gate: if seeker has no saved `language`, ask ru|en via T1 `askWithOptions` chrome before agent turns; persist with `updateProfile`; skip when already set
- Language change: agent-owned via `updateSeekerProfile` during a normal turn — adapter does not parse switch phrases
- Presence / `/new`: agent `generate` with channel cues `[presence]` / `[new]` (not stored in history); no hardcoded openers
- Introduce name/self nudge: after language, if `preferredName` or `selfNotes` missing, ask free-prose name + few words in that language; agent fills via `updateSeekerProfile` (no meta disclosure); skip when both set
- Inline keyboard chrome for core `askWithOptions` (callback → seeker turn)

## Local Contracts

- No ritual truth here — core owns deck state
- Phase 1: private chats only
- Phase 1 outbound `parse_mode`: **HTML** (`PHASE1_PARSE_MODE`) — not MarkdownV2
- Outbound `reply()` runs `toTelegramHtml` (`src/format.ts`): light `*`/`_`/`**`/`__` → `<b>`/`<i>`, then escape remaining `<>&`
- On Telegram entity/parse reject (`isTelegramParseError`): resend original chunk as plain text (no `parse_mode`); other errors rethrow
- When generate yields `askWithOptions`: show inline keyboard; callback or free text feeds seeker turn (typed always claims pending — no force-retry until tap); typed decline phrases map to skip when `allowSkip`; expire/replace markup after answer so stale taps cannot double-submit
- No saved language → ask ru|en (T1 keyboard) before agent; choice persisted via `runtime.updateProfile`; returning seekers with language skip the ask
- Invalid typed reply during language introduce → restore/re-offer keyboard; do not append another `LANGUAGE_ASK_PROMPT` to history
- Mid-session language change → agent tool only; do not re-ask name/self; later turns use new register via prompt
- After language, incomplete name/self → free-prose ask in that language (adapter nudge); profile write stays on agent tools; complete name+self → agent presence (not a fixed script)
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
- `bun test packages/telegram` (format converter + parse-error fallback + ask keyboard/callback parse + free-text clears pending / typed decline + language gate + name/self introduce)
- Manual: DM bot `/start`, complete a short reading

## Child DOX Index

- [docs/formatting.md](docs/formatting.md) — Telegram HTML / parse_mode / Rich Messages pointer for T2+