# Telegram UX

## Surfaces

- **Direct message (primary)** — intimate reading space; full session arc lives here
- **Group summon** — Phase 3; prophet can be present; summon starts a path into a reading. Etiquette open until then

## Fluency goals

- Natural language first; few mandatory commands
- Ritual progress visible without message spam
- Card reveals feel ceremonial (pace and framing matter more than chrome)
- Seeker always knows: are we in intake, deck offer, ritual, or closing?
- Mid-ritual questions feel natural in the same thread as the reading

## Interaction principles

- Prefer short prophet turns over walls of text
- One clear next step when the seeker might be stuck (lock question, accept deck, cut, open next)
- Optional controls (buttons or quick replies) only for **simple closed choices** — see [Buttons vs free prose](#buttons-vs-free-prose); never a menu maze
- Free text always remains valid alongside buttons; decline / skip is first-class when the ask is optional
- Outbound messages must render intentional emphasis (Telegram parse mode) — seekers must not see raw `*` markup
- Group: protect seeker privacy by default until a deliberate design says otherwise

## Buttons vs free prose

**Budget:** at most **N = 6** labeled choices per ask (skip / decline chrome does not count toward N). Prefer 2–3. Short labels. One closed ask at a time.

**Buttons allowed** — prophet asks a closed set the seeker can pick without composing an answer:

| Moment | Typical closed set |
|--------|--------------------|
| Language (introduce or later change) | ru / en |
| Session path | Card of the Day / find a question |
| Lock question | confirm / rephrase (and similar yes/no) |
| Deck offer | accept offered deck / choose another (≤ N named decks if shortlisted) |
| Cut | accept cut invite / decline (and similar pace yes/no) |
| Open-next | open next / wait (and similar reveal-pace yes/no) |
| Other closed yes/no or pick-one | any simple closed set with **2…N** options |

**Free prose only** — no buttons; seeker answers in their own words:

- Open intake (what weighs on them, shaping the question)
- Name and “few words about self” after language
- Open ritual questions (feeling, nuance, anything not a small closed set)
- Interpretation dialogue and free counsel after cards
- Any ask where the honest answer set is open-ended or would need more than N labels

**Always:** typed reply remains valid even when buttons are shown; optional asks may include skip / prefer-not; never force-retry until the seeker taps a button.

## Phase 1 locks (DM ritual core)

| Topic | Decision |
|-------|----------|
| Surface | **DM only** for full ritual |
| Reveal chrome | **Text names** + short imagery cue; card images later |
| Controls | Natural language first; buttons only for closed sets ≤ **N = 6** (language, path, lock, deck, cut, open-next, yes/no / pick-one) — free prose otherwise; see above |
| Message formatting | Channel sends with a chosen Telegram parse mode; broken markup falls back to plain text |
| Soft profile on introduce | Language (ru/en) first → name + few words about self; profile filled **transparently** (no “saving data” talk); scoped to this seeker only — see [memory.md](memory.md) |
| Language | Chosen once at introduce; prophet may change it later on seeker request |
| Session path | After presence: offer **Card of the Day** or **find a question** (then answer) — see [session.md](session.md) |
| Abandon mid-ritual | Next visit = **fresh start** (no resume yet) |
| Group | Not in Phase 1 |

## Open questions (post–Phase 1)

1. **Group reading locus** — full ritual in group, or summon → continue in DM?
2. **Reveal chrome later** — images, progressive edits of one message, or short thread of opens?
3. **Interruptions** — how group noise or multiple speakers affect a single reading
4. **Session resume** — after Phase 1, mid-ritual leave: resume vs always fresh?
5. **Visibility of deck state** — how much inspectability without breaking ceremony
6. **More languages** — beyond ru/en

## Prototype → product tasks

Build board (in-repo tickets): [tech/telegram-tasks.md](../tech/telegram-tasks.md) — see [tech/tickets.md](../tech/tickets.md). T0 adapter done; open: buttons, formatting, introduce/profile (T3).

## Non-goals (for now)

- Mini-apps or external web UI as the main interface
- Dense command menus as the default path
- Public performance readings without an explicit privacy model

## Related

- Session arc: [session.md](session.md)
- Prophet behavior: [agent.md](agent.md)
- When polish lands: [roadmap.md](roadmap.md)
