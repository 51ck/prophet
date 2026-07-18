import { describe, expect, test } from "bun:test";
import {
  assertCanSelectSpread,
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
