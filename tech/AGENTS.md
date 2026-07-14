# tech — Architecture

## Purpose

Own how the product idea in [spec/](../spec/AGENTS.md) becomes a running system. Stack choices, component ownership, and tool mapping live here. Product authenticity rules stay owned by `spec/`.

## Ownership

- Runtime architecture and stack
- Mapping of conceptual prophet verbs → agent tools
- Session state vs deck state vs seeker memory ownership (system view)
- Where deck content is loaded for the agent
- Env/secrets naming (not values)

Does not own: product vision, ritual authenticity rules, character voice (those stay in `spec/`).

## Local Contracts

- Architecture docs may name stack; they must not weaken authenticity contracts in `spec/`
- Code that appears later must match tool/state ownership described here
- No secrets in repo

## Work Guidance

## Verification

## Child DOX Index

Idea / architecture documents:

- [architecture.md](architecture.md) — Phase 1 system shape (TS / Mastra / Grammy)
