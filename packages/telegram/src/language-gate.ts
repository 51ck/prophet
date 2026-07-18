import {
  LANGUAGE_ASK_PROMPT,
  createLanguageAsk,
  isLanguageAsk,
  parseSeekerLanguage,
  type AskWithOptions,
  type SeekerLanguage,
} from "@prophet/core";

export { LANGUAGE_ASK_PROMPT };

/** Profile language if already saved. */
export function savedLanguage(
  profile: { language?: SeekerLanguage },
): SeekerLanguage | undefined {
  return profile.language === "ru" || profile.language === "en"
    ? profile.language
    : undefined;
}

/** Build the introduce language ask (T1 chrome). */
export function languageAsk(): AskWithOptions {
  return createLanguageAsk();
}

/**
 * Resolve a seeker reply into ru|en when we still need a language (introduce only).
 * Mid-session language change is agent + updateSeekerProfile — not phrase parsing.
 */
export function resolveLanguageChoice(text: string): SeekerLanguage | undefined {
  return parseSeekerLanguage(text);
}

export type LanguageGateDecision =
  | { action: "accept"; language: SeekerLanguage }
  /** Invalid reply while language ask was pending — restore keyboard, no new prompt. */
  | { action: "restore-pending" }
  /** Prompt already in history, pending lost — re-offer keyboard without history push. */
  | { action: "reoffer" }
  /** First ask. */
  | { action: "ask" };

/** Decide introduce language gate without duplicating the bilingual prompt. */
export function decideLanguageGate(input: {
  turnText: string;
  pendingAsk?: AskWithOptions;
  alreadyPromptedInHistory: boolean;
}): LanguageGateDecision {
  const language = resolveLanguageChoice(input.turnText);
  if (language) return { action: "accept", language };
  if (input.pendingAsk && isLanguageAsk(input.pendingAsk)) {
    return { action: "restore-pending" };
  }
  if (input.alreadyPromptedInHistory) return { action: "reoffer" };
  return { action: "ask" };
}

export function languagePromptAlreadyInHistory(
  history: ReadonlyArray<{ role: string; content: string }>,
): boolean {
  return history.some(
    (m) => m.role === "assistant" && m.content === LANGUAGE_ASK_PROMPT,
  );
}
