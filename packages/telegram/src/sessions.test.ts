import { describe, expect, test } from "bun:test";
import { createAskWithOptions } from "@prophet/core";
import { claimPendingAsk, type ActiveReading } from "./sessions.ts";

describe("claimPendingAsk", () => {
  test("free text clears pending so seeker never forced to tap", () => {
    const ask = createAskWithOptions({
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      allowSkip: true,
    });
    const reading = {
      pendingAsk: { ask, chatId: 1, messageId: 2 },
    } as Pick<ActiveReading, "pendingAsk">;

    const claimed = claimPendingAsk(reading);
    expect(claimed?.ask).toEqual(ask);
    expect(reading.pendingAsk).toBeUndefined();
    expect(claimPendingAsk(reading)).toBeUndefined();
  });
});
