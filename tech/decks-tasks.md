# Deck catalog — ticket board

Board under the [in-repo ticket system](tickets.md). Spec: [spec/deck-and-ritual.md](../spec/deck-and-ritual.md), [spec/decks/AGENTS.md](../spec/decks/AGENTS.md). Arch: [architecture.md](architecture.md). Code: `packages/core` deck registry + agent prompt.

## Why

Roadmap Phase 2 ("Prophet voice") calls for remaining decks fully described and deck-appropriate register in readings. Today only Light Seer's is registered, `confirmDeck` hard-rejects any other deck id, and — gap found during scoping — **no deck's card meanings are wired into the running agent at all**, including Light Seer's own 400+ line spec body. Pythia currently interprets purely off the model's own trained tarot knowledge, not this project's authored voice per deck.

## Themes

1. **Rider–Waite pilot** — prove the deck-catalog + on-demand meaning pattern on one new deck before repeating it

---

## T10 — Rider–Waite pilot: deck registry + on-demand card meaning

**Problem:** Pythia can only ever confirm Light Seer's (`confirmDeck` throws on any other id), and even for Light Seer's, no card meaning text reaches the agent — interpretation is ungrounded in this project's authored voice. Seekers can't get a deck-appropriate reading, and the roadmap's "richer offer logic, deck-appropriate register" (Phase 2) has no path to ship.

**Done when:** `confirmDeck("rider-waite")` succeeds via a real registry (no more hardcoded single-deck guard); Rider–Waite has a full spec body (identity/structure/orientation/meanings/imagery per [deck-and-ritual.md](../spec/deck-and-ritual.md) "What a deck definition must contain"); an opened desk card carries its deck-specific meaning text in agent-facing tool results — fetched only for that card, only after reveal, never for face-down cards; Light Seer's meanings are retrofitted through the same lookup (closing the Phase 1 gap); Pythia's prompt reads that meaning as interpretation grounding without reciting it verbatim.

**Depends on:** none (fresh board; reuses existing spread-registry pattern in `packages/core`)

**Spec / arch:** [spec/deck-and-ritual.md](../spec/deck-and-ritual.md), [spec/decks/AGENTS.md](../spec/decks/AGENTS.md), [spec/decks/rider-waite.md](../spec/decks/rider-waite.md) (currently a stub)

### User Stories

1. As a seeker, I want Pythia to offer a deck other than Light Seer's when it fits my question or taste, so that the reading matches what I'm actually drawn to.
2. As a seeker who asks for the "classic" tarot experience, I want Pythia to name and use Rider–Waite, so that the reading feels familiar rather than defaulting to her personal preference.
3. As a seeker, I want each opened card's interpretation to sound like it belongs to the deck I chose, so that Rider–Waite and Light Seer's readings don't read as interchangeable.
4. As a returning seeker, I want Pythia to recall which deck I used before (per existing `deck-and-ritual.md` offer rule) and be able to offer Rider–Waite specifically, so that continuity of taste is honored.
5. As Pythia (agent), I want a real deck registry instead of a hardcoded single-deck guard, so that confirming any catalog deck doesn't require special-casing code per deck.
6. As Pythia (agent), I want the meaning of an opened card handed to me only once it's face-up, so that I never have a way to leak or guess a face-down identity through meaning text.
7. As Pythia (agent), I want card meaning text scoped to just the card actually opened, so that my working context isn't flooded with the other 77 cards' meanings every turn.
8. As a developer extending this to Thoth/Wild Unknown/Marseille later, I want the registry and meaning-lookup shape proven on one deck first, so that the remaining three decks are pure content additions, not new plumbing.
9. As a developer, I want the meaning lookup to be a pure function with no I/O, so that it's trivially unit-testable and safe to call from the existing secrecy-tested snapshot path.
10. As a maintainer, I want an "unknown deck id" error from `confirmDeck` (mirroring the current "Phase 1 only supports..." message), so that a typo'd or unregistered deck id fails loudly instead of silently defaulting.
11. As a maintainer, I want Rider–Waite's spec body locked in `spec/` before any code lands, so that the ticket system's "spec locks before implementation" rule holds here too.
12. As a QA-minded reviewer, I want a test proving face-down desk cards never carry a meaning field, so that the secrecy invariant already proven for `defId`/orientation also covers this new field.

### Implementation Decisions

- **Deck registry** (`packages/core/src/deck`): add a `DECKS: Record<string, { id: string; cards: readonly CardDef[] }>` map plus a `CATALOG_DECK_IDS` export, mirroring the existing spread pattern (`spreads: Record<string, SpreadDef>` in `reading-runtime.ts`, `CATALOG_SPREAD_IDS` in `spread-offer.ts`).
- **`confirmDeck`** (`reading-runtime.ts`): replace the hardcoded `if (id !== LIGHT_SEERS_DECK_ID) throw ...` guard with a registry lookup; unknown id throws `Unknown deck "<id>"` (same shape as the current Phase-1 message, just registry-backed instead of single-deck-backed).
- **Rider–Waite card list**: new `CardDef[]` export mirroring `light-seers.ts` exactly — id/name/arcana/suit only, no meaning field on `CardDef` itself. Meanings stay out of the card identity type.
- **Card meaning lookup**: one new pure function, e.g. `getCardMeaning(deckId: string, cardId: string): CardMeaning | undefined`, backed by a per-deck meaning map compiled from each deck's locked spec body. No I/O, no runtime file reads of `spec/`.
- **Snapshot wiring**: `getDeckSnapshot` / `openPosition` results attach the meaning (and imagery cue) only to desk slots that are face-up; face-down slots are unaffected (no new field, or explicitly `null` — pick whichever matches the existing `defId`-hiding convention already in `DeskSlot`/snapshot shape). This is the on-demand seam: meaning is computed per opened card, never precomputed for the whole deck.
- **Light Seer's retrofit**: pull its existing meaning content out of `spec/decks/light-seers.md` into the same lookup module, so Phase 1's one deck stops being ungrounded too.
- **Prompt** (`pythia.ts` instructions): add a line telling Pythia to use the attached meaning as grounding when interpreting an opened card, in her own voice — not a verbatim recitation.
- **Deck offer logic**: extend the existing "offer a deck from question + behavior + past choice" instruction to include Rider–Waite as a real option alongside Light Seer's (still no platform default; selection rule in `deck-and-ritual.md` is unchanged).

### Testing Decisions

Good tests here check external behavior — what `confirmDeck`/tool results return — not internal wiring:

- **Registry**: extend `reading-runtime.test.ts`'s existing `confirmDeck` coverage — confirming `"rider-waite"` succeeds and produces a deck of the right size/shape; confirming an unregistered id still throws, same as today's Phase-1 guard test gap (no such negative test exists yet — add one).
- **Meaning lookup**: new unit test file (sibling to `light-seers.ts`, matching existing per-module test convention) — correct meaning returned for a known `(deckId, cardId)` pair; behavior for an unregistered id is an explicit decision to make during implementation (undefined vs throw), not assumed here.
- **Secrecy boundary**: extend `tools-secrecy.test.ts` the same way T6.3 proved `defId`/orientation hiding — a face-down desk card's tool-facing result never carries a meaning field; a face-up one does, and its value matches the lookup for that card's real id.
- **Card list integrity**: mirror whatever existing check (if any) confirms Light Seer's 78 unique ids/counts — apply the same shape check to Rider–Waite's list.
- **Prompt/voice quality**: not unit-testable; verified manually (DM a reading with each deck confirmed, per the existing manual-verification convention in `packages/telegram/AGENTS.md`).

### Out of Scope

- Thoth, Wild Unknown, Marseille full spec bodies and registration — future slices reusing this same pattern
- More than one confirmed deck in play at once in a single session (existing Phase 1 rule stands — see `ritual-tasks.md` Out of scope)
- Card imagery as images/CDN — imagery stays text cues only, per `deck-and-ritual.md`
- Any change to shuffle/draw/reveal mechanics themselves (T4–T7 engine is untouched by this)
- Automated grading of interpretation "quality" or voice fidelity

### Tasks

- [x] **T10.1** Spec lock: full Rider–Waite body in `spec/decks/rider-waite.md` (identity, structure, orientation, meanings, imagery) per `deck-and-ritual.md`'s required-fields list
- [x] **T10.2** Core: deck registry (`DECKS` map + `CATALOG_DECK_IDS`); `confirmDeck` reads the registry instead of the hardcoded single-deck guard
- [x] **T10.3** Core: Rider–Waite `CardDef[]` list, registered in `DECKS` (depends on T10.1 for real content, T10.2 for the registry to register into)
- [x] **T10.4** Core: `getCardMeaning(deckId, cardId)` lookup module; retrofit Light Seer's existing spec meanings into it too
- [ ] **T10.5** Core: wire meaning (+ imagery cue) into face-up desk cards only, in `getDeckSnapshot`/`openPosition` results; face-down untouched
- [ ] **T10.6** Prompt: Pythia reads opened-card meaning as grounding (not verbatim); deck offer instruction mentions Rider–Waite
- [ ] **T10.7** Tests: registry confirm/reject, meaning-lookup unit tests, secrecy-boundary extension, card-list integrity

---

## Out of scope (this board)

- Thoth / Wild Unknown / Marseille (separate future themes on this same board, once T10 proves the pattern)
- Ritual mechanics themselves — see [ritual-tasks.md](ritual-tasks.md)
- Telegram-side deck chrome/buttons — see [telegram-tasks.md](telegram-tasks.md)

## Related

- Ticket system: [tickets.md](tickets.md)
- Spec: [deck-and-ritual.md](../spec/deck-and-ritual.md), [decks/AGENTS.md](../spec/decks/AGENTS.md)
- Core package: [packages/core/AGENTS.md](../packages/core/AGENTS.md)
- Roadmap: [spec/roadmap.md](../spec/roadmap.md) Phase 2
