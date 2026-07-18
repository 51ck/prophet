import { describe, expect, test } from "bun:test";
import { isLanguageAsk } from "@prophet/core";
import {
  LANGUAGE_ASK_PROMPT,
  decideLanguageGate,
  languageAsk,
  languagePromptAlreadyInHistory,
  resolveLanguageChoice,
  savedLanguage,
} from "./language-gate.ts";

describe("language gate", () => {
  test("savedLanguage reads profile", () => {
    expect(savedLanguage({})).toBeUndefined();
    expect(savedLanguage({ language: "ru" })).toBe("ru");
    expect(savedLanguage({ language: "en" })).toBe("en");
  });

  test("languageAsk is T1 ru|en closed ask", () => {
    const ask = languageAsk();
    expect(isLanguageAsk(ask)).toBe(true);
    expect(LANGUAGE_ASK_PROMPT.length).toBeGreaterThan(0);
  });

  test("resolveLanguageChoice maps button labels", () => {
    expect(resolveLanguageChoice("Русский")).toBe("ru");
    expect(resolveLanguageChoice("English")).toBe("en");
    expect(resolveLanguageChoice("maybe later")).toBeUndefined();
  });

  test("decideLanguageGate accepts mapped choice", () => {
    expect(
      decideLanguageGate({
        turnText: "English",
        pendingAsk: languageAsk(),
        alreadyPromptedInHistory: true,
      }),
    ).toEqual({ action: "accept", language: "en" });
  });

  test("decideLanguageGate restores pending on invalid reply", () => {
    expect(
      decideLanguageGate({
        turnText: "hello",
        pendingAsk: languageAsk(),
        alreadyPromptedInHistory: true,
      }),
    ).toEqual({ action: "restore-pending" });
  });

  test("decideLanguageGate reoffers when prompted but pending lost", () => {
    expect(
      decideLanguageGate({
        turnText: "hello",
        alreadyPromptedInHistory: true,
      }),
    ).toEqual({ action: "reoffer" });
  });

  test("decideLanguageGate asks on first invalid turn", () => {
    expect(
      decideLanguageGate({
        turnText: "hello",
        alreadyPromptedInHistory: false,
      }),
    ).toEqual({ action: "ask" });
  });

  test("languagePromptAlreadyInHistory detects bilingual cue", () => {
    expect(languagePromptAlreadyInHistory([])).toBe(false);
    expect(
      languagePromptAlreadyInHistory([
        { role: "assistant", content: LANGUAGE_ASK_PROMPT },
      ]),
    ).toBe(true);
  });
});
