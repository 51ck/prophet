import { describe, expect, test } from "bun:test";
import {
  introduceNameSelfAsk,
  profileNeedsNameSelf,
} from "./name-self-gate.ts";

describe("name/self introduce gate", () => {
  test("profileNeedsNameSelf mirrors core", () => {
    expect(profileNeedsNameSelf({})).toBe(true);
    expect(
      profileNeedsNameSelf({
        preferredName: "Anya",
        selfNotes: "works nights",
      }),
    ).toBe(false);
  });

  test("introduceNameSelfAsk matches language", () => {
    expect(introduceNameSelfAsk("en")).toMatch(/call you/i);
    expect(introduceNameSelfAsk("ru")).toMatch(/зовут/);
  });
});
