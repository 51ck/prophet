import { describe, expect, test } from "bun:test";
import { nameSelfAsk, needsNameSelf } from "./name-self.ts";

describe("needsNameSelf", () => {
  test("true when either field missing", () => {
    expect(needsNameSelf({})).toBe(true);
    expect(needsNameSelf({ preferredName: "Anya" })).toBe(true);
    expect(needsNameSelf({ selfNotes: "works nights" })).toBe(true);
    expect(needsNameSelf({ preferredName: "  ", selfNotes: "x" })).toBe(true);
  });

  test("false when both set", () => {
    expect(
      needsNameSelf({ preferredName: "Anya", selfNotes: "works nights" }),
    ).toBe(false);
  });
});

describe("nameSelfAsk", () => {
  test("returns language-specific free-prose ask", () => {
    expect(nameSelfAsk("en")).toMatch(/call you/i);
    expect(nameSelfAsk("ru")).toMatch(/зовут/);
  });
});
