import { describe, expect, test } from "bun:test";
import { isLanguageAsk } from "@prophet/core";
import {
  LANGUAGE_ASK_PROMPT,
  languageAsk,
  presenceOpener,
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

  test("presenceOpener matches language", () => {
    expect(presenceOpener("en")).toMatch(/Pythia/);
    expect(presenceOpener("ru")).toMatch(/Пифия/);
  });
});
