# Ritual engine — ticket board

Board under the [in-repo ticket system](tickets.md). Virtual **deck** (pile) + **desk** (table). Spec: [spec/deck-and-ritual.md](../spec/deck-and-ritual.md), [spec/agent.md](../spec/agent.md). Arch: [architecture.md](architecture.md). Code: `packages/core` ritual engine.

## Why

Session ritual must run on a real virtual deck/desk. Prophet tools mutate that state only. “Free mode” (shuffle, place, reveal, return, draw bottom/middle, reshuffle) is the same engine session ritual uses — not a separate toy.

## Baseline (already in core)

- `DeckState`: pile + **desk** (`DeskSlot` with `kind: "spread" | "free"`); Light Seer’s 78
- `addFreeSlot` for placements off a named spread; `selectSpread` lays spread-kind slots
- Shuffle ops: mix, cut, shift, rotate, seekerCut (pile; tested)
- Pile addressing: top / bottom / index draw + insert helpers
- Spread select + draw into empty slots + openPosition
- Snapshot hides face-down `defId`; `peekDesk` for tests only
- Partial tests in `packages/core/src/ritual/engine.test.ts`

Gap: none for T7 — session ritual composes selectSpread layout + place fills (T7.4).

## Themes

1. **Desk + pile model** — free placements and pile positions are first-class
2. **Mechanical verbs** — shuffle / draw / return / rotate / reveal with real state
3. **Secrecy + tests** — face-down hidden; free-mode scenarios covered
4. **Prophet tools** — session ritual composes these verbs; no LLM peek
5. **Popular spreads catalog** — simple / thematic / classic layouts as named desk layouts

---

## T4 — Desk + pile model

**Problem:** Table today is mostly fixed spread slots filled in order. Free ritual needs arbitrary place/return and pile indices.

**Done when:** State model supports pile (top/bottom/index) + desk placements; named spreads are layouts over that desk.

**Depends on:** `@prophet/core` ritual package exists

**Spec / arch:** [spec/deck-and-ritual.md](../spec/deck-and-ritual.md)

**Tasks:**

- [x] **T4.1** Spec lock: free-mode mental model; verbs; secrecy — done in deck-and-ritual + agent
- [x] **T4.2** Desk model: free place slots and/or generalize table so cards can sit off a named spread
- [x] **T4.3** Pile addressing: top, bottom, and middle/index as first-class draw/insert targets

---

## T5 — Mechanical verbs (engine)

**Problem:** Prophet needs functions that match physical analogues — not only “fill spread.”

**Done when:** Engine can shuffle, draw (top/bottom/index), place on desk, return to pile, rotate, reveal — each mutates real state.

**Depends on:** T4.2, T4.3

**Tasks:**

- [x] **T5.1** Keep/extend shuffle ops (mix, cut, shift, rotate, seekerCut) on pile
- [x] **T5.2** `draw` / `place`: pile → desk face-down (top default; bottom; index)
- [x] **T5.3** `return`: desk → pile (top / bottom / index)
- [x] **T5.4** `rotate`: pile segment and/or single desk card
- [x] **T5.5** `reveal` / `open`: face-down → face-up; identity unchanged
- [x] **T5.6** Named-spread ritual = compose verbs (e.g. place three face-down into roles) — no bypass path

---

## T6 — Secrecy + test coverage

**Problem:** Deck/desk honesty only counts if tests prove free-mode sequences and face-down secrecy.

**Done when:** Free-mode scenarios below pass; agent-facing snapshot never leaks face-down identity; peek stays test/trusted-only.

**Depends on:** T5

**Free-mode scenarios (must cover):**

1. Shuffle → place one on desk → reveal → return to pile → draw again → reveal
2. Draw from bottom of pile → reveal
3. Place three on desk → return middle → reshuffle pile → place/draw from middle of pile
4. Face-down: snapshot `defId` null until reveal; after reveal identity matches peek
5. Return + reshuffle does not invent cards; pile count conserved

**Tasks:**

- [x] **T6.1** Expand `engine.test.ts` (or sibling) for scenarios 1–5 above
- [x] **T6.2** Invariant tests: card-count conservation; no silent identity change on move/reveal
- [x] **T6.3** Snapshot secrecy tests: prophet-facing view hides face-down; peek not exported to agent tools

---

## T7 — Prophet tools + session ritual

**Problem:** Agent must perform ritual only through these functions; seeker and prophet learn cards only after reveal.

**Done when:** Tools expose shuffle / draw / return / rotate / reveal / snapshot; session path uses them; tools never return face-down identity.

**Depends on:** T5, T6.3

**Tasks:**

- [x] **T7.1** Wire Mastra tools to new engine verbs (replace or extend drawToPositions-only path)
- [x] **T7.2** Tool results use secrecy-safe snapshot only
- [x] **T7.3** Pythia prompt: narrate only ops actually called; never claim knowledge of face-down cards
- [x] **T7.4** Reading runtime: session ritual uses composed verbs (spread as layout + places)

---

## T8 — Popular spreads catalog

**Problem:** Runtime only wires Three Roads. Product needs the usual popular layouts so Pythia can match spread size to the question.

**Done when:** Catalog in [spec/spreads.md](../spec/spreads.md) is registered in core; `beginRitual` / select-spread can use any of them; tests cover slot counts + ids; prompt knows when to offer which.

**Depends on:** T4.2 (desk layout); prefer after T5.6 so spreads compose free verbs — can land defs earlier if `selectSpread` still used

**Spec / arch:** [spec/spreads.md](../spec/spreads.md)

**Catalog (from spec):**

| Tier | Spreads |
|------|---------|
| Simple | `card-of-day` (1), `single-focus` (1), `yes-no` (3 fixed), `two-poles` (2), `past-present-future` (3), `thoughts-feelings-actions` (3), `three-roads` (3) |
| Thematic 4–7 | `relationship`, `work-finance`, `choice` |
| Classic 10+ | `celtic-cross`, `twelve-houses` |

**Tasks:**

- [x] **T8.1** Spec lock: ids, position roles, offering rule — done in spreads.md
- [ ] **T8.2** Core defs: all simple spreads as fixed `SpreadDef` (`yes-no` = 3 slots) + register in runtime map
- [ ] **T8.3** Core defs: thematic (`relationship`, `work-finance`, `choice`)
- [ ] **T8.4** Core defs: `celtic-cross` (10)
- [ ] **T8.5** Core defs: `twelve-houses` (12)
- [ ] **T8.6** Tests: each spread → correct desk slot count/ids/kinds; selectSpread replaces layout
- [ ] **T8.7** Pythia prompt + offer logic: prefer fewer; `card-of-day` only on day path; sharp hinge → `single-focus`; spread after Commit

---

## Suggested build order

```text
T4.1–T4.2 (done) → T4.3 → T5 → T6 → T7
T8.1 (done) → T8.2–T8.5 defs (can parallel after T4.2)
  → T8.6 tests → T8.7 prompt/offer
```

Parallel with Telegram board is fine; ritual honesty is core, not adapter.

## Out of scope (this board)

- Card image CDN / visual chrome
- Multi-deck in play at once (Phase 1: one confirmed deck)
- LLM choosing outcomes
- Inventing huge niche spreads beyond the locked catalog
- Telegram formatting / buttons (see [telegram-tasks.md](telegram-tasks.md))

## Related

- Ticket system: [tickets.md](tickets.md)
- Spec: [deck-and-ritual.md](../spec/deck-and-ritual.md), [spreads.md](../spec/spreads.md)
- Core package: [packages/core/AGENTS.md](../packages/core/AGENTS.md)
