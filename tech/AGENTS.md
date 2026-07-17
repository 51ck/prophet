# tech — Architecture

## Purpose

Own how the product idea in [spec/](../spec/AGENTS.md) becomes a running system. Stack, Bun monorepo layout, core vs adapters, models, deploy, and tool mapping live here.

## Ownership

- Runtime architecture and stack (TS 7, Bun, Mastra, Grammy)
- Prophet core vs channel adapters
- Model env (`MODEL_ID`, OpenAI / DeepSeek keys)
- Deploy: Docker Compose + GHCR on `master`
- Lint / typecheck / pre-commit expectations
- Env/secrets naming (not values)
- In-repo ticket system + theme boards ([tickets.md](tickets.md))

Does not own product vision or ritual authenticity rules (`spec/`).

## Local Contracts

- Must not weaken `spec/` authenticity
- Adapters own I/O only; channel tools call core verbs
- Prophet code name is **Pythia**
- Bun is the package manager and preferred local runtime
- No secrets in repo
- Build tickets live on `tech/*-tasks.md` boards per [tickets.md](tickets.md) — not in `spec/`

## Work Guidance

- Before commit: `bun run lint` (oxlint) and `bun run typecheck` (enforced by `.githooks`)
- Agentic build work: take one open ticket ID from a board; mark `[x]` when done; commit message refs the ID

## Verification

- `bun run lint`
- `bun run typecheck`
- `bun test` (packages with tests)

## Child DOX Index

- [architecture.md](architecture.md) — system shape, stack, deploy, models; core vs adapters
- [tickets.md](tickets.md) — in-repo ticket system (IDs, boards, agent loop)
- [telegram-tasks.md](telegram-tasks.md) — Telegram board: T0–T3 (adapter, format, buttons, introduce/profile)
- [ritual-tasks.md](ritual-tasks.md) — Ritual board: T4–T7 (desk/pile, verbs, tests, prophet tools)
- [../packages/core/AGENTS.md](../packages/core/AGENTS.md) — core package
