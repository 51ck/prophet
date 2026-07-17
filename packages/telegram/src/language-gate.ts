import {
  LANGUAGE_ASK_PROMPT,
  createLanguageAsk,
  parseSeekerLanguage,
  presenceOpener,
  type AskWithOptions,
  type SeekerLanguage,
} from "@prophet/core";

export { LANGUAGE_ASK_PROMPT, presenceOpener };

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
 * Resolve a seeker reply into ru|en when we still need a language.
 * Returns undefined if text is not a language choice (re-ask).
 */
export function resolveLanguageChoice(text: string): SeekerLanguage | undefined {
  return parseSeekerLanguage(text);
}
