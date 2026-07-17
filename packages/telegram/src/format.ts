/**
 * Phase 1 Telegram HTML helpers (T2.3).
 * Convert light LLM markdown emphasis → tags, escape the rest.
 * @see docs/formatting.md
 */

/** Escape plain text for Telegram HTML parse_mode. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const PLACEHOLDER = "\u0000";

/**
 * Convert light markdown emphasis to Telegram HTML and escape remaining text.
 * Supports `**bold**`, `*italic*`, `__bold__`, `_italic_`. Tags from conversion
 * are not double-escaped.
 */
export function toTelegramHtml(text: string): string {
  const held: string[] = [];
  const hold = (html: string): string => {
    const i = held.length;
    held.push(html);
    return `${PLACEHOLDER}${i}${PLACEHOLDER}`;
  };

  let s = text;

  // Longer delimiters first so ** / __ are not eaten by * / _
  s = s.replace(/\*\*(.+?)\*\*/gs, (_, inner: string) =>
    hold(`<b>${escapeHtml(inner)}</b>`),
  );
  s = s.replace(/__(.+?)__/gs, (_, inner: string) =>
    hold(`<b>${escapeHtml(inner)}</b>`),
  );
  s = s.replace(/\*(.+?)\*/gs, (_, inner: string) =>
    hold(`<i>${escapeHtml(inner)}</i>`),
  );
  s = s.replace(/_(.+?)_/gs, (_, inner: string) =>
    hold(`<i>${escapeHtml(inner)}</i>`),
  );

  s = escapeHtml(s);
  return s.replace(
    new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, "g"),
    (_, i: string) => held[Number(i)] ?? "",
  );
}
