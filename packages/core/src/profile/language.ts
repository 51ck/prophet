import {
  createAskWithOptions,
  type AskWithOptions,
} from "../ask/ask-with-options.ts";
import type { SeekerLanguage } from "../memory/store.ts";

/** Bilingual closed-ask prompt for introduce (T3.11). */
export const LANGUAGE_ASK_PROMPT = "Choose a language / Выбери язык:";

/** Closed ru|en ask — adapter shows T1 buttons. */
export function createLanguageAsk(): AskWithOptions {
  return createAskWithOptions({
    options: [
      { id: "ru", label: "Русский" },
      { id: "en", label: "English" },
    ],
  });
}

/** True when ask is the Phase 1 language pick (no skip). */
export function isLanguageAsk(ask: AskWithOptions): boolean {
  if (ask.allowSkip || ask.options.length !== 2) return false;
  const ids = new Set(ask.options.map((o) => o.id));
  return ids.has("ru") && ids.has("en");
}

/** Map button label, id, or common typed reply → ru|en (introduce choice only). */
export function parseSeekerLanguage(text: string): SeekerLanguage | undefined {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (t === "ru" || t === "рус" || t === "русский" || t === "russian") {
    return "ru";
  }
  if (
    t === "en" ||
    t === "eng" ||
    t === "english" ||
    t === "английский" ||
    t === "англ"
  ) {
    return "en";
  }
  return undefined;
}
