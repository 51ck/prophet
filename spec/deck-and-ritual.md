# Deck and Ritual

## Decks

Multiple decks exist as named systems the prophet can reason about and use in ritual. Concrete bodies live under [decks/](decks/AGENTS.md).

### Catalog (locked)

| Deck | Voice / when it fits |
|------|----------------------|
| [Rider–Waite](decks/rider-waite.md) | Classic — clear archetypal language, familiar structure |
| [Thoth](decks/thoth.md) | Deep esoteric analysis — dense symbol, occult lineage |
| [Wild Unknown](decks/wild-unknown.md) | Intuitive and emotional — feeling, image, gut |
| [Light Seer’s](decks/light-seers.md) | Psychological — inner pattern, growth, self-view |
| [Marseille](decks/marseille.md) | Traditional — spare majors-forward reading style |

### Pythia’s preferred

**Light Seer’s** is Pythia’s preferred deck (character taste), not a platform default. See [character.md](character.md).

### Deck selection (locked)

No global default. Ritual deck is chosen **after** the question is found.

1. **Find the question first** (intake)
2. **Offer a deck** — from that question **and** seeker behavior; short why
3. **Past deck in memory** — if the seeker used a deck before, recall it at the offer moment **only when fluent** (not a forced dump)
4. Seeker accepts, names another, or pushes back; prophet confirms before Commit
5. If nothing else fits and she leans on taste → Light Seer’s (preferred)

Deck for a session is confirmed before or at Commit — not swapped silently mid-layout.

### What a deck definition must contain

Enough for honest ritual and talk — not a storage format:

- **Identity** — name, tradition/lineage note, when it fits
- **Structure** — card list (e.g. majors, suits, courts), count
- **Orientation** — whether reversed/upright is used; how orientation is assigned
- **Meanings** — card language rich enough for interpretation in that deck’s voice
- **Imagery cues** — what the seeker would “see” when a card opens

Phase 1: Light Seer’s is fully described. Other decks: identity + when-it-fits + voice until Phase 2.

## Honest deck state

At any moment in ritual, the **deck** (ordered pile) and **desk** (cards placed in play) have a real state:

- Ordered pile(s) — top, bottom, and middle are real positions
- Desk placements — cards on the table (named spread slots or free placements)
- Each card’s identity in that position
- Orientation where the deck uses it
- Face-down vs face-up

Prophet interpretation never overrides that state. Undoing or reshuffling mid-reading is an explicit ritual act, not a silent edit.

### Mental model (locked)

Imagine a **free mode**: the prophet may ask the engine to shuffle, place a card on the desk, reveal it, return it to the pile, draw again, take from the bottom, place three cards, return the middle one, reshuffle, then draw from the middle of the pile. Session ritual is that same engine — composed into a reading — not a separate fake path.

### Mechanical verbs (product)

| Verb | Meaning |
|------|---------|
| **Shuffle** | Honest reorder / cut / shift / rotate ops on the pile |
| **Draw** | Move a card from the pile onto the desk (top by default; also bottom or a pile index) |
| **Place / return** | Move between pile and desk (e.g. return a desk card to top, bottom, or a pile index) |
| **Rotate** | Flip orientation on a pile segment or a desk card where the deck uses reversals |
| **Reveal / open** | Turn a face-down desk card face-up — identity becomes knowable |

### Secrecy (locked)

Until **reveal**, neither prophet nor seeker may learn which card it is. Agent-facing snapshots hide face-down identity. Tests and trusted internals may peek; the ritual mind must not.

Build board: [tech/ritual-tasks.md](../tech/ritual-tasks.md).

## Shuffle honesty

Shuffle aims to feel as genuine as a physical deck allows in this medium. Operations are physical analogues, composed as needed, for example:

- **Riffle / overhand-style mixes** (conceptual) — reorder with uncertainty
- **Cuts** — split and restack
- **Shifts** — move a block of cards within the pile
- **Rotations** — turn a portion (or the whole) to flip orientation where used
- **Seeker participation** — invite a cut, a stop, or a choice of pile when it serves presence

The point is not theatrical noise: operations change real order and orientation. The prophet may narrate the ritual; narration must match what actually happened.

## Spread and draw

- A **spread** is a named set of desk positions with roles — see [spreads.md](spreads.md)
- Prefer fewer positions when the question is sharp
- **Draw / place** moves cards from the pile onto the desk, usually face-down
- Named spreads are a convenience layout over the same desk; they do not bypass free pile↔desk verbs
- Drawn cards stay what they are until opened

## Open / reveal

- Cards stay face-down until opened
- Opening reveals identity (and orientation) for that desk card
- Pacing may be one-by-one, position-by-position, or a deliberate full reveal — prophet and seeker can negotiate within the session arc
- Opening does not change which card is there
- Prophet and seeker **do not know** the card before reveal

## Authenticity rules (summary)

| Allowed | Not allowed |
|---------|-------------|
| Compose shuffle ops that reorder/orient for real | Invent a card that was not drawn |
| Narrate ritual that matches state | Quietly swap cards to fit a nicer story |
| Choose spread and pacing; free pile↔desk moves as explicit acts | Claim reversed/upright without orientation in state |
| Re-shuffle / return / redraw only as explicit acts | Treat interpretation as if it were the draw |
| | Peek face-down identity for the prophet or seeker before reveal |

## Related

- Deck bodies: [decks/AGENTS.md](decks/AGENTS.md)
- Spreads: [spreads.md](spreads.md)
- Session timing: [session.md](session.md)
- Who may run which acts: [agent.md](agent.md)
