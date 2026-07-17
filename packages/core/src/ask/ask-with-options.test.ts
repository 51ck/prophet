import { describe, expect, test } from "bun:test";
import {
  ASK_WITH_OPTIONS_KIND,
  MAX_ASK_OPTIONS,
  MIN_ASK_OPTIONS,
  createAskWithOptions,
  isAskWithOptions,
} from "./ask-with-options.ts";

describe("askWithOptions", () => {
  test("creates closed ask with 2 options; allowSkip defaults false", () => {
    const ask = createAskWithOptions({
      options: [
        { id: "ru", label: "Русский" },
        { id: "en", label: "English" },
      ],
    });
    expect(ask.kind).toBe(ASK_WITH_OPTIONS_KIND);
    expect(ask.options).toHaveLength(2);
    expect(ask.allowSkip).toBe(false);
  });

  test("allows skip flag and up to N options", () => {
    const options = Array.from({ length: MAX_ASK_OPTIONS }, (_, i) => ({
      id: `o${i}`,
      label: `Option ${i}`,
    }));
    const ask = createAskWithOptions({ options, allowSkip: true });
    expect(ask.options).toHaveLength(MAX_ASK_OPTIONS);
    expect(ask.allowSkip).toBe(true);
  });

  test("rejects empty options", () => {
    expect(() => createAskWithOptions({ options: [] })).toThrow();
  });

  test("rejects fewer than min options", () => {
    expect(() =>
      createAskWithOptions({
        options: [{ id: "only", label: "Only" }],
      }),
    ).toThrow();
    expect(MIN_ASK_OPTIONS).toBe(2);
  });

  test("rejects more than N options", () => {
    const options = Array.from({ length: MAX_ASK_OPTIONS + 1 }, (_, i) => ({
      id: `o${i}`,
      label: `Option ${i}`,
    }));
    expect(() => createAskWithOptions({ options })).toThrow();
  });

  test("rejects blank id or label", () => {
    expect(() =>
      createAskWithOptions({
        options: [
          { id: "  ", label: "A" },
          { id: "b", label: "B" },
        ],
      }),
    ).toThrow();
    expect(() =>
      createAskWithOptions({
        options: [
          { id: "a", label: "   " },
          { id: "b", label: "B" },
        ],
      }),
    ).toThrow();
  });

  test("rejects duplicate option ids", () => {
    expect(() =>
      createAskWithOptions({
        options: [
          { id: "yes", label: "Yes" },
          { id: "yes", label: "Also yes" },
        ],
      }),
    ).toThrow();
  });

  test("isAskWithOptions type guard", () => {
    const ask = createAskWithOptions({
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      allowSkip: true,
    });
    expect(isAskWithOptions(ask)).toBe(true);
    expect(isAskWithOptions({ kind: "askWithOptions", options: [] })).toBe(
      false,
    );
    expect(isAskWithOptions(null)).toBe(false);
    expect(isAskWithOptions({ text: "hi" })).toBe(false);
  });
});
