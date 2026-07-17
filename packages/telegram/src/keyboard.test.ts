import { describe, expect, test } from "bun:test";
import { createAskWithOptions } from "@prophet/core";
import {
  SKIP_CALLBACK,
  SKIP_SEEKER_TEXT,
  buildAskKeyboard,
  parseAskCallback,
  resolveAskChoice,
} from "./keyboard.ts";

describe("buildAskKeyboard", () => {
  test("one button per option; callback uses index", () => {
    const ask = createAskWithOptions({
      options: [
        { id: "ru", label: "Русский" },
        { id: "en", label: "English" },
      ],
    });
    const kb = buildAskKeyboard(ask);
    const flat = kb.inline_keyboard.flat();
    expect(flat).toHaveLength(2);
    expect(flat[0]).toMatchObject({ text: "Русский", callback_data: "ao:0" });
    expect(flat[1]).toMatchObject({ text: "English", callback_data: "ao:1" });
  });

  test("allowSkip adds Skip row", () => {
    const ask = createAskWithOptions({
      options: [
        { id: "a", label: "Yes" },
        { id: "b", label: "No" },
      ],
      allowSkip: true,
    });
    const kb = buildAskKeyboard(ask);
    const rows = kb.inline_keyboard;
    expect(rows.at(-1)).toEqual([
      { text: "Skip", callback_data: SKIP_CALLBACK },
    ]);
  });
});

describe("parseAskCallback", () => {
  test("parses option index and skip", () => {
    expect(parseAskCallback("ao:0")).toEqual({ kind: "option", index: 0 });
    expect(parseAskCallback("ao:3")).toEqual({ kind: "option", index: 3 });
    expect(parseAskCallback(SKIP_CALLBACK)).toEqual({ kind: "skip" });
  });

  test("rejects foreign or malformed data", () => {
    expect(parseAskCallback("other")).toBeNull();
    expect(parseAskCallback("ao:")).toBeNull();
    expect(parseAskCallback("ao:x")).toBeNull();
    expect(parseAskCallback("ao:-1")).toBeNull();
  });
});

describe("resolveAskChoice", () => {
  const ask = createAskWithOptions({
    options: [
      { id: "y", label: "Yes" },
      { id: "n", label: "No" },
    ],
    allowSkip: true,
  });

  test("maps index to label; skip to seeker text", () => {
    expect(resolveAskChoice(ask, { kind: "option", index: 0 })).toBe("Yes");
    expect(resolveAskChoice(ask, { kind: "skip" })).toBe(SKIP_SEEKER_TEXT);
  });

  test("rejects out-of-range and skip when disallowed", () => {
    expect(resolveAskChoice(ask, { kind: "option", index: 9 })).toBeNull();
    const noSkip = createAskWithOptions({
      options: ask.options,
      allowSkip: false,
    });
    expect(resolveAskChoice(noSkip, { kind: "skip" })).toBeNull();
  });
});
