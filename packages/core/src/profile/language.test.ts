import { describe, expect, test } from "bun:test";
import {
  LANGUAGE_ASK_PROMPT,
  createLanguageAsk,
  isLanguageAsk,
  parseLanguageChangeRequest,
  parseSeekerLanguage,
  presenceOpener,
} from "./language.ts";
import { createAskWithOptions } from "../ask/ask-with-options.ts";

describe("createLanguageAsk", () => {
  test("ru|en options, no skip", () => {
    const ask = createLanguageAsk();
    expect(ask.options.map((o) => o.id)).toEqual(["ru", "en"]);
    expect(ask.options.map((o) => o.label)).toEqual(["Русский", "English"]);
    expect(ask.allowSkip).toBe(false);
    expect(isLanguageAsk(ask)).toBe(true);
  });
});

describe("isLanguageAsk", () => {
  test("rejects other closed asks", () => {
    expect(
      isLanguageAsk(
        createAskWithOptions({
          options: [
            { id: "a", label: "Yes" },
            { id: "b", label: "No" },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      isLanguageAsk(
        createAskWithOptions({
          options: [
            { id: "ru", label: "Русский" },
            { id: "en", label: "English" },
          ],
          allowSkip: true,
        }),
      ),
    ).toBe(false);
  });
});

describe("parseSeekerLanguage", () => {
  test("maps ids, labels, and common typed forms", () => {
    expect(parseSeekerLanguage("Русский")).toBe("ru");
    expect(parseSeekerLanguage("English")).toBe("en");
    expect(parseSeekerLanguage("ru")).toBe("ru");
    expect(parseSeekerLanguage(" EN ")).toBe("en");
    expect(parseSeekerLanguage("russian")).toBe("ru");
    expect(parseSeekerLanguage("английский")).toBe("en");
  });

  test("rejects unknown text", () => {
    expect(parseSeekerLanguage("hello")).toBeUndefined();
    expect(parseSeekerLanguage("skip")).toBeUndefined();
  });
});

describe("parseLanguageChangeRequest", () => {
  test("maps clear switch phrases", () => {
    expect(parseLanguageChangeRequest("switch to English")).toBe("en");
    expect(parseLanguageChangeRequest("speak russian")).toBe("ru");
    expect(parseLanguageChangeRequest("in english")).toBe("en");
    expect(parseLanguageChangeRequest("давай на русском")).toBe("ru");
    expect(parseLanguageChangeRequest("говори по-английски")).toBe("en");
    expect(parseLanguageChangeRequest("перейди на русский")).toBe("ru");
  });

  test("rejects bare labels and ordinary prose", () => {
    expect(parseLanguageChangeRequest("English")).toBeUndefined();
    expect(parseLanguageChangeRequest("Русский")).toBeUndefined();
    expect(parseLanguageChangeRequest("I am Russian")).toBeUndefined();
    expect(parseLanguageChangeRequest("I speak russian at home")).toBeUndefined();
    expect(parseLanguageChangeRequest("hello")).toBeUndefined();
  });
});

describe("presenceOpener", () => {
  test("returns language-specific presence", () => {
    expect(presenceOpener("en")).toContain("Pythia");
    expect(presenceOpener("ru")).toContain("Пифия");
    expect(LANGUAGE_ASK_PROMPT).toContain("language");
  });
});
