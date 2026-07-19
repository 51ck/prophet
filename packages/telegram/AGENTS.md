# packages/telegram — Grammy adapter

## Purpose

Telegram channel adapter for Pythia. Owns bot I/O only; calls `@prophet/core`.

## Ownership

- Grammy bot (DM first)
- Mapping Telegram user id → core seeker/session
- `/start`, `/new`, text turns → Pythia `agent.generate`
- Introduce language gate: if seeker has no saved `language`, ask ru|en via T1 `askWithOptions` chrome before agent turns; persist with `updateProfile`; skip when already set
- Language change: agent-owned via `updateSeekerProfile` during a normal turn — adapter does not parse switch phrases
- Presence / `/new`: agent `generate` with channel cues `[presence]` / `[new]` (not stored in history); no hardcoded openers; `/new` stores `pendingCue` so deferred presence after language/name-self still uses `[new]`
- Introduce name/self nudge: after language, if `preferredName` or `selfNotes` missing, ask free-prose name + few words in that language; agent fills via `updateSeekerProfile` (no meta disclosure); skip when both set
- Session path after presence: when a `[presence]`/`[new]` turn has completed this session (`presenceSpoken`), language + name/self ready, and `sessionPath` unset, offer Card of the Day vs find a question via T1 `askWithOptions`; persist with `runtime.setSessionPath`; free text still valid (no force-retry); skip channel offer if the presence turn itself left a path `askWithOptions` pending; agent generate always expires prior pendingAsk before attaching a fresh ask or clearing (so chained name/self→presence cannot leave two keyboards live, and a pre-presence path ask cannot block the channel offer); if presence left any other pending ask, expire its markup then offer path
- Inline keyboard chrome for core `askWithOptions` (callback → seeker turn)

## Local Contracts

- No ritual truth here — core owns deck state
- Phase 1: private chats only
- Phase 1 outbound `parse_mode`: **HTML** (`PHASE1_PARSE_MODE`) — not MarkdownV2
- Outbound `reply()` runs `toTelegramHtml` (`src/format.ts`): light `*`/`_`/`**`/`__` → `<b>`/`<i>`, then escape remaining `<>&`
- On Telegram entity/parse reject (`isTelegramParseError`): resend original chunk as plain text (no `parse_mode`); other errors rethrow
- When generate yields `askWithOptions`: show inline keyboard; callback or free text feeds seeker turn (typed always claims pending — no force-retry until tap); typed decline phrases map to skip when `allowSkip`; expire/replace markup after answer so stale taps cannot double-submit; before attaching a fresh ask from generate, expire any prior pendingAsk markup (name/self→presence may chain two generates)
- No saved language → ask ru|en (T1 keyboard) before agent; choice persisted via `runtime.updateProfile`; returning seekers with language skip the ask
- Invalid typed reply during language introduce → restore/re-offer keyboard; do not append another `LANGUAGE_ASK_PROMPT` to history
- Mid-session language change → agent tool only; do not re-ask name/self; later turns use new register via prompt
- After language, incomplete name/self → free-prose ask in that language (adapter nudge); profile write stays on agent tools; name/self answer must not path-ask until a presence turn has spoken; then path ask once if `sessionPath` unset; path label in that same answer still counts after presence
- Returning seeker cold text (skip `/start`): presence first, then path — never path-ask after a plain agent reply alone; cold typed path labels wait until after presence, then set `sessionPath` without re-asking buttons
- Path ask: buttons + typed path labels set `sessionPath` only after `presenceSpoken` (or while answering an offer); distinctive path label embedded in name/self prose counts after presence; other free text clears pending and continues without force-retry; non-path pending ask → continue only (never accept/offer path that turn, even if text embeds a path phrase); do not re-offer if prompt already in history or the presence turn left a path ask pending; agent generate always expires prior pendingAsk (with or without a fresh ask); expire non-path pending markup before channel path offer
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
- `bun test packages/telegram` (format converter + parse-error fallback + ask keyboard/callback parse + free-text clears pending / typed decline + language gate + name/self introduce + path gate)
- Manual: DM bot `/start`, complete a short reading

## Child DOX Index

- [docs/formatting.md](docs/formatting.md) — Telegram HTML / parse_mode / Rich Messages pointer for T2+