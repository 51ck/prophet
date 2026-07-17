# Spreads

## Principles

- Match spread size to question complexity
- Prefer fewer positions when the question is sharp
- Positions have roles; cards fill them by ritual draw (usually face-down until open)
- Prophet picks a spread after Commit; seeker may ask for fewer or more within reason
- Large classic layouts (Celtic Cross, Twelve Houses) only when the question or seeker clearly wants depth — not by default

Build board: [tech/ritual-tasks.md](../tech/ritual-tasks.md) (T8).

## Catalog (locked intent)

### Simple (1–3 cards)

| Id | Name | Cards | When it fits |
|----|------|-------|--------------|
| `card-of-day` | Card of the Day | 1 | Daily atmosphere, focus, or one piece of counsel |
| `single-focus` | Single Focus | 1 | Very sharp question — one hinge |
| `yes-no` | Yes / No | 3 | Clear closed question — always three desk slots; open `answer` first, open others only if nuance needed |
| `two-poles` | Two Poles | 2 | Clear either/or (pole A / pole B) — not forced binary |
| `past-present-future` | Past — Present — Future | 3 | How a situation unfolds in time |
| `thoughts-feelings-actions` | Thoughts — Feelings — Actions | 3 | How someone relates (mind / heart / behavior) |
| `three-roads` | Three Roads | 3 | Default Phase 1 shape: situation / counsel / path |

**Three Roads positions (default):**

| Position | Role |
|----------|------|
| situation | Situation — how the matter sits now |
| counsel | Counsel — what to hold or do |
| path | Path — unfolding to watch |

**Past — Present — Future:** `past` · `present` · `future`

**Thoughts — Feelings — Actions:** `thoughts` · `feelings` · `actions`

**Yes / No** (fixed 3 slots for the layout def): `answer` · `nuance` · `advice` — draw all three face-down; prophet may reveal only `answer` when a snap read is enough

**Two Poles:** `pole-a` · `pole-b`

**Card of the Day:** `focus` (day-card **session path** only)

**Single Focus:** `focus` (question path — sharp one-hinge)

### Thematic (4–7 cards)

| Id | Name | Cards | When it fits |
|----|------|-------|--------------|
| `relationship` | Relationship (“Station for Two”) | 7 | Partnership: both sides’ mind/heart/behavior + bond outlook |
| `work-finance` | Work & Finances | 6 | Job, career move, money risk, or stay-vs-leave |
| `choice` | Choice | 7 | Two alternative paths (A vs B) plus counsel |

**Relationship positions:**

| Position | Role |
|----------|------|
| self-thoughts | Seeker — thoughts about the bond |
| self-feelings | Seeker — feelings |
| self-actions | Seeker — behavior / what they do |
| other-thoughts | Other — thoughts |
| other-feelings | Other — feelings |
| other-actions | Other — behavior |
| outlook | Outlook — where the union is headed |

**Work & Finances positions:**

| Position | Role |
|----------|------|
| situation | Current work/money situation |
| strength | Strength or resource to lean on |
| obstacle | Obstacle or risk |
| opportunity | Opportunity or growth |
| money | Money / material thread |
| counsel | Counsel — what to do next |

**Choice positions:**

| Position | Role |
|----------|------|
| hinge | The choice itself — what is at stake |
| path-a-near | Path A — near consequence |
| path-a-far | Path A — farther unfolding |
| path-b-near | Path B — near consequence |
| path-b-far | Path B — farther unfolding |
| hidden | What is easy to miss |
| counsel | Counsel — how to choose |

### Complex / classic (10+)

| Id | Name | Cards | When it fits |
|----|------|-------|--------------|
| `celtic-cross` | Celtic Cross | 10 | Deep universal reading — roots, cross, environment, likely outcome |
| `twelve-houses` | Twelve Houses | 12 | Broad life-sphere forecast (year, birthday, new moon / full moon style) |

**Celtic Cross positions (classic order):**

| Position | Role |
|----------|------|
| present | Heart of the matter — present |
| cross | Crossing influence — challenge or catalyst |
| foundation | Foundation — root / basis |
| recent-past | Recent past — what is fading |
| crown | Crown — possible best / conscious aim |
| near-future | Near future — what approaches |
| self | Self — how the seeker stands in this |
| environment | Environment — others / setting |
| hopes-fears | Hopes and fears |
| outcome | Outcome — most likely resolution if the path continues |

**Twelve Houses positions** (one card per house):

| Position | Sphere |
|----------|--------|
| house-1 | Self / vitality |
| house-2 | Money / resources |
| house-3 | Mind / communication / siblings |
| house-4 | Home / roots / family |
| house-5 | Pleasure / romance / creation |
| house-6 | Work / health / daily duty |
| house-7 | Partnerships |
| house-8 | Shared resources / deep change |
| house-9 | Belief / travel / learning |
| house-10 | Career / public standing |
| house-11 | Friends / community / hopes |
| house-12 | Hidden / rest / release |

Optional 13th card later (`house-summary`) — not required for first implementation.

## Offering rule

- After **introduce** / when the seeker is present with language: offer **Card of the Day** or **find a question** (session path) — see [session.md](session.md)
- Day-card path → spread `card-of-day` only (do not reuse it as a question-path layout)
- Question path default lean: **Three Roads** for ordinary locked questions
- Sharp one-hinge (question path) → **Single Focus** only
- Clear binary → Two Poles or Choice
- Relationship / work questions → thematic spreads when depth helps
- Celtic Cross / Twelve Houses → only when seeker asks for a full classic or the matter is clearly wide
- Spread is chosen **after Commit** (question + deck locked)

## Related

- Ritual: [deck-and-ritual.md](deck-and-ritual.md)
- Session: [session.md](session.md)
- Tickets: [tech/ritual-tasks.md](../tech/ritual-tasks.md)
