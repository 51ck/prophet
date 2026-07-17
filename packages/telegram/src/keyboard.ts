import { InlineKeyboard } from "grammy";
import type { AskWithOptions } from "@prophet/core";

/** Callback data prefix; keep short (Telegram ≤64 bytes). */
const OPT_PREFIX = "ao:";
export const SKIP_CALLBACK = "ao:skip";
export const SKIP_SEEKER_TEXT = "skip";

export type ParsedAskCallback =
  | { kind: "option"; index: number }
  | { kind: "skip" };

/** Build inline keyboard for a closed ask. Skip row only when allowSkip. */
export function buildAskKeyboard(ask: AskWithOptions): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (let i = 0; i < ask.options.length; i++) {
    const opt = ask.options[i]!;
    if (i > 0 && i % 2 === 0) kb.row();
    kb.text(opt.label, `${OPT_PREFIX}${i}`);
  }
  if (ask.allowSkip) {
    kb.row().text("Skip", SKIP_CALLBACK);
  }
  return kb;
}

/** Parse callback_data from our ask keyboard. Returns null if not ours. */
export function parseAskCallback(data: string): ParsedAskCallback | null {
  if (data === SKIP_CALLBACK) return { kind: "skip" };
  if (!data.startsWith(OPT_PREFIX)) return null;
  const rest = data.slice(OPT_PREFIX.length);
  if (rest === "skip") return { kind: "skip" };
  if (!/^\d+$/.test(rest)) return null;
  return { kind: "option", index: Number(rest) };
}

/** Resolve callback to seeker-turn text using the pending ask. */
export function resolveAskChoice(
  ask: AskWithOptions,
  parsed: ParsedAskCallback,
): string | null {
  if (parsed.kind === "skip") {
    return ask.allowSkip ? SKIP_SEEKER_TEXT : null;
  }
  const opt = ask.options[parsed.index];
  return opt ? opt.label : null;
}

/** Natural typed declines (en/ru). Matched after trim + lower + collapse space. */
const TYPED_DECLINE_PHRASES = new Set([
  "skip",
  "decline",
  "pass",
  "no thanks",
  "no thank you",
  "prefer not",
  "prefer not to",
  "i'd rather not",
  "id rather not",
  "not now",
  "пропустить",
  "пропуск",
  "не хочу",
  "потом",
  "отказ",
]);

export function isTypedDecline(text: string): boolean {
  const key = text.trim().toLowerCase().replace(/\s+/g, " ");
  return TYPED_DECLINE_PHRASES.has(key);
}

/**
 * Free text always accepted as the seeker turn.
 * When pending ask allows skip, map natural decline phrases to skip text.
 */
export function normalizeTypedAskReply(
  ask: AskWithOptions | undefined,
  text: string,
): string {
  if (ask?.allowSkip && isTypedDecline(text)) return SKIP_SEEKER_TEXT;
  return text;
}
