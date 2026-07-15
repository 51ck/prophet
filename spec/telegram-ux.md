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
- Optional controls (buttons or quick replies) when they speed a **simple closed choice** — ritual steps and short yes/no / pick-one asks — not as a menu maze
- Free text always remains valid alongside buttons; decline / skip is first-class when the ask is optional
- Outbound messages must render intentional emphasis (Telegram parse mode) — seekers must not see raw `*` markup
- Group: protect seeker privacy by default until a deliberate design says otherwise

## Phase 1 locks (DM ritual core)

| Topic | Decision |
|-------|----------|
| Surface | **DM only** for full ritual |
| Reveal chrome | **Text names** + short imagery cue; card images later |
| Controls | Natural language first; light buttons for lock question / cut / open-next **and** other simple closed prophet questions |
| Message formatting | Channel sends with a chosen Telegram parse mode; broken markup falls back to plain text |
| Soft profile on introduce | Optional, fluent, rejectable — see [memory.md](memory.md); never gates the ritual |
| Abandon mid-ritual | Next visit = **fresh start** (no resume yet) |
| Group | Not in Phase 1 |

## Open questions (post–Phase 1)

1. **Group reading locus** — full ritual in group, or summon → continue in DM?
2. **Reveal chrome later** — images, progressive edits of one message, or short thread of opens?
3. **Interruptions** — how group noise or multiple speakers affect a single reading
4. **Session resume** — after Phase 1, mid-ritual leave: resume vs always fresh?
5. **Visibility of deck state** — how much inspectability without breaking ceremony
6. **Button budget** — exact max options per ask; whether profile Skip is always shown beside choices

## Prototype → product tasks

Collected (not implemented) build board: [tech/telegram-tasks.md](../tech/telegram-tasks.md) — buttons, formatting, soft profile, adapter baseline.

## Non-goals (for now)

- Mini-apps or external web UI as the main interface
- Dense command menus as the default path
- Public performance readings without an explicit privacy model

## Related

- Session arc: [session.md](session.md)
- Prophet behavior: [agent.md](agent.md)
- When polish lands: [roadmap.md](roadmap.md)
