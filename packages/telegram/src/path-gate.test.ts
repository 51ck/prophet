import { describe, expect, test } from "bun:test";
import { createAskWithOptions, isPathAsk } from "@prophet/core";
import {
  canOfferPathAsk,
  decidePathGate,
  pathAsk,
  pathAskPrompt,
  pathPromptAlreadyInHistory,
  resolvePathChoice,
  shouldSpeakPresenceThenPath,
} from "./path-gate.ts";

describe("path gate", () => {
  test("pathAsk is T1 day-card|question closed ask", () => {
    const ask = pathAsk("en");
    expect(isPathAsk(ask)).toBe(true);
    expect(pathAskPrompt("en").length).toBeGreaterThan(0);
  });

  test("resolvePathChoice maps button labels", () => {
    expect(resolvePathChoice("Card of the Day")).toBe("day-card");
    expect(resolvePathChoice("Find a question")).toBe("question");
    expect(resolvePathChoice("Карта дня")).toBe("day-card");
    expect(resolvePathChoice("maybe later")).toBeUndefined();
  });

  test("resolvePathChoice accepts embedded path label in name/self prose", () => {
    expect(resolvePathChoice("Alex here, Card of the Day")).toBe("day-card");
    expect(resolvePathChoice("I have a question about work")).toBeUndefined();
  });

  test("decidePathGate accepts mapped choice when present", () => {
    expect(
      decidePathGate({
        turnText: "Card of the Day",
        pendingAsk: pathAsk("en"),
        alreadyPromptedInHistory: true,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "accept", path: "day-card" });
  });

  test("decidePathGate continues on free text — no force-retry", () => {
    expect(
      decidePathGate({
        turnText: "I want to talk about work",
        pendingAsk: pathAsk("en"),
        alreadyPromptedInHistory: true,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "continue" });
  });

  test("decidePathGate continues free text answering non-path pending ask", () => {
    const otherAsk = createAskWithOptions({
      options: [
        { id: "a", label: "Option A" },
        { id: "b", label: "Option B" },
      ],
    });
    expect(isPathAsk(otherAsk)).toBe(false);
    expect(
      decidePathGate({
        turnText: "Option A",
        pendingAsk: otherAsk,
        alreadyPromptedInHistory: false,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "continue" });
  });

  test("decidePathGate continues when non-path pending embeds path phrase", () => {
    const otherAsk = createAskWithOptions({
      options: [
        { id: "a", label: "Option A" },
        { id: "b", label: "Option B" },
      ],
    });
    expect(isPathAsk(otherAsk)).toBe(false);
    expect(resolvePathChoice("Card of the Day")).toBe("day-card");
    expect(
      decidePathGate({
        turnText: "Card of the Day",
        pendingAsk: otherAsk,
        alreadyPromptedInHistory: true,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "continue" });
  });

  test("decidePathGate accepts path label while path ask pending", () => {
    expect(
      decidePathGate({
        turnText: "Find a question",
        pendingAsk: pathAsk("en"),
        alreadyPromptedInHistory: false,
        sessionPath: null,
        present: true,
        presenceSpoken: false,
      }),
    ).toEqual({ action: "accept", path: "question" });
  });

  test("decidePathGate continues when already prompted (no reoffer)", () => {
    expect(
      decidePathGate({
        turnText: "hello",
        alreadyPromptedInHistory: true,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "continue" });
  });

  test("decidePathGate offers when present and unset", () => {
    // Later turn after free-text skip of agent path ask: pending gone,
    // channel pathAskPrompt not in history → bot must call offerPathAsk.
    expect(
      decidePathGate({
        turnText: "hello",
        alreadyPromptedInHistory: false,
        sessionPath: null,
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "offer" });
  });

  test("decidePathGate continues when not present or path already set", () => {
    expect(
      decidePathGate({
        turnText: "Card of the Day",
        alreadyPromptedInHistory: false,
        sessionPath: null,
        present: false,
        presenceSpoken: false,
      }),
    ).toEqual({ action: "continue" });
    expect(
      decidePathGate({
        turnText: "hello",
        alreadyPromptedInHistory: false,
        sessionPath: "question",
        present: true,
        presenceSpoken: true,
      }),
    ).toEqual({ action: "continue" });
  });

  test("decidePathGate does not accept typed path before presenceSpoken", () => {
    expect(
      decidePathGate({
        turnText: "Card of the Day",
        alreadyPromptedInHistory: false,
        sessionPath: null,
        present: true,
        presenceSpoken: false,
      }),
    ).toEqual({ action: "continue" });
  });

  test("pathPromptAlreadyInHistory detects bilingual cue", () => {
    expect(pathPromptAlreadyInHistory([])).toBe(false);
    expect(
      pathPromptAlreadyInHistory([
        { role: "assistant", content: pathAskPrompt("ru") },
      ]),
    ).toBe(true);
    expect(
      pathPromptAlreadyInHistory([
        { role: "assistant", content: pathAskPrompt("en") },
      ]),
    ).toBe(true);
  });

  test("canOfferPathAsk requires presenceSpoken — not name/self alone", () => {
    expect(
      canOfferPathAsk({
        presenceSpoken: false,
        sessionPath: null,
        needsNameSelf: false,
        pathPromptInHistory: false,
      }),
    ).toBe(false);
    expect(
      canOfferPathAsk({
        presenceSpoken: true,
        sessionPath: null,
        needsNameSelf: false,
        pathPromptInHistory: false,
      }),
    ).toBe(true);
    expect(
      canOfferPathAsk({
        presenceSpoken: true,
        sessionPath: null,
        needsNameSelf: true,
        pathPromptInHistory: false,
      }),
    ).toBe(false);
  });

  test("canOfferPathAsk skips when agent already left path ask pending", () => {
    expect(
      canOfferPathAsk({
        presenceSpoken: true,
        sessionPath: null,
        needsNameSelf: false,
        pathPromptInHistory: false,
        pendingIsPathAsk: true,
      }),
    ).toBe(false);
  });

  test("shouldSpeakPresenceThenPath for cold open only", () => {
    expect(
      shouldSpeakPresenceThenPath({
        presenceSpoken: false,
        sessionPath: null,
        needsNameSelf: false,
        pathPromptInHistory: false,
      }),
    ).toBe(true);
    expect(
      shouldSpeakPresenceThenPath({
        presenceSpoken: true,
        sessionPath: null,
        needsNameSelf: false,
        pathPromptInHistory: false,
      }),
    ).toBe(false);
    expect(
      shouldSpeakPresenceThenPath({
        presenceSpoken: false,
        sessionPath: null,
        needsNameSelf: true,
        pathPromptInHistory: false,
      }),
    ).toBe(false);
  });
});
