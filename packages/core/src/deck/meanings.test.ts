import { describe, expect, test } from "bun:test";
import { getCardMeaning } from "./meanings.ts";

describe("card meaning lookup", () => {
  test("known pair returns a meaning: light-seers fool", () => {
    const meaning = getCardMeaning("light-seers", "fool");
    expect(meaning).toBeDefined();
    expect(meaning?.upright.length).toBeGreaterThan(0);
    expect(meaning?.reversed.length).toBeGreaterThan(0);
    expect(meaning?.imagery.length).toBeGreaterThan(0);
  });

  test("known pair returns a meaning: rider-waite fool, distinct voice from light-seers", () => {
    const riderWaite = getCardMeaning("rider-waite", "fool");
    expect(riderWaite).toBeDefined();
    expect(riderWaite?.upright.length).toBeGreaterThan(0);
    expect(riderWaite?.reversed.length).toBeGreaterThan(0);
    expect(riderWaite?.imagery.length).toBeGreaterThan(0);

    const lightSeers = getCardMeaning("light-seers", "fool");
    expect(riderWaite?.upright).not.toBe(lightSeers?.upright);
  });

  test("unknown card id on a known deck returns undefined", () => {
    expect(getCardMeaning("light-seers", "not-a-real-card")).toBeUndefined();
  });

  test("unknown deck id entirely returns undefined", () => {
    expect(getCardMeaning("not-a-real-deck", "fool")).toBeUndefined();
  });

  test("spot-check coverage: king-of-pentacles defined in both decks", () => {
    expect(getCardMeaning("light-seers", "king-of-pentacles")).toBeDefined();
    expect(getCardMeaning("rider-waite", "king-of-pentacles")).toBeDefined();
  });
});
