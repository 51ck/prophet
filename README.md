# prophet

Tarot prophet **Pythia** — authentic ritual readings on Telegram (web later).

## Docs

- Product idea: [`spec/`](spec/AGENTS.md)
- Architecture: [`tech/architecture.md`](tech/architecture.md)

## Stack

Bun workspaces · TypeScript 7 · oxlint · Mastra · Grammy (adapter next) · Docker Compose + GHCR

## Packages

- `@prophet/core` — ritual, session, memory, Pythia agent
- `@prophet/telegram` — stub; Grammy next

## Dev

```bash
bun install
bun run lint
bun run typecheck
bun test
```

Pre-commit runs lint + typecheck.

## Env

Copy `.env.example` → `.env`. Set `DEEPSEEK_API_KEY` or `OPENAI_API_KEY` and `MODEL_ID`.
