import { describe, expect, test } from "bun:test";
import { createAskWithOptions } from "../ask/ask-with-options.ts";
import {
  createPathAsk,
  dayCounselQuestion,
  isPathAsk,
  isPathAskPrompt,
  parseSessionPath,
  pathAskPrompt,
} from "./path.ts";
import { createSession, setSessionPath } from "./session.ts";

describe("createPathAsk", () => {
  test("en: day-card | question, no skip", () => {
    const ask = createPathAsk("en");
    expect(ask.options.map((o) => o.id)).toEqual(["day-card", "question"]);
    expect(ask.options.map((o) => o.label)).toEqual([
      "Card of the Day",
      "Find a question",
    ]);
    expect(ask.allowSkip).toBe(false);
    expect(isPathAsk(ask)).toBe(true);
  });

  test("ru: day-card | question labels", () => {
    const ask = createPathAsk("ru");
    expect(ask.options.map((o) => o.id)).toEqual(["day-card", "question"]);
    expect(ask.options.map((o) => o.label)).toEqual([
      "Карта дня",
      "Найти вопрос",
    ]);
    expect(isPathAsk(ask)).toBe(true);
  });
});

describe("isPathAsk", () => {
  test("rejects other closed asks", () => {
    expect(
      isPathAsk(
        createAskWithOptions({
          options: [
            { id: "a", label: "Yes" },
            { id: "b", label: "No" },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      isPathAsk(
        createAskWithOptions({
          options: [
            { id: "day-card", label: "Card of the Day" },
            { id: "question", label: "Find a question" },
          ],
          allowSkip: true,
        }),
      ),
    ).toBe(false);
  });
});

describe("parseSessionPath", () => {
  test("maps ids, labels, and common typed forms", () => {
    expect(parseSessionPath("Card of the Day")).toBe("day-card");
    expect(parseSessionPath("day-card")).toBe("day-card");
    expect(parseSessionPath("карта дня")).toBe("day-card");
    expect(parseSessionPath("Find a question")).toBe("question");
    expect(parseSessionPath("найти вопрос")).toBe("question");
    expect(parseSessionPath("вопрос")).toBe("question");
  });

  test("accepts distinctive path label embedded in introduce prose", () => {
    expect(parseSessionPath("I'm Alex — Card of the Day")).toBe("day-card");
    expect(
      parseSessionPath("Меня зовут Аня, найти вопрос про работу"),
    ).toBe("question");
  });

  test("last embedded path label wins", () => {
    expect(
      parseSessionPath("not Card of the Day, Find a question"),
    ).toBe("question");
    expect(
      parseSessionPath("Find a question… actually Card of the Day"),
    ).toBe("day-card");
  });

  test("rejects short ambiguous tokens inside free prose", () => {
    expect(parseSessionPath("I have a question about work")).toBeUndefined();
    expect(parseSessionPath("у меня есть вопрос")).toBeUndefined();
  });

  test("rejects unknown free text", () => {
    expect(parseSessionPath("hello")).toBeUndefined();
    expect(parseSessionPath("something else")).toBeUndefined();
  });
});

describe("pathAskPrompt", () => {
  test("bilingual prompts detected by isPathAskPrompt", () => {
    expect(isPathAskPrompt(pathAskPrompt("en"))).toBe(true);
    expect(isPathAskPrompt(pathAskPrompt("ru"))).toBe(true);
    expect(isPathAskPrompt("unrelated")).toBe(false);
  });
});

describe("setSessionPath", () => {
  test("persists day-card | question on session", () => {
    const s = createSession("seeker-1", "sess-1");
    expect(s.sessionPath).toBeNull();
    expect(setSessionPath(s, "day-card").sessionPath).toBe("day-card");
    expect(setSessionPath(s, "question").sessionPath).toBe("question");
  });
});

describe("dayCounselQuestion (T9.3)", () => {
  test("short implicit day counsel en|ru", () => {
    expect(dayCounselQuestion("en")).toMatch(/Counsel for this day/i);
    expect(dayCounselQuestion("ru")).toMatch(/Совет на этот день/);
  });
});
