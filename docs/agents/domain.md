# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. Layout: **multi-context** (this repo is a Bun monorepo — `packages/core`, `packages/telegram`).

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root, if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`packages/<context>/CONTEXT.md`** for the context(s) you're about to touch.
- **`docs/adr/`** at the repo root — system-wide decisions. Also check **`packages/<context>/docs/adr/`** for context-scoped decisions in the context you're touching.

If any of these files don't exist yet, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── packages/
    ├── core/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← core-scoped decisions
    └── telegram/
        ├── CONTEXT.md
        └── docs/adr/                  ← telegram-scoped decisions
```

## Relationship to `spec/` and `tech/`

This repo already carries a DOX (`AGENTS.md`) hierarchy: [`spec/`](../../spec/AGENTS.md) owns product idea/roadmap, [`tech/`](../../tech/AGENTS.md) owns architecture and the ticket boards. `CONTEXT.md`/`CONTEXT-MAP.md` and `docs/adr/` are a separate, narrower layer underneath that: a glossary of domain vocabulary and dated architectural decisions, scoped per package. They do not replace or duplicate `spec/`/`tech/` — when a term or decision is already fully covered there, don't fork a second copy into `CONTEXT.md`; link to it instead.

## Use the glossary's vocabulary

When your output names a domain concept (in a ticket title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR (root or package-scoped), surface it explicitly rather than silently overriding:

> _Contradicts packages/core/docs/adr/0002-... — but worth reopening because…_
