# Seeker Memory

## Purpose

Pythia remembers the seeker so each reading has continuity — without turning the product into endless companionship chat or a raw transcript vault.

## Lifecycle

```mermaid
flowchart LR
  start[SessionStart] --> recall[RecallMemories]
  recall --> intro[Introduce]
  intro --> path[PathChoice]
  path -->|day card| offer[OfferDeck]
  path -->|question| intake[FindQuestion]
  intake --> offer
  offer --> ritual[Ritual]
  ritual --> close[Closing]
  close --> refactor[RefactorMemories]
  refactor --> endNode[Ended]
```

1. **Recall** at session start — load notes so continuity can be felt
2. **Introduce** (first visits / incomplete profile) — language, name, self — before any path offer — see soft profile below and [session.md](session.md)
3. **Path** — Card of the Day or find a question — only after presence/language are ready
4. **Save** during the session when something stable and useful appears
5. **Refactor** at session end — compress, dedupe, drop stale, keep voice consistent

## What belongs in memory

- Who they are to her (light relationship notes)
- **Optional soft profile** (prefer structured when stable): preferred name/address, language, age or age range, sex/gender — only if the seeker shared or confirmed them
- **Past deck choices** (and soft preference if shown)
- Recurring themes and prior reading gists (summaries, not full layouts)
- Open threads they may return to
- Practical preferences that aid fluency (pace, how they like reveals)
- Light “declined to share X” marks so she does not re-grill after a reject

## Soft profile (introduce)

Purpose: serve accurate language, address, and counsel — not a CRM form and not a privacy lecture.

### Phase 1 fields

| Field | When | Notes |
|-------|------|--------|
| **Language** | First `/start` / introduce | **ru** or **en** for now; required once so she can speak; changeable later on seeker request |
| **Preferred name** | After language known | Asked in that language |
| **Self notes** | Same introduce beat | A few words about the seeker; prophet folds into profile silently |

Age / sex / kin: not Phase 1 introduce asks (may return later as optional, rejectable).

### How introduce works

1. No saved language yet → ask language (ru/en); save; continue in that language
2. Ask name + a few words about themselves
3. Prophet **fills the profile transparently** — she does **not** tell the seeker she is “saving data,” opening a dossier, or running a form
4. Returning visits: use what she has fluently; language switch only when the seeker asks (or clearly needs it)

Ritual must not wait on optional biography beyond language + enough name/self to converse.

### Isolation (hard rule)

A profile belongs to **exactly one seeker** — the person in **this** chat/session. The prophet has **no** ability to load, compare, or write another seeker’s profile in the same agent context. No multi-profile tools; no cross-seeker memory in one turn.

Tracked as build work: [tech/telegram-tasks.md](../tech/telegram-tasks.md) (T3).

## Fluency rule

Recalled facts surface **only when they fit the moment**. Especially past deck: bring it up while offering a deck after the question lands — if natural. Never open with a memory dump. Never narrate persistence (“I’ll save that”). Soft profile is for register and address — never a stereotype lecture from biography.

## Out of scope

- Full chat transcript forever
- Invented biography
- Using memory to rewrite or “correct” card outcomes
- Group spectacle of private notes

## Privacy

Memories serve this prophet–seeker bond. They are not for public performance in group chat.

## Related

- Arc wiring: [session.md](session.md)
- Character: [character.md](character.md)
- Capabilities: [agent.md](agent.md)
