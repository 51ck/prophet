/**
 * Phase 1 Telegram HTML helpers (T2.3–T2.4).
 * Convert light LLM markdown emphasis → tags, escape the rest.
 * Detect Telegram entity/parse rejects for plain-text fallback.
 * @see docs/formatting.md
 */

/** Escape plain text for Telegram HTML parse_mode. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function telegramErrorBlob(err: unknown): string {
  if (err == null || typeof err !== "object") return "";
  const parts: string[] = [];
  if (
    "description" in err &&
    typeof (err as { description: unknown }).description === "string"
  ) {
    parts.push((err as { description: string }).description);
  }
  if (err instanceof Error) parts.push(err.message);
  return parts.join("\n").toLowerCase();
}

/**
 * True when Telegram rejected the message for entity/parse_mode errors.
 * Other API/network errors stay false so callers can rethrow.
 */
export function isTelegramParseError(err: unknown): boolean {
  const blob = telegramErrorBlob(err);
  return (
    blob.includes("can't parse entities") ||
    blob.includes("cant parse entities")
  );
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
