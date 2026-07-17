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

/** Map button label, id, or common typed reply → ru|en. */
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

/**
 * Clear seeker request to switch register (ru↔en).
 * Intent phrases only — not bare introduce labels or biography prose.
 */
export function parseLanguageChangeRequest(
  text: string,
): SeekerLanguage | undefined {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return undefined;

  const wantsEn =
    /\b(switch|change)\b.{0,20}\b(to\s+)?english\b/.test(t) ||
    /^(please\s+)?(speak|talk|reply|answer|write)\s+(in\s+)?english\b/.test(
      t,
    ) ||
    /^in english\b/.test(t) ||
    /^english please$/.test(t) ||
    /\blet'?s speak english\b/.test(t) ||
    /перейди на английск/.test(t) ||
    /давай на английск/.test(t) ||
    /говори по[- ]?английск/.test(t) ||
    t.startsWith("на английск");

  const wantsRu =
    /\b(switch|change)\b.{0,20}\b(to\s+)?russian\b/.test(t) ||
    /^(please\s+)?(speak|talk|reply|answer|write)\s+(in\s+)?russian\b/.test(
      t,
    ) ||
    /^in russian\b/.test(t) ||
    /^russian please$/.test(t) ||
    /\blet'?s speak russian\b/.test(t) ||
    /перейди на русск/.test(t) ||
    /давай на русск/.test(t) ||
    /говори по[- ]?русски/.test(t) ||
    t.startsWith("на русском") ||
    t === "по-русски" ||
    t === "по русски";

  if (wantsEn && !wantsRu) return "en";
  if (wantsRu && !wantsEn) return "ru";
  return undefined;
}

/** Presence opener when language + name/self are ready for path. */
export function presenceOpener(language: SeekerLanguage): string {
  if (language === "ru") {
    return "Я Пифия. Скажи, что не удаётся решить обычными средствами — найдём верный вопрос и прочитаем.";
  }
  return "I am Pythia. Tell me what you cannot settle by ordinary means — we will find a proper question, then read.";
}
