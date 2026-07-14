# Architecture (Phase 1)

Product contracts: [spec/](../spec/AGENTS.md). This doc is how we build them — not a rewrite of the idea.

Prophet code/product name: **Pythia**.

## Stack (locked for build)

| Layer | Choice | Role |
|-------|--------|------|
| Language | TypeScript | App and agent logic |
| Agent framework | Mastra | Pythia agent, tools, model calls |
| Telegram | Grammy | Phase 1 channel adapter (DM first) |

## Core vs adapters (locked)

Telegram is a **frontend adapter**. Ritual honesty, Pythia’s mind, and seeker memory live in a **channel-agnostic core**. A future web app is another adapter: it may expose richer UI tools, but those tools must call the same core ritual verbs — never invent cards or bypass deck state.

### Core (channel-agnostic)

- Pythia agent (character, intake, offer deck, interpret)
- Ritual engine (honest deck state: shuffle / draw / open)
- Seeker memory (recall / save / refactor)
- Session arc state machine

### Adapters (channel I/O only)

- **Telegram** (Grammy) — Phase 1: messages, buttons, DM identity
- **Web** (future) — richer chrome; optional UI tools that map onto core verbs (e.g. visual cut → `shuffle({ op: seekerCut, … })`)

### Tool rule

Channel-specific tools are allowed for UX. They must invoke core ritual/memory/session operations. Authenticity contracts in `spec/` stay owned by the core path.

### Phase 1 module layout

One process, module packages — not microservices:

- `packages/core` — agent + ritual + memory + session (in-process interface)
- `packages/telegram` — Grammy adapter

Public HTTP API only when a second client needs it. Web = future adapter package.

```mermaid
flowchart TB
  tg[TelegramAdapter]
  web[WebAdapterFuture]
  core[ProphetCore]
  tg --> core
  web --> core
  core --> agent[PythiaAgent]
  core --> ritual[RitualEngine]
  core --> mem[MemoryStore]
```

## High-level shape (Phase 1 Telegram)

```mermaid
flowchart TB
  seeker[SeekerTelegram] --> grammy[TelegramAdapter]
  grammy --> sessionBridge[AdapterSessionBridge]
  sessionBridge --> pythia[PythiaAgent]
  pythia --> tools[RitualAndMemoryTools]
  tools --> deckState[DeckState]
  tools --> memStore[SeekerMemoryStore]
  pythia --> deckContent[DeckContentLightSeers]
  pythia --> character[CharacterPromptPythia]
```

- **Telegram adapter** receives messages, sends replies, optional light buttons
- **Adapter session bridge** maps Telegram user/chat → core seeker/session ids; does not own ritual truth
- **Pythia agent (core)** reasons with character + recalled memory + deck content; calls tools for mechanical ritual and memory writes
- **Deck state** is authoritative for cards; agent never invents draws
- **Seeker memory store** holds notes across sessions; agent recalls at start, saves during, refactors at end

## State ownership

| State | Owner | Notes |
|-------|--------|------|
| Chat transport | Telegram adapter | Message I/O, buttons |
| Reading session arc | Core session + agent | Idle → recall → intake → offer deck → committed → ritual → closing → refactor → ended |
| Deck / table (order, orientation, face) | Core ritual engine | Mechanical; tools mutate; agent narrates true state |
| Seeker memory | Core memory store + tools | Persist across sessions; refactor at end |
| Character | Prompt / config from [character.md](../spec/character.md) | Pythia; not mutable mid-reading by seeker |

## Conceptual verbs → tools

Map from [agent.md](../spec/agent.md):

| Verb | Tool / mechanism (conceptual name) |
|------|-------------------------------------|
| Recall memories | `recallSeekerMemory` |
| Intake / lock question | Agent dialogue + `lockQuestion` |
| Offer / confirm deck | Agent dialogue + `confirmDeck` |
| Shuffle ops | `shuffle` (ops: mix, cut, shift, rotate, seekerCut) |
| Select spread | `selectSpread` |
| Draw | `drawToPositions` |
| Open / reveal | `openPosition` |
| Interpret | Agent (reads deck content + opened state) — not a fake-draw tool |
| Save memory | `saveSeekerMemory` |
| Close session | `closeSession` |
| Refactor memories | `refactorSeekerMemory` |
| Defer / refuse | Agent + `endWithoutRitual` |

Inspectability: optional `getDeckSnapshot` for debugging / future UX — must not leak into inventing cards.

## Deck content

- Phase 1: load [Light Seer’s](../spec/decks/light-seers.md) (or a derived structured form generated from it)
- Catalog stubs remain for offer language; full ritual body is Light Seer’s until Phase 2
- Content feeds interpretation prompts; identity of drawn cards comes only from deck state

## Session flow (system)

1. Incoming DM → adapter resolves seeker id → core `recallSeekerMemory`
2. Agent intake until `lockQuestion`
3. Agent offers deck; `confirmDeck`
4. Ritual tools mutate deck state; agent narrates and interprets
5. `closeSession` → `refactorSeekerMemory`
6. Mid-ritual abandon: drop session; next visit fresh (Phase 1 UX lock)

## Env / secrets (names only)

- `TELEGRAM_BOT_TOKEN`
- LLM / Mastra provider keys as required by chosen model host
- Optional DB URL if memory store is not local-file for dev

Values live outside git (see root `.gitignore`).

## Out of scope here

- Stars / payments
- Group summon design
- Full multi-deck runtime bodies
- Card image CDN
- Web adapter implementation

## Build gate

Implement code only after this architecture matches current `spec/`. If product rules change, update `spec/` first, then this doc, then code.
