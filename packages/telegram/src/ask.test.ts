import { describe, expect, test } from "bun:test";
import { createAskWithOptions } from "@prophet/core";
import { extractAskWithOptions } from "./ask.ts";

describe("extractAskWithOptions", () => {
  const ask = createAskWithOptions({
    options: [
      { id: "day", label: "Card of the Day" },
      { id: "q", label: "Find a question" },
    ],
  });

  test("reads Mastra tool-result chunk payload", () => {
    const result = {
      text: "Which path?",
      toolResults: [
        {
          type: "tool-result",
          payload: {
            toolCallId: "1",
            toolName: "askWithOptions",
            result: ask,
          },
        },
      ],
    };
    expect(extractAskWithOptions(result)).toEqual(ask);
  });

  test("reads flat name/result shape; last ask wins", () => {
    const earlier = createAskWithOptions({
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    });
    const result = {
      toolResults: [
        { name: "askWithOptions", result: earlier },
        { name: "askWithOptions", result: ask },
      ],
    };
    expect(extractAskWithOptions(result)).toEqual(ask);
  });

  test("scans steps[].toolResults", () => {
    const result = {
      text: "hi",
      steps: [
        {
          toolResults: [
            {
              payload: { toolName: "askWithOptions", result: ask },
            },
          ],
        },
      ],
    };
    expect(extractAskWithOptions(result)).toEqual(ask);
  });

  test("returns undefined when no ask tool", () => {
    expect(extractAskWithOptions({ text: "hello", toolResults: [] })).toBeUndefined();
    expect(
      extractAskWithOptions({
        toolResults: [{ payload: { toolName: "shuffle", result: {} } }],
      }),
    ).toBeUndefined();
    expect(extractAskWithOptions(null)).toBeUndefined();
  });
});
