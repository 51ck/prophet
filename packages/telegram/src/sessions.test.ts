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

  // T9.2 name/self→presence chains two generates; deliverAgentReply must
  // claim+expire prior markup before attaching a fresh ask (Grammy I/O not
  // unit-tested here — expirePendingAskMarkup uses claimPendingAsk).
  test("claim before replace leaves only the new pendingAsk live", () => {
    const prior = createAskWithOptions({
      options: [
        { id: "x", label: "Prior" },
        { id: "y", label: "Other" },
      ],
    });
    const fresh = createAskWithOptions({
      options: [
        { id: "day-card", label: "Card of the Day" },
        { id: "question", label: "Find a question" },
      ],
    });
    const reading = {
      pendingAsk: { ask: prior, chatId: 1, messageId: 2 },
    } as Pick<ActiveReading, "pendingAsk">;

    const claimed = claimPendingAsk(reading);
    expect(claimed?.ask).toEqual(prior);
    expect(reading.pendingAsk).toBeUndefined();

    reading.pendingAsk = { ask: fresh, chatId: 1, messageId: 99 };
    expect(reading.pendingAsk?.ask).toEqual(fresh);
    expect(reading.pendingAsk?.messageId).toBe(99);
  });
});
