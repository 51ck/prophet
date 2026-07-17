# packages/core — Pythia core

## Purpose

Channel-agnostic prophet core: ritual engine, session arc, seeker memory, Mastra Pythia agent and tools. No Telegram I/O here.

## Ownership

- Deck state and shuffle/draw/open mechanics — pile + desk; pile addressing (top / bottom / index); free verbs per [tech/ritual-tasks.md](../../tech/ritual-tasks.md)
- Session state machine
- Seeker memory store — `SeekerMemory` keyed by seeker id; Phase 1 profile fields `language` (`ru`|`en`), `preferredName`, `selfNotes` plus continuity `notes` / `pastDeckIds`
- Profile read/write verbs (`readProfile` / `updateProfile` + tools) bound to `session.seekerId` only — no seeker selector
- Language introduce helpers (`createLanguageAsk` / `parseSeekerLanguage` / `presenceOpener`); prompt speaks seeker’s saved language
- Language change: `parseLanguageChangeRequest` + `updateSeekerProfile` language; prompt switches register; never re-grill introduce
- Name/self introduce helpers (`needsNameSelf` / `nameSelfAsk`); prompt asks free-prose name + few words after language (once; skip if ask already in thread), fills via `updateSeekerProfile` without meta disclosure
- Prompt: use preferredName/selfNotes/language fluently; never narrate persistence/CRM; never imply multi-seeker or other profiles (isolation hard rule)
- Pythia agent + tool wiring
- Closed “ask with options” verb (`askWithOptions`: prefer 2–3, max 6; optional skip; no channel chrome) — Pythia prefers it for closed simple asks; open intake / name+self stay free prose; never force-retry until seeker taps — free answer / decline always valid ([spec/telegram-ux.md](../../spec/telegram-ux.md))
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
