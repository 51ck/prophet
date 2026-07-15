# Telegram client — task backlog

Collect-only list: prototype → product. No implementation tickets executed here; this is the work board for later builds.

Product locks and voice live in [spec/telegram-ux.md](../spec/telegram-ux.md), [spec/memory.md](../spec/memory.md), [spec/roadmap.md](../spec/roadmap.md). Architecture: [architecture.md](architecture.md).

## Why this list

Core ritual MVP exists (`feat/core-mvp`). Telegram adapter is still the gap that turns a working prophet into a usable product. These tasks are the DM fluency and seeker-fit work before Phase 3 polish is “done.”

## Themes

1. **Prophet can act in Telegram** — structured choices as buttons, not only typed replies
2. **Messages look intentional** — formatting reaches Telegram, not raw `*` markup
3. **Soft profile for accuracy** — name / age / language / sex (and kin) collected fluently, optionally, rejectably during introduce

---

## T1 — Structured choices as Telegram buttons

**Problem:** When Pythia asks a simple closed question, the seeker should tap an answer instead of typing. Spec already allows light buttons for ritual choices; product want is broader: any simple prophet question with a small answer set.

**Product intent (see spec):**

- Buttons speed a clear choice; free text always remains valid
- Reject / skip is first-class (decline the ask, not only pick an option)
- Not a menu maze — few options, short labels, ceremonial not bureaucratic

**Tasks:**

- [ ] **T1.1** Spec lock: when buttons are allowed (closed set ≤ N options; yes/no; lock question; accept/other deck; cut; open-next; soft profile skips) vs when free prose only
- [ ] **T1.2** Core channel-agnostic “ask with options” verb (options + optional skip/reject) — adapter decides chrome
- [ ] **T1.3** Grammy: render inline keyboard; map callback → core as seeker turn; expire / replace keyboards after answer
- [ ] **T1.4** Wire Pythia to prefer options for simple asks during intake, offer, ritual pace — not every utterance
- [ ] **T1.5** Seeker can type a free answer or decline; prophet continues without force-retry loops

**Depends on:** working Telegram send/receive path (adapter beyond stub)

---

## T2 — Message formatting (no raw `*` in chat)

**Problem:** LLM emits markdown emphasis; seekers see literal `*` instead of bold/italic. Almost always missing or mismatched `parse_mode`, or MarkdownV2 escaping failing so send falls back / strips wrong.

**Tasks:**

- [ ] **T2.1** Choose Telegram parse mode for Phase 1 outbound (prefer HTML for robustness, or MarkdownV2 with strict escapers)
- [ ] **T2.2** Adapter send path always applies chosen `parse_mode`; never forward raw LLM string unprocessed
- [ ] **T2.3** Convert/sanitize model output → Telegram-safe markup (strip unsupported constructs; escape specials)
- [ ] **T2.4** Fallback: if parse fails, resend plain text without markup (no crash, no half-broken stars)
- [ ] **T2.5** Prompt guidance: short ceremonial prose; light emphasis only — do not rely on heavy markdown tables/lists in DM

**Depends on:** outbound reply path in `packages/telegram`

---

## T3 — Soft seeker profile (introduce, fluent, rejectable)

**Problem:** More accurate readings need light facts about the seeker. Asking as a form breaks character; never asking leaves Pythia guessing.

**Candidate fields (all optional):**

| Field | Why | Notes |
|-------|-----|--------|
| Preferred name / address | Trust, continuity | Telegram `first_name` as default; confirm or ask preferred |
| Language | Reply language | Prefer Telegram `language_code` / message language; ask only if unclear |
| Age (range ok) | Tone, life-stage counsel | Sensitive; skip-friendly; range > exact if possible |
| Sex / gender | Pronouns, framing (if sought) | Sensitive; rejectable; do not invent |
| (Later) pace / reveal preference | Fluency | Already in memory spirit as practical preference |

**Product intent (see [spec/memory.md](../spec/memory.md)):**

- Weave into first-session introduce / early intake — not a checklist dump
- Each ask is rejectable (button skip or “I’d rather not”)
- Stored as seeker memory useful to accuracy; fluency rule still holds (no dossier at hello on return visits)
- Never gate ritual on demographics

**Tasks:**

- [ ] **T3.1** Spec: which fields in Phase 1 soft profile; which wait; privacy copy one-liner if needed
- [ ] **T3.2** Memory shape: structured optional profile fields + existing free notes (without becoming a CRM schema)
- [ ] **T3.3** Introduce flow: greet → soft continuity → at most one gentle profile ask per turn when natural; never block lockQuestion
- [ ] **T3.4** Telegram defaults: seed name + language from Telegram identity; only ask to refine
- [ ] **T3.5** Buttons for profile choices + explicit Skip / Prefer not to say (reuse T1)
- [ ] **T3.6** On reject: remember “declined X” lightly so she does not re-grill; may ask again only after long gap / explicit reopen
- [ ] **T3.7** Prompt: use profile only when it improves interpretation register — never stereotype from sex/age alone

**Depends on:** T1 for buttoned reject; memory store beyond notes-only MVP

---

## T0 — Adapter baseline (prerequisite)

Needed before T1–T3 product feel is real:

- [ ] **T0.1** Grammy DM bot: receive message → core reading turn → send reply
- [ ] **T0.2** Seeker/session id bridge (Telegram user → core seeker)
- [ ] **T0.3** Mid-ritual abandon = fresh next visit (Phase 1 lock)
- [ ] **T0.4** Basic /start introduce presence (character, not menu)

---

## Suggested build order

```text
T0 adapter baseline
  → T2 formatting (cheap, high visible quality)
  → T1 ask-with-options + buttons
  → T3 soft profile on introduce (uses T1 + memory)
```

Roadmap home: mostly **Phase 1 DM path** completing + early **Phase 3 Telegram fluency**. Soft profile is also a **Phase 1 memory** enrichment, not monetization.

## Explicit non-goals (this board)

- Mini-apps / web UI as main shell
- Mandatory demographics gate
- Group summon etiquette (Phase 3 later)
- Stars / paywall
- Card image CDN

## Related

- UX principles: [spec/telegram-ux.md](../spec/telegram-ux.md)
- Memory / who they are: [spec/memory.md](../spec/memory.md)
- Session introduce / intake: [spec/session.md](../spec/session.md)
- Roadmap phases: [spec/roadmap.md](../spec/roadmap.md)
