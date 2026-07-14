# tech — Architecture

## Purpose

Own how the product idea in [spec/](../spec/AGENTS.md) becomes a running system. Stack choices, component ownership, core vs channel adapters, and tool mapping live here. Product authenticity rules stay owned by `spec/`.

## Ownership

- Runtime architecture and stack
- **Prophet core** (Pythia agent, ritual engine, memory, session) vs **channel adapters** (Telegram now; web later)
- Mapping of conceptual prophet verbs → agent tools
- Session state vs deck state vs seeker memory ownership (system view)
- Where deck content is loaded for the agent
- Env/secrets naming (not values)

Does not own: product vision, ritual authenticity rules, character voice (those stay in `spec/`).

## Local Contracts

- Architecture docs may name stack; they must not weaken authenticity contracts in `spec/`
- Adapters own I/O only; channel tools must call core ritual/memory/session verbs
- Code that appears later must match tool/state ownership described here
- Prophet code name is **Pythia**
- No secrets in repo

## Work Guidance

## Verification

## Child DOX Index

Idea / architecture documents:

- [architecture.md](architecture.md) — Phase 1 system shape; core vs adapters; TS / Mastra / Grammy
