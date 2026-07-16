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

Does not own product vision or ritual authenticity rules (`spec/`).

## Local Contracts

- Must not weaken `spec/` authenticity
- Adapters own I/O only; channel tools call core verbs
- Prophet code name is **Pythia**
- Bun is the package manager and preferred local runtime
- No secrets in repo

## Work Guidance

- Before commit: `bun run lint` (oxlint) and `bun run typecheck` (enforced by `.githooks`)

## Verification

- `bun run lint`
- `bun run typecheck`
- `bun test` (packages with tests)

## Child DOX Index

- [architecture.md](architecture.md) — system shape, stack, deploy, models
- [../packages/core/AGENTS.md](../packages/core/AGENTS.md) — core package (when present)
