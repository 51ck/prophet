# Telegram client — ticket board

Board under the [in-repo ticket system](tickets.md). Prototype → product. Spec/voice: [spec/telegram-ux.md](../spec/telegram-ux.md), [spec/memory.md](../spec/memory.md), [spec/roadmap.md](../spec/roadmap.md). Arch: [architecture.md](architecture.md).

## Why

Core ritual MVP and Grammy DM path exist. Remaining work = DM fluency and seeker-fit before Phase 3 polish is “done.”

## Themes

1. **Prophet can act in Telegram** — structured choices as buttons, not only typed replies
2. **Messages look intentional** — formatting reaches Telegram, not raw `*` markup (Phase 1 `parse_mode`: **HTML**)
3. **Introduce + seeker profile** — language → name/self; transparent fill; one-seeker isolation
4. **Session path** — Card of the Day vs find a question

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

- [x] **T1.1** Spec lock: when buttons are allowed (closed set ≤ N; yes/no; language; session path; lock; deck; cut; open-next) vs free prose only
- [x] **T1.2** Core channel-agnostic “ask with options” verb (options + optional skip/reject) — adapter decides chrome
- [x] **T1.3** Grammy: inline keyboard; callback → seeker turn; expire/replace after answer
- [x] **T1.4** Pythia prefers `askWithOptions` for closed simple asks (language, path, lock, deck, cut, open-next, yes/no / pick-one; prefer 2–3, max 6) — not every utterance; open intake / name+self stay free prose
- [x] **T1.5** Seeker can type free answer or decline; no force-retry loops

---

## T2 — Message formatting (no raw `*` in chat)

**Problem:** LLM markdown shows as literal `*` without proper `parse_mode` / escaping.

**Done when:** Outbound messages render emphasis correctly or fall back to clean plain text.

**Depends on:** T0

**Spec / arch / reference:** [spec/telegram-ux.md](../spec/telegram-ux.md), [packages/telegram/docs/formatting.md](../packages/telegram/docs/formatting.md) (Bot API formatting + Rich Messages)

**Tasks:**

- [x] **T2.1** Choose Telegram parse mode for Phase 1 outbound — **HTML** (not MarkdownV2; fewer escape pitfalls)
- [x] **T2.2** Adapter send path always applies chosen `parse_mode`; never forward raw LLM string unprocessed
- [x] **T2.3** Convert/sanitize model output → Telegram-safe markup
- [x] **T2.4** Fallback: parse fail → resend plain text (no crash, no half-broken stars)
- [x] **T2.5** Prompt: short ceremonial prose; light emphasis only — no heavy markdown tables/lists in DM

---

## T3 — Introduce flow + seeker profile

**Problem:** First visit needs a language and a sense of who the seeker is — without form theater, without “we are saving your data,” and without any cross-seeker profile access.

**Done when:** New seeker picks **ru/en**, prophet continues in that language, asks name + a few words about themselves, fills profile silently, can change language later on request; agent tools never touch another seeker’s profile in the same context.

**Depends on:** T0; T1 for language buttons (T3.4+); memory beyond notes-only MVP

**Spec / arch:** [spec/memory.md](../spec/memory.md), [spec/telegram-ux.md](../spec/telegram-ux.md), [spec/agent.md](../spec/agent.md)

**Product intent:**

1. No language saved → ask **ru / en** → save → speak that language
2. Ask **name** + **few words about seeker**
3. Profile fill is **transparent** — never announce persistence / CRM / “I’ll remember that for my records”
4. Profile is **only** for this seeker chat/session — no multi-profile interaction

**Cancelled (superseded by locks above):**

- [x] **T3.1** (cancelled) Spec: Phase 1 soft-profile fields; privacy one-liner if needed
- [x] **T3.2** (cancelled) Memory shape: structured optional profile + free notes
- [x] **T3.3** (cancelled) Introduce: at most one gentle profile ask per turn when natural
- [x] **T3.4** (cancelled) Seed name + language from Telegram; ask only to refine
- [x] **T3.5** (cancelled) Buttons for profile + Skip / Prefer not to say
- [x] **T3.6** (cancelled) On reject: remember declined; no re-grill
- [x] **T3.7** (cancelled) Prompt: use profile for register — never stereotype from sex/age alone

**Tasks:**

- [x] **T3.8** Spec lock: introduce order (lang → name/self); transparent fill; profile isolation — done in memory/telegram-ux/agent + this board
- [x] **T3.9** Memory shape: `language` (ru|en) + preferred name + self notes; keyed strictly by seeker id
- [x] **T3.10** Core: profile read/write verbs bound to **current seeker only** — no tool to select/load another profile
- [x] **T3.11** `/start` / first turn: if no language, ask ru|en (T1 buttons); persist; continue in that language
- [x] **T3.12** After language: ask name + few words about seeker; write profile from answers **without** meta disclosure
- [ ] **T3.13** Language change on seeker request: persist + switch register for later turns
- [ ] **T3.14** Prompt/character: transparent profile use; never narrate saving; never imply access to other seekers

---

## T9 — Session path (day card vs question)

**Problem:** Seeker arrival should not always force long intake. Light day counsel and a full question-reading are both valid.

**Done when:** After introduce/presence, prophet offers **Card of the Day** or **find a question**; day path uses implicit day-counsel + `card-of-day`; question path keeps intake → lock → reading.

**Depends on:** T0; T1 for path buttons; T3 introduce; `card-of-day` spread (T8.2)

**Spec / arch:** [spec/session.md](../spec/session.md), [spec/spreads.md](../spec/spreads.md), [spec/telegram-ux.md](../spec/telegram-ux.md)

**Tasks:**

- [x] **T9.1** Spec lock: path choice + day-card implicit question — done in session/telegram-ux/spreads/agent
- [ ] **T9.2** After presence: offer path (day card / find question); buttons via T1; free text still valid
- [ ] **T9.3** Day-card path: lock implicit day counsel → deck (quick lean ok) → `card-of-day` ritual
- [ ] **T9.4** Question path: existing intake → lock → deck → spread matched to question
- [ ] **T9.5** Prompt: present both paths without menu maze; after day card, invite deeper question only if natural

---

## Suggested build order

```text
T0 adapter baseline (done)
  → T2 formatting (cheap, high visible quality)
  → T1 ask-with-options + buttons (needed for ru/en + path choice)
  → T3.8–T3.10 memory + isolation
  → T3.11–T3.14 introduce flow + language change + prompt
  → T9 session path (needs T1 + card-of-day from T8.2)
```

Roadmap: Phase 1 DM path completing + early Phase 3 fluency. Introduce/profile = Phase 1 memory enrichment.

## Out of scope (this board)

- Mini-apps / web UI as main shell
- Mandatory age/sex/kin demographics gate
- Age/sex as Phase 1 introduce fields
- Group summon etiquette (Phase 3 later)
- Stars / paywall
- Card image CDN
- Languages beyond ru/en (Phase 1)

## Related

- Ticket system: [tickets.md](tickets.md)
- UX: [spec/telegram-ux.md](../spec/telegram-ux.md)
- Memory: [spec/memory.md](../spec/memory.md)
- Session: [spec/session.md](../spec/session.md)
- Spreads: [spec/spreads.md](../spec/spreads.md)
- Roadmap: [spec/roadmap.md](../spec/roadmap.md)
