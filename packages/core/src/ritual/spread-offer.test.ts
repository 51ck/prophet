import { describe, expect, test } from "bun:test";
import {
  assertCanSelectSpread,
  assertSpreadForSessionPath,
  canSelectSpread,
  spreadOfferStatusLine,
} from "./spread-offer.ts";

describe("spread offer (T8.7)", () => {
  test("canSelectSpread only in committed", () => {
    expect(canSelectSpread("committed")).toBe(true);
    expect(canSelectSpread("ritual")).toBe(false);
    expect(canSelectSpread("offerDeck")).toBe(false);
  });

  test("assertCanSelectSpread rejects ritual with clear message", () => {
    expect(() => assertCanSelectSpread("ritual")).toThrow(
      /Spread already applied in ritual/,
    );
    expect(() => assertCanSelectSpread("committed")).not.toThrow();
  });

  test("status line: committed urges beginRitual; ritual forbids re-select", () => {
    const committed = spreadOfferStatusLine("committed");
    expect(committed).toContain("committed");
    expect(committed).toMatch(/beginRitual now/);
    expect(committed).not.toMatch(/do not beginRitual again/);

    const ritual = spreadOfferStatusLine("ritual");
    expect(ritual).toContain("ritual");
    expect(ritual).toMatch(/do not beginRitual again/);
    expect(ritual).not.toMatch(/beginRitual now/);
  });
});

describe("spread for session path (T9.3)", () => {
  test("day-card path allows only card-of-day", () => {
    expect(() =>
      assertSpreadForSessionPath("card-of-day", "day-card"),
    ).not.toThrow();
    expect(() =>
      assertSpreadForSessionPath("three-roads", "day-card"),
    ).toThrow(/Day-card path requires spread "card-of-day"/);
    expect(() =>
      assertSpreadForSessionPath("single-focus", "day-card"),
    ).toThrow(/Day-card path requires spread "card-of-day"/);
  });

  test("card-of-day rejected off day-card path", () => {
    expect(() =>
      assertSpreadForSessionPath("card-of-day", "question"),
    ).toThrow(/only allowed when sessionPath is day-card/);
    expect(() => assertSpreadForSessionPath("card-of-day", null)).toThrow(
      /only allowed when sessionPath is day-card/,
    );
    expect(() =>
      assertSpreadForSessionPath("three-roads", "question"),
    ).not.toThrow();
  });

  test("status line path-specific when committed", () => {
    const day = spreadOfferStatusLine("committed", "day-card");
    expect(day).toMatch(/card-of-day only/);
    expect(day).not.toMatch(/lean three-roads/);

    const question = spreadOfferStatusLine("committed", "question");
    expect(question).toMatch(/not card-of-day/);
    expect(question).toMatch(/lean three-roads/);
  });
});
