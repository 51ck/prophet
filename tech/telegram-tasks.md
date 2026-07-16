# Telegram client — ticket board

Board under the [in-repo ticket system](tickets.md). Prototype → product. Spec/voice: [spec/telegram-ux.md](../spec/telegram-ux.md), [spec/memory.md](../spec/memory.md), [spec/roadmap.md](../spec/roadmap.md). Arch: [architecture.md](architecture.md).

## Why

Core ritual MVP and Grammy DM path exist. Remaining work = DM fluency and seeker-fit before Phase 3 polish is “done.”

## Themes

1. **Prophet can act in Telegram** — structured choices as buttons, not only typed replies
2. **Messages look intentional** — formatting reaches Telegram, not raw `*` markup
3. **Soft profile for accuracy** — name / age / language / sex (and kin) collected fluently, optionally, rejectably during introduce

---

## T0 — Adapter baseline

**Problem:** Without a live DM path, no product Telegram work is real.

**Done when:** Seeker can `/start`, chat in DM, get Pythia replies backed by core session/ritual.

**Depends on:** `@prophet/core` MVP

**Tasks:**

- [x] **T0.1** Grammy DM bot: receive message → core reading turn → send reply
- [x] **T0.2** Seeker/session id bridge (Telegram user → core seeker)
- [x] **T0.3** Mid-ritual abandon = fresh next visit (Phase 1 lock)
- [x] **T0.4** Basic /start introduce presence (character, not menu)

---

## T1 — Structured choices as Telegram buttons

**Problem:** When Pythia asks a simple closed question, the seeker should tap an answer instead of typing.

**Done when:** Closed asks can show inline options + skip/reject; free text still works; no menu maze.

**Depends on:** T0

**Product intent:**

- Buttons speed a clear choice; free text always remains valid
- Reject / skip is first-class
- Few options, short labels, ceremonial not bureaucratic

**Tasks:**

- [ ] **T1.1** Spec lock: when buttons are allowed (closed set ≤ N; yes/no; lock; deck; cut; open-next; profile skips) vs free prose only
- [ ] **T1.2** Core channel-agnostic “ask with options” verb (options + optional skip/reject) — adapter decides chrome
- [ ] **T1.3** Grammy: inline keyboard; callback → seeker turn; expire/replace after answer
- [ ] **T1.4** Pythia prefers options for simple asks (intake, offer, ritual pace) — not every utterance
- [ ] **T1.5** Seeker can type free answer or decline; no force-retry loops

---

## T2 — Message formatting (no raw `*` in chat)

**Problem:** LLM markdown shows as literal `*` without proper `parse_mode` / escaping.

**Done when:** Outbound messages render emphasis correctly or fall back to clean plain text.

**Depends on:** T0

**Tasks:**

- [ ] **T2.1** Choose Telegram parse mode for Phase 1 outbound (prefer HTML, or MarkdownV2 with strict escapers)
- [ ] **T2.2** Adapter send path always applies chosen `parse_mode`; never forward raw LLM string unprocessed
- [ ] **T2.3** Convert/sanitize model output → Telegram-safe markup
- [ ] **T2.4** Fallback: parse fail → resend plain text (no crash, no half-broken stars)
- [ ] **T2.5** Prompt: short ceremonial prose; light emphasis only — no heavy markdown tables/lists in DM

---

## T3 — Soft seeker profile (introduce, fluent, rejectable)

**Problem:** Accurate readings need light facts; forms break character; never asking leaves Pythia guessing.

**Done when:** Optional profile fields can be asked fluently, skipped, stored in memory, and used without stereotyping or gating ritual.

**Depends on:** T0; T1 for buttoned reject; memory beyond notes-only MVP

**Candidate fields (all optional):**

| Field | Why | Notes |
|-------|-----|--------|
| Preferred name / address | Trust, continuity | Telegram `first_name` default |
| Language | Reply language | Prefer `language_code`; ask if unclear |
| Age (range ok) | Life-stage counsel | Skip-friendly |
| Sex / gender | Pronouns / framing if sought | Rejectable; do not invent |

**Product intent:** see [spec/memory.md](../spec/memory.md) — weave into introduce; rejectable; never gate ritual.

**Tasks:**

- [ ] **T3.1** Spec: Phase 1 soft-profile fields; privacy one-liner if needed
- [ ] **T3.2** Memory shape: structured optional profile + free notes
- [ ] **T3.3** Introduce: at most one gentle profile ask per turn when natural; never block lockQuestion
- [ ] **T3.4** Seed name + language from Telegram; ask only to refine
- [ ] **T3.5** Buttons for profile + Skip / Prefer not to say (reuse T1)
- [ ] **T3.6** On reject: remember declined; no re-grill; reopen only after gap / explicit ask
- [ ] **T3.7** Prompt: use profile for register — never stereotype from sex/age alone

---

## Suggested build order

```text
T0 adapter baseline (done)
  → T2 formatting (cheap, high visible quality)
  → T1 ask-with-options + buttons
  → T3 soft profile on introduce (uses T1 + memory)
```

Roadmap: Phase 1 DM path completing + early Phase 3 fluency. Soft profile = Phase 1 memory enrichment.

## Out of scope (this board)

- Mini-apps / web UI as main shell
- Mandatory demographics gate
- Group summon etiquette (Phase 3 later)
- Stars / paywall
- Card image CDN

## Related

- Ticket system: [tickets.md](tickets.md)
- UX: [spec/telegram-ux.md](../spec/telegram-ux.md)
- Memory: [spec/memory.md](../spec/memory.md)
- Session: [spec/session.md](../spec/session.md)
- Roadmap: [spec/roadmap.md](../spec/roadmap.md)
