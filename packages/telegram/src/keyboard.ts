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
