# Telegram outbound formatting (agent reference)

Stable pointer for T2 send-path work. Prefer this doc + official links over pasting the whole Bot API into chat.

## Official sources (canonical)

| Topic | URL |
|-------|-----|
| Formatting options (`parse_mode` on `sendMessage`) | https://core.telegram.org/bots/api#formatting-options |
| Rich Messages (`sendRichMessage` / drafts / blocks) | https://core.telegram.org/bots/api#rich-messages |
| Full Bot API | https://core.telegram.org/bots/api |

Re-check those pages when Telegram ships API changes. Do not treat this file as a full mirror of the Bot API.

## Phase 1 lock (Prophet)

- Outbound mode: **`parse_mode: HTML`** — constant `PHASE1_PARSE_MODE` in the Grammy adapter
- Not MarkdownV2 for Phase 1 (stricter escaping; more brittle with LLM prose)
- Not legacy `Markdown`
- **Rich Messages** (`sendRichMessage`, Rich HTML / Rich Markdown, block streaming) are a **separate API surface** — out of scope for T2.1–T2.5; revisit later if product wants streamed rich replies

T2 pipeline: choose mode (done) → always pass `parse_mode` → convert/sanitize LLM text → plain-text fallback on API parse fail → prompt for light emphasis only. Board: [tech/telegram-tasks.md](../../tech/telegram-tasks.md) (T2).

## Classic HTML (`parse_mode: HTML`) — what agents need

Pass `HTML` in `parse_mode` on `sendMessage` / `editMessageText` / etc.

**Escape** every `<`, `>`, `&` that is not part of a supported tag or entity:

| Char | Entity |
|------|--------|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |

Supported named entities (API): `&lt;` `&gt;` `&amp;` `&quot;` (plus numerical entities).

**Common tags** (see Formatting options for the full current list):

- Bold: `<b>` / `<strong>`
- Italic: `<i>` / `<em>`
- Underline: `<u>` / `<ins>`
- Strikethrough: `<s>` / `<strike>` / `<del>`
- Spoiler: `<tg-spoiler>` / `<span class="tg-spoiler">`
- Inline code: `<code>`
- Pre block: `<pre>` / `<pre><code class="language-…">`
- Link: `<a href="…">`
- Block quote: `<blockquote>` (and expandable form when documented)

Only documented tags are safe. Nested emphasis is allowed in HTML mode more freely than legacy Markdown.

## MarkdownV2 (not Phase 1)

Many characters must be escaped with `\`: `_ * [ ] ( ) ~ ` > # + - = | { } . !` (and more inside links/code). Prefer HTML for Phase 1 unless a later ticket revisits.

## Rich Messages (later)

Bot API 10.x **Rich Messages** add structured blocks, Rich HTML / Rich Markdown, `sendRichMessage`, and streaming drafts. Useful for AI-style streamed replies — **not** the same as setting `parse_mode` on a normal text message.

Phase 1 DM readings stay on classic `sendMessage` + HTML until a product ticket explicitly adopts Rich Messages.

## Agent checklist (T2.2–T2.4)

1. Never send raw LLM markdown with `*` as Telegram markup without conversion
2. Always set `parse_mode` to `PHASE1_PARSE_MODE` on outbound text
3. Escape user/model text for HTML before/while converting emphasis
4. On Telegram “can't parse entities” → resend plain text (no crash)
5. Keep ceremonial prose short; avoid tables/lists that fight DM HTML
