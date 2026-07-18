import { describe, expect, test } from "bun:test";
import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import {
  THREE_ROADS,
  addFreeSlot,
  applyShuffleOps,
  createDeckState,
  draw,
  drawFromPile,
  drawToPositions,
  getDeckSnapshot,
  insertIntoPile,
  laySpread,
  open,
  openPosition,
  peekDesk,
  placeOnDesk,
  resolvePileDrawIndex,
  resolvePileInsertIndex,
  reveal,
  returnToPile,
  rotateDeskCard,
  selectSpread,
} from "../ritual/engine.ts";
import type { CardInstance, PileAddress } from "../ritual/types.ts";

describe("ritual engine", () => {
  test("creates 78-card Light Seer's pile with empty desk", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(state.pile).toHaveLength(78);
    expect(state.desk).toHaveLength(0);
    expect(LIGHT_SEERS_CARDS).toHaveLength(78);
  });

  test("selectSpread lays spread-kind empty slots on desk", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    expect(state.desk).toHaveLength(3);
    expect(state.desk.every((s) => s.kind === "spread")).toBe(true);
    expect(state.desk.every((s) => s.card === null)).toBe(true);
    expect(state.pile).toHaveLength(78);
  });

  test("addFreeSlot places free desk slot without named spread", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "a");
    state = addFreeSlot(state, "b", "trial");
    expect(state.desk).toEqual([
      { id: "a", role: "free", kind: "free", card: null },
      { id: "b", role: "trial", kind: "free", card: null },
    ]);
    expect(state.pile).toHaveLength(78);
  });

  test("addFreeSlot rejects duplicate id", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "a");
    expect(() => addFreeSlot(state, "a")).toThrow(/already has slot/);
  });

  test("selectSpread replaces free slots with spread layout", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "orphan");
    state = selectSpread(state, THREE_ROADS);
    expect(state.desk.map((s) => s.id)).toEqual([
      "situation",
      "counsel",
      "path",
    ]);
    expect(state.desk.every((s) => s.kind === "spread")).toBe(true);
  });

  test("draw and open reveal only when opened", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    state = drawToPositions(state);
    const before = getDeckSnapshot(state);
    expect(before.desk.every((t) => t.defId === null)).toBe(true);

    const top = peekDesk(state)[0]?.card?.defId;
    expect(top).toBeTruthy();

    state = openPosition(state, "situation");
    const after = getDeckSnapshot(state);
    const sit = after.desk.find((t) => t.id === "situation");
    expect(sit?.faceUp).toBe(true);
    expect(sit?.defId).toBe(top);
    expect(sit?.kind).toBe("spread");
  });

  test("free slots can draw and open like spread slots", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "alone");
    state = drawToPositions(state);
    const hidden = getDeckSnapshot(state).desk[0];
    expect(hidden?.kind).toBe("free");
    expect(hidden?.defId).toBeNull();
    const id = peekDesk(state)[0]?.card?.defId;
    state = openPosition(state, "alone");
    expect(getDeckSnapshot(state).desk[0]?.defId).toBe(id);
  });

  test("placeOnDesk top into empty spread slot, face-down, counts", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    const topId = state.pile[0]!.defId;
    state = placeOnDesk(state, "situation");
    expect(state.pile).toHaveLength(77);
    expect(state.desk.filter((s) => s.card !== null)).toHaveLength(1);
    expect(peekDesk(state).find((s) => s.id === "situation")?.card).toEqual({
      defId: topId,
      orientation: "upright",
      faceUp: false,
    });
    expect(getDeckSnapshot(state).desk.find((s) => s.id === "situation")).toMatchObject({
      faceUp: false,
      defId: null,
    });
  });

  test("placeOnDesk bottom / index; creates free slot when needed", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const bottomId = state.pile[77]!.defId;
    const midId = state.pile[40]!.defId;

    state = placeOnDesk(state, "from-bottom", { kind: "bottom" }, "trial");
    expect(state.pile).toHaveLength(77);
    expect(state.desk).toHaveLength(1);
    expect(state.desk[0]).toMatchObject({
      id: "from-bottom",
      role: "trial",
      kind: "free",
    });
    expect(peekDesk(state)[0]?.card?.defId).toBe(bottomId);
    expect(peekDesk(state)[0]?.card?.faceUp).toBe(false);
    expect(getDeckSnapshot(state).desk[0]?.defId).toBeNull();

    state = placeOnDesk(state, "from-mid", { kind: "index", index: 40 });
    expect(state.pile).toHaveLength(76);
    expect(state.desk).toHaveLength(2);
    expect(peekDesk(state).find((s) => s.id === "from-mid")?.card?.defId).toBe(
      midId,
    );
    expect(
      getDeckSnapshot(state).desk.every((s) => s.defId === null),
    ).toBe(true);
  });

  test("draw alias defaults to top; rejects occupied slot", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const topId = state.pile[0]!.defId;
    state = draw(state, "a");
    expect(peekDesk(state)[0]?.card?.defId).toBe(topId);
    expect(() => placeOnDesk(state, "a")).toThrow(/already has a card/);
  });

  test("returnToPile top; leaves slot empty; conserves count", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    const topId = state.pile[0]!.defId;
    state = placeOnDesk(state, "situation");
    state = returnToPile(state, "situation");
    expect(state.pile).toHaveLength(78);
    expect(state.pile[0]?.defId).toBe(topId);
    expect(state.desk.find((s) => s.id === "situation")?.card).toBeNull();
    expect(state.desk).toHaveLength(3);
  });

  test("returnToPile bottom / index; resets face-down", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const a = state.pile[0]!.defId;
    const b = state.pile[1]!.defId;
    state = placeOnDesk(state, "a");
    state = placeOnDesk(state, "b");
    state = openPosition(state, "a");
    expect(peekDesk(state).find((s) => s.id === "a")?.card?.faceUp).toBe(true);

    state = returnToPile(state, "a", { kind: "bottom" });
    expect(state.pile).toHaveLength(77);
    expect(state.pile[76]?.defId).toBe(a);
    expect(state.pile[76]?.faceUp).toBe(false);
    expect(state.desk.find((s) => s.id === "a")?.card).toBeNull();

    state = returnToPile(state, "b", { kind: "index", index: 10 });
    expect(state.pile).toHaveLength(78);
    expect(state.pile[10]?.defId).toBe(b);
    expect(state.desk.find((s) => s.id === "b")?.card).toBeNull();
  });

  test("returnToPile rejects missing or empty slot", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(() => returnToPile(state, "ghost")).toThrow(/No card at desk slot/);
    state = addFreeSlot(state, "empty");
    expect(() => returnToPile(state, "empty")).toThrow(/No card at desk slot/);
  });

  test("rotateDeskCard flips orientation; second rotate restores", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "focus");
    expect(peekDesk(state).find((s) => s.id === "focus")?.card?.orientation).toBe(
      "upright",
    );
    state = rotateDeskCard(state, "focus");
    expect(peekDesk(state).find((s) => s.id === "focus")?.card?.orientation).toBe(
      "reversed",
    );
    expect(peekDesk(state).find((s) => s.id === "focus")?.card?.faceUp).toBe(false);
    state = rotateDeskCard(state, "focus");
    expect(peekDesk(state).find((s) => s.id === "focus")?.card?.orientation).toBe(
      "upright",
    );
  });

  test("rotateDeskCard rejects missing or empty slot", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(() => rotateDeskCard(state, "ghost")).toThrow(/No card at desk slot/);
    state = addFreeSlot(state, "empty");
    expect(() => rotateDeskCard(state, "empty")).toThrow(/No card at desk slot/);
  });

  test("reveal flips face-up; defId and orientation unchanged", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "focus");
    state = rotateDeskCard(state, "focus");
    const before = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(before.faceUp).toBe(false);
    expect(before.orientation).toBe("reversed");

    const snapBefore = getDeckSnapshot(state).desk.find((t) => t.id === "focus");
    expect(snapBefore?.faceUp).toBe(false);
    expect(snapBefore?.defId).toBeNull();
    expect(snapBefore?.orientation).toBeNull();

    state = reveal(state, "focus");
    const after = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(after).toEqual({
      defId: before.defId,
      orientation: "reversed",
      faceUp: true,
    });

    const snapAfter = getDeckSnapshot(state).desk.find((t) => t.id === "focus");
    expect(snapAfter?.faceUp).toBe(true);
    expect(snapAfter?.defId).toBe(before.defId);
    expect(snapAfter?.orientation).toBe("reversed");
  });

  test("open aliases openPosition; rejects missing or empty slot", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "a");
    const id = peekDesk(state)[0]!.card!.defId;
    state = open(state, "a");
    expect(getDeckSnapshot(state).desk[0]?.defId).toBe(id);
    expect(open).toBe(openPosition);
    expect(reveal).toBe(openPosition);

    state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(() => reveal(state, "ghost")).toThrow(/No card at desk slot/);
    state = addFreeSlot(state, "empty");
    expect(() => openPosition(state, "empty")).toThrow(/No card at desk slot/);
  });

  test("laySpread three-roads composes layout + place; face-down; conserves; no invent", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const top3 = state.pile.slice(0, 3).map((c) => c.defId);
    const allBefore = [
      ...state.pile.map((c) => c.defId),
      ...state.desk.flatMap((s) => (s.card ? [s.card.defId] : [])),
    ].sort();

    state = laySpread(state, THREE_ROADS);

    expect(state.desk).toHaveLength(3);
    expect(state.desk.map((s) => s.id)).toEqual([
      "situation",
      "counsel",
      "path",
    ]);
    expect(state.desk.every((s) => s.kind === "spread")).toBe(true);
    expect(state.pile).toHaveLength(75);
    expect(state.desk.every((s) => s.card?.faceUp === false)).toBe(true);

    const placed = peekDesk(state).map((s) => s.card!.defId);
    expect(placed).toEqual(top3);
    expect(
      getDeckSnapshot(state).desk.every((t) => t.defId === null && !t.faceUp),
    ).toBe(true);

    const allAfter = [
      ...state.pile.map((c) => c.defId),
      ...peekDesk(state).map((s) => s.card!.defId),
    ].sort();
    expect(allAfter).toEqual(allBefore);
  });

  test("drawToPositions composes placeOnDesk; matches manual place loop", () => {
    let composed = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    composed = selectSpread(composed, THREE_ROADS);
    const expectedIds = composed.pile.slice(0, 3).map((c) => c.defId);
    composed = drawToPositions(composed);

    let manual = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    manual = selectSpread(manual, THREE_ROADS);
    for (const id of ["situation", "counsel", "path"]) {
      manual = placeOnDesk(manual, id);
    }

    expect(peekDesk(composed).map((s) => s.card)).toEqual(
      peekDesk(manual).map((s) => s.card),
    );
    expect(peekDesk(composed).map((s) => s.card!.defId)).toEqual(expectedIds);
    expect(composed.pile).toHaveLength(75);
    expect(composed.pile.map((c) => c.defId)).toEqual(
      manual.pile.map((c) => c.defId),
    );
  });
});

/** All defIds in play (pile + occupied desk), sorted — conservation helper. */
function allDefIds(state: {
  pile: { defId: string }[];
  desk: { card: { defId: string } | null }[];
}): string[] {
  return [
    ...state.pile.map((c) => c.defId),
    ...state.desk.flatMap((s) => (s.card ? [s.card.defId] : [])),
  ].sort();
}

function seqRandom(seq: number[]): () => number {
  let i = 0;
  return () => seq[i++ % seq.length] ?? 0.5;
}

describe("free-mode scenarios (T6.1)", () => {
  test("1: shuffle → place → reveal → return → draw again → reveal", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const before = allDefIds(state);
    const random = seqRandom([0.9, 0.1, 0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6]);

    state = applyShuffleOps(state, [{ type: "mix" }], random);
    expect(state.pile).toHaveLength(78);

    state = placeOnDesk(state, "focus");
    expect(state.pile).toHaveLength(77);
    const firstPeek = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(firstPeek.faceUp).toBe(false);
    expect(getDeckSnapshot(state).desk[0]?.defId).toBeNull();

    state = reveal(state, "focus");
    expect(getDeckSnapshot(state).desk[0]?.defId).toBe(firstPeek.defId);

    state = returnToPile(state, "focus");
    expect(state.pile).toHaveLength(78);
    expect(state.desk.find((s) => s.id === "focus")?.card).toBeNull();

    state = draw(state, "focus");
    expect(state.pile).toHaveLength(77);
    const secondPeek = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(secondPeek.faceUp).toBe(false);
    expect(getDeckSnapshot(state).desk[0]?.defId).toBeNull();

    state = reveal(state, "focus");
    expect(getDeckSnapshot(state).desk[0]?.defId).toBe(secondPeek.defId);
    expect(allDefIds(state)).toEqual(before);
  });

  test("2: draw from bottom of pile → reveal", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const bottomId = state.pile[77]!.defId;

    state = draw(state, "from-bottom", { kind: "bottom" });
    expect(state.pile).toHaveLength(77);
    expect(peekDesk(state)[0]?.card?.defId).toBe(bottomId);
    expect(peekDesk(state)[0]?.card?.faceUp).toBe(false);
    expect(getDeckSnapshot(state).desk[0]?.defId).toBeNull();

    state = reveal(state, "from-bottom");
    expect(getDeckSnapshot(state).desk[0]).toMatchObject({
      faceUp: true,
      defId: bottomId,
    });
  });

  test("3: place three → return middle → reshuffle → place from middle of pile", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const before = allDefIds(state);
    const placed = state.pile.slice(0, 3).map((c) => c.defId);

    state = placeOnDesk(state, "left");
    state = placeOnDesk(state, "mid");
    state = placeOnDesk(state, "right");
    expect(state.pile).toHaveLength(75);
    expect(peekDesk(state).map((s) => s.card!.defId)).toEqual(placed);

    state = returnToPile(state, "mid");
    expect(state.pile).toHaveLength(76);
    expect(state.desk.find((s) => s.id === "mid")?.card).toBeNull();
    expect(peekDesk(state).find((s) => s.id === "left")?.card?.defId).toBe(
      placed[0],
    );
    expect(peekDesk(state).find((s) => s.id === "right")?.card?.defId).toBe(
      placed[2],
    );

    const random = seqRandom([0.2, 0.8, 0.4, 0.6, 0.1, 0.9, 0.3, 0.7, 0.5]);
    const pileBeforeMix = state.pile.map((c) => c.defId).sort();
    state = applyShuffleOps(state, [{ type: "mix" }], random);
    expect(state.pile.map((c) => c.defId).sort()).toEqual(pileBeforeMix);
    expect(state.pile).toHaveLength(76);

    const midIndex = 30;
    const midId = state.pile[midIndex]!.defId;
    state = placeOnDesk(state, "mid", { kind: "index", index: midIndex });
    expect(state.pile).toHaveLength(75);
    expect(peekDesk(state).find((s) => s.id === "mid")?.card?.defId).toBe(midId);
    expect(
      getDeckSnapshot(state).desk.find((t) => t.id === "mid")?.defId,
    ).toBeNull();
    expect(allDefIds(state)).toEqual(before);
  });

  test("4: face-down snapshot defId null until reveal; then matches peek", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "secret");

    const peek = peekDesk(state).find((s) => s.id === "secret")!.card!;
    expect(peek.faceUp).toBe(false);
    expect(peek.defId).toBeTruthy();

    const snapDown = getDeckSnapshot(state).desk.find((t) => t.id === "secret");
    expect(snapDown?.faceUp).toBe(false);
    expect(snapDown?.defId).toBeNull();
    expect(snapDown?.orientation).toBeNull();

    state = reveal(state, "secret");
    const snapUp = getDeckSnapshot(state).desk.find((t) => t.id === "secret");
    expect(snapUp?.faceUp).toBe(true);
    expect(snapUp?.defId).toBe(peek.defId);
    expect(snapUp?.orientation).toBe(peek.orientation);
  });

  test("5: return + reshuffle does not invent cards; pile count conserved", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const before = allDefIds(state);
    expect(before).toHaveLength(78);

    state = placeOnDesk(state, "a");
    state = placeOnDesk(state, "b");
    expect(state.pile).toHaveLength(76);
    expect(allDefIds(state)).toEqual(before);

    state = returnToPile(state, "a", { kind: "bottom" });
    state = returnToPile(state, "b", { kind: "index", index: 12 });
    expect(state.pile).toHaveLength(78);
    expect(allDefIds(state)).toEqual(before);

    const random = seqRandom([0.15, 0.85, 0.35, 0.65, 0.05, 0.95, 0.45, 0.55]);
    state = applyShuffleOps(
      state,
      [
        { type: "mix" },
        { type: "cut", at: 22 },
        { type: "seekerCut", at: 0.4 },
      ],
      random,
    );
    expect(state.pile).toHaveLength(78);
    expect(allDefIds(state)).toEqual(before);
    expect(new Set(state.pile.map((c) => c.defId)).size).toBe(78);
  });
});

/** Multiset of in-play card identities (defId + orientation), sorted. */
function allIdentities(state: {
  pile: { defId: string; orientation: string }[];
  desk: { card: { defId: string; orientation: string } | null }[];
}): string[] {
  return [
    ...state.pile.map((c) => `${c.defId}:${c.orientation}`),
    ...state.desk.flatMap((s) =>
      s.card ? [`${s.card.defId}:${s.card.orientation}`] : [],
    ),
  ].sort();
}

function cardCount(state: {
  pile: unknown[];
  desk: { card: unknown | null }[];
}): number {
  return (
    state.pile.length + state.desk.filter((s) => s.card !== null).length
  );
}

describe("invariants (T6.2)", () => {
  test("card-count conservation across place, reveal, return, rotate, shuffle", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const n = LIGHT_SEERS_CARDS.length;
    expect(cardCount(state)).toBe(n);
    expect(allDefIds(state)).toHaveLength(n);
    expect(new Set(allDefIds(state)).size).toBe(n);

    state = placeOnDesk(state, "a");
    state = placeOnDesk(state, "b", { kind: "bottom" });
    state = placeOnDesk(state, "c", { kind: "index", index: 10 });
    expect(cardCount(state)).toBe(n);
    expect(state.pile).toHaveLength(n - 3);
    expect(allDefIds(state)).toHaveLength(n);
    expect(new Set(allDefIds(state)).size).toBe(n);

    state = reveal(state, "a");
    state = rotateDeskCard(state, "b");
    expect(cardCount(state)).toBe(n);

    state = returnToPile(state, "c", { kind: "index", index: 5 });
    expect(cardCount(state)).toBe(n);
    expect(state.pile).toHaveLength(n - 2);
    expect(state.desk.find((s) => s.id === "c")?.card).toBeNull();

    const random = seqRandom([0.3, 0.7, 0.1, 0.9, 0.4, 0.6, 0.2, 0.8]);
    state = applyShuffleOps(
      state,
      [
        { type: "mix" },
        { type: "cut", at: 15 },
        { type: "rotate", from: 0, count: 5 },
      ],
      random,
    );
    expect(cardCount(state)).toBe(n);
    expect(allDefIds(state)).toHaveLength(n);
    expect(new Set(allDefIds(state)).size).toBe(n);

    state = returnToPile(state, "a", { kind: "bottom" });
    state = returnToPile(state, "b");
    expect(cardCount(state)).toBe(n);
    expect(state.pile).toHaveLength(n);
    expect(new Set(state.pile.map((c) => c.defId)).size).toBe(n);
  });

  test("reveal keeps defId and orientation; only faceUp flips", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "focus");
    const before = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(before.faceUp).toBe(false);

    state = reveal(state, "focus");
    const after = peekDesk(state).find((s) => s.id === "focus")!.card!;
    expect(after.defId).toBe(before.defId);
    expect(after.orientation).toBe(before.orientation);
    expect(after.faceUp).toBe(true);
    expect(cardCount(state)).toBe(78);
  });

  test("place/draw does not change identity of the drawn card", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const top = { ...state.pile[0]! };
    const bottom = { ...state.pile[77]! };
    const mid = { ...state.pile[40]! };

    state = placeOnDesk(state, "top");
    expect(peekDesk(state).find((s) => s.id === "top")!.card).toEqual({
      ...top,
      faceUp: false,
    });

    state = draw(state, "bottom", { kind: "bottom" });
    expect(peekDesk(state).find((s) => s.id === "bottom")!.card).toEqual({
      ...bottom,
      faceUp: false,
    });

    // Top draw shifts index 40 → 39; bottom draw leaves that slot alone.
    const midNow = state.pile[39]!;
    expect(midNow.defId).toBe(mid.defId);
    state = placeOnDesk(state, "mid", { kind: "index", index: 39 });
    expect(peekDesk(state).find((s) => s.id === "mid")!.card).toEqual({
      ...midNow,
      faceUp: false,
    });
    expect(cardCount(state)).toBe(78);
  });

  test("return keeps defId and orientation; face goes down", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "x");
    state = reveal(state, "x");
    state = rotateDeskCard(state, "x");
    const onDesk = peekDesk(state).find((s) => s.id === "x")!.card!;
    expect(onDesk.faceUp).toBe(true);
    expect(onDesk.orientation).toBe("reversed");

    state = returnToPile(state, "x", { kind: "top" });
    expect(state.desk.find((s) => s.id === "x")?.card).toBeNull();
    expect(state.pile[0]).toEqual({
      defId: onDesk.defId,
      orientation: onDesk.orientation,
      faceUp: false,
    });
    expect(cardCount(state)).toBe(78);
  });

  test("move/reveal never silently swaps identities across the deck", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const before = allIdentities(state);

    state = placeOnDesk(state, "left");
    state = placeOnDesk(state, "right", { kind: "bottom" });
    expect(allIdentities(state)).toEqual(before);

    const leftBefore = peekDesk(state).find((s) => s.id === "left")!.card!;
    const rightBefore = peekDesk(state).find((s) => s.id === "right")!.card!;

    state = reveal(state, "left");
    state = reveal(state, "right");
    expect(allIdentities(state)).toEqual(before);
    expect(peekDesk(state).find((s) => s.id === "left")!.card!.defId).toBe(
      leftBefore.defId,
    );
    expect(peekDesk(state).find((s) => s.id === "right")!.card!.defId).toBe(
      rightBefore.defId,
    );

    state = returnToPile(state, "left", { kind: "index", index: 20 });
    state = returnToPile(state, "right", { kind: "bottom" });
    expect(allIdentities(state)).toEqual(before);
    expect(cardCount(state)).toBe(78);
  });
});

describe("snapshot secrecy (T6.3)", () => {
  test("prophet snapshot hides face-down defId and orientation; peek still sees them", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "a");
    state = placeOnDesk(state, "b", { kind: "bottom" });
    state = rotateDeskCard(state, "b");

    const peekA = peekDesk(state).find((s) => s.id === "a")!.card!;
    const peekB = peekDesk(state).find((s) => s.id === "b")!.card!;
    expect(peekA.faceUp).toBe(false);
    expect(peekB.faceUp).toBe(false);
    expect(peekA.defId).toBeTruthy();
    expect(peekB.orientation).toBe("reversed");

    const snap = getDeckSnapshot(state);
    expect(snap.desk).toHaveLength(2);
    for (const slot of snap.desk) {
      expect(slot.faceUp).toBe(false);
      expect(slot.defId).toBeNull();
      expect(slot.orientation).toBeNull();
    }
    expect(JSON.stringify(snap)).not.toContain(peekA.defId);
    expect(JSON.stringify(snap)).not.toContain(peekB.defId);
  });

  test("mixed desk: only face-up slots expose identity in snapshot", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = placeOnDesk(state, "down");
    state = placeOnDesk(state, "up", { kind: "bottom" });
    state = reveal(state, "up");

    const peekDown = peekDesk(state).find((s) => s.id === "down")!.card!;
    const peekUp = peekDesk(state).find((s) => s.id === "up")!.card!;

    const snap = getDeckSnapshot(state);
    expect(snap.desk.find((t) => t.id === "down")).toMatchObject({
      faceUp: false,
      defId: null,
      orientation: null,
    });
    expect(snap.desk.find((t) => t.id === "up")).toMatchObject({
      faceUp: true,
      defId: peekUp.defId,
      orientation: peekUp.orientation,
    });

    const encoded = JSON.stringify(snap);
    expect(encoded).not.toContain(peekDown.defId);
    expect(encoded).toContain(peekUp.defId);
  });

  test("snapshot exposes pileCount only — never pile card identities", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const topId = state.pile[0]!.defId;
    const midId = state.pile[40]!.defId;
    state = placeOnDesk(state, "focus");

    const snap = getDeckSnapshot(state);
    expect(snap.pileCount).toBe(77);
    expect(snap).not.toHaveProperty("pile");
    expect(Object.keys(snap).sort()).toEqual(["deckId", "desk", "pileCount"]);

    const encoded = JSON.stringify(snap);
    expect(encoded).not.toContain(topId);
    expect(encoded).not.toContain(midId);
    expect(encoded).not.toContain(peekDesk(state).find((s) => s.id === "focus")!.card!.defId);
  });

  test("empty desk slots stay null in snapshot; reveal then matches peek", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    let snap = getDeckSnapshot(state);
    expect(snap.desk.every((t) => t.defId === null && !t.faceUp && t.orientation === null)).toBe(
      true,
    );

    state = placeOnDesk(state, "situation");
    const hidden = peekDesk(state).find((s) => s.id === "situation")!.card!;
    snap = getDeckSnapshot(state);
    expect(snap.desk.find((t) => t.id === "situation")).toMatchObject({
      faceUp: false,
      defId: null,
      orientation: null,
    });

    state = reveal(state, "situation");
    snap = getDeckSnapshot(state);
    expect(snap.desk.find((t) => t.id === "situation")).toMatchObject({
      faceUp: true,
      defId: hidden.defId,
      orientation: hidden.orientation,
    });
  });
});

describe("shuffle ops", () => {
  const ids = (pile: { defId: string }[]) => pile.map((c) => c.defId);
  const sortedIds = (pile: { defId: string }[]) => [...ids(pile)].sort();

  test("mix changes order, conserves identity, leaves desk alone", () => {
    let i = 0;
    const seq = [0.9, 0.1, 0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6];
    const random = () => seq[i++ % seq.length] ?? 0.5;
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "watch");
    const mixed = applyShuffleOps(state, [{ type: "mix" }], random);
    expect(ids(mixed.pile)).not.toEqual(ids(state.pile));
    expect(sortedIds(mixed.pile)).toEqual(sortedIds(state.pile));
    expect(mixed.desk).toEqual(state.desk);
    expect(mixed.pile.every((c) => c.orientation === "upright")).toBe(true);
  });

  test("cut at index restacks: bottom of cut becomes top", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const at = 10;
    const expected = [
      ...ids(state.pile).slice(at),
      ...ids(state.pile).slice(0, at),
    ];
    const cut = applyShuffleOps(state, [{ type: "cut", at }]);
    expect(ids(cut.pile)).toEqual(expected);
    expect(cut.pile).toHaveLength(78);
  });

  test("cut without at uses rng index", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    // random() * 78 → floor → 20
    const cut = applyShuffleOps(state, [{ type: "cut" }], () => 20 / 78);
    const expected = [
      ...ids(state.pile).slice(20),
      ...ids(state.pile).slice(0, 20),
    ];
    expect(ids(cut.pile)).toEqual(expected);
  });

  test("seekerCut uses depth fraction in [0,1]", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const at = Math.floor(0.5 * 78);
    const cut = applyShuffleOps(state, [{ type: "seekerCut", at: 0.5 }]);
    expect(ids(cut.pile)).toEqual([
      ...ids(state.pile).slice(at),
      ...ids(state.pile).slice(0, at),
    ]);
  });

  test("seekerCut clamps fraction outside [0,1]", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const over = applyShuffleOps(state, [{ type: "seekerCut", at: 2 }]);
    const under = applyShuffleOps(state, [{ type: "seekerCut", at: -1 }]);
    // at=1 → cut index = length → no-op; at=0 → no-op
    expect(ids(over.pile)).toEqual(ids(state.pile));
    expect(ids(under.pile)).toEqual(ids(state.pile));
  });

  test("shift moves a contiguous block", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const before = ids(state.pile);
    // take indices 1..2, insert at to=3 in remaining → [A,D,E,B,C,...]
    const shifted = applyShuffleOps(state, [
      { type: "shift", from: 1, count: 2, to: 3 },
    ]);
    const block = before.slice(1, 3);
    const rest = [...before.slice(0, 1), ...before.slice(3)];
    const expected = [...rest.slice(0, 3), ...block, ...rest.slice(3)];
    expect(ids(shifted.pile)).toEqual(expected);
    expect(sortedIds(shifted.pile)).toEqual(sortedIds(state.pile));
  });

  test("shift no-ops on invalid from/count", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const a = applyShuffleOps(state, [
      { type: "shift", from: -1, count: 2, to: 0 },
    ]);
    const b = applyShuffleOps(state, [
      { type: "shift", from: 0, count: 0, to: 5 },
    ]);
    const c = applyShuffleOps(state, [
      { type: "shift", from: 78, count: 1, to: 0 },
    ]);
    expect(ids(a.pile)).toEqual(ids(state.pile));
    expect(ids(b.pile)).toEqual(ids(state.pile));
    expect(ids(c.pile)).toEqual(ids(state.pile));
  });

  test("rotate flips prefix orientation; second rotate restores", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = applyShuffleOps(state, [{ type: "rotate", count: 3 }]);
    expect(
      state.pile.slice(0, 3).every((c) => c.orientation === "reversed"),
    ).toBe(true);
    expect(state.pile[3]?.orientation).toBe("upright");
    state = applyShuffleOps(state, [{ type: "rotate", count: 3 }]);
    expect(
      state.pile.slice(0, 3).every((c) => c.orientation === "upright"),
    ).toBe(true);
  });

  test("rotate without count flips whole pile", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = applyShuffleOps(state, [{ type: "rotate" }]);
    expect(state.pile.every((c) => c.orientation === "reversed")).toBe(true);
  });

  test("rotate with from+count flips mid pile segment only", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = applyShuffleOps(state, [{ type: "rotate", from: 2, count: 3 }]);
    expect(state.pile[0]?.orientation).toBe("upright");
    expect(state.pile[1]?.orientation).toBe("upright");
    expect(
      state.pile.slice(2, 5).every((c) => c.orientation === "reversed"),
    ).toBe(true);
    expect(state.pile[5]?.orientation).toBe("upright");
  });

  test("composed ops conserve card set and leave desk untouched", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = addFreeSlot(state, "side");
    const beforeDesk = state.desk;
    const beforeIds = sortedIds(state.pile);
    let i = 0;
    const seq = [0.2, 0.8, 0.4, 0.6, 0.1, 0.9, 0.3, 0.7, 0.5];
    const random = () => seq[i++ % seq.length] ?? 0.5;
    const out = applyShuffleOps(
      state,
      [
        { type: "mix" },
        { type: "cut", at: 17 },
        { type: "shift", from: 5, count: 4, to: 40 },
        { type: "seekerCut", at: 0.25 },
        { type: "rotate", count: 2 },
      ],
      random,
    );
    expect(sortedIds(out.pile)).toEqual(beforeIds);
    expect(out.pile).toHaveLength(78);
    expect(out.desk).toEqual(beforeDesk);
    expect(out.pile[0]?.orientation).toBe("reversed");
    expect(out.pile[1]?.orientation).toBe("reversed");
    expect(out.pile[2]?.orientation).toBe("upright");
  });
});

describe("pile addressing", () => {
  const card = (defId: string): CardInstance => ({
    defId,
    orientation: "upright",
    faceUp: false,
  });

  test("resolve draw: top=0, bottom=last, index in range", () => {
    expect(resolvePileDrawIndex({ kind: "top" }, 5)).toBe(0);
    expect(resolvePileDrawIndex({ kind: "bottom" }, 5)).toBe(4);
    expect(resolvePileDrawIndex({ kind: "index", index: 2 }, 5)).toBe(2);
    expect(resolvePileDrawIndex({ kind: "index", index: 2.9 }, 5)).toBe(2);
  });

  test("resolve insert: top=0, bottom=append, index in [0,len]", () => {
    expect(resolvePileInsertIndex({ kind: "top" }, 5)).toBe(0);
    expect(resolvePileInsertIndex({ kind: "bottom" }, 5)).toBe(5);
    expect(resolvePileInsertIndex({ kind: "index", index: 0 }, 5)).toBe(0);
    expect(resolvePileInsertIndex({ kind: "index", index: 5 }, 5)).toBe(5);
    expect(resolvePileInsertIndex({ kind: "index", index: 3 }, 5)).toBe(3);
  });

  test("resolve draw rejects empty pile and out-of-range index", () => {
    expect(() => resolvePileDrawIndex({ kind: "top" }, 0)).toThrow(/empty/);
    expect(() => resolvePileDrawIndex({ kind: "index", index: -1 }, 3)).toThrow(
      /out of range/,
    );
    expect(() => resolvePileDrawIndex({ kind: "index", index: 3 }, 3)).toThrow(
      /out of range/,
    );
  });

  test("resolve insert rejects out-of-range index", () => {
    expect(() => resolvePileInsertIndex({ kind: "index", index: -1 }, 3)).toThrow(
      /out of range/,
    );
    expect(() => resolvePileInsertIndex({ kind: "index", index: 4 }, 3)).toThrow(
      /out of range/,
    );
  });

  test("drawFromPile top / bottom / middle index", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const topId = state.pile[0]!.defId;
    const bottomId = state.pile[77]!.defId;
    const midId = state.pile[40]!.defId;
    const afterMid = state.pile[41]!.defId;

    const fromTop = drawFromPile(state, { kind: "top" });
    expect(fromTop.card.defId).toBe(topId);
    expect(fromTop.state.pile).toHaveLength(77);
    expect(fromTop.state.desk).toEqual(state.desk);

    const fromBottom = drawFromPile(state, { kind: "bottom" });
    expect(fromBottom.card.defId).toBe(bottomId);
    expect(fromBottom.state.pile).toHaveLength(77);

    const fromMid = drawFromPile(state, { kind: "index", index: 40 });
    expect(fromMid.card.defId).toBe(midId);
    expect(fromMid.state.pile).toHaveLength(77);
    expect(fromMid.state.pile[40]!.defId).toBe(afterMid);
  });

  test("drawFromPile defaults to top", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const topId = state.pile[0]!.defId;
    const { card: drawn } = drawFromPile(state);
    expect(drawn.defId).toBe(topId);
  });

  test("insertIntoPile top / bottom / index", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const marker = card("test-marker");
    const originalAt10 = state.pile[10]?.defId;

    state = insertIntoPile(state, marker, { kind: "top" });
    expect(state.pile).toHaveLength(79);
    expect(state.pile[0]?.defId).toBe("test-marker");

    state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = insertIntoPile(state, marker, { kind: "bottom" });
    expect(state.pile).toHaveLength(79);
    expect(state.pile[78]?.defId).toBe("test-marker");

    state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = insertIntoPile(state, marker, { kind: "index", index: 10 });
    expect(state.pile).toHaveLength(79);
    expect(state.pile[10]?.defId).toBe("test-marker");
    expect(state.pile[11]?.defId).toBe(originalAt10);
  });

  test("draw then insert at address conserves count and identity", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const addresses: PileAddress[] = [
      { kind: "top" },
      { kind: "bottom" },
      { kind: "index", index: 25 },
    ];
    for (const address of addresses) {
      const before = state.pile.map((c) => c.defId);
      const { state: drawn, card: c } = drawFromPile(state, address);
      expect(drawn.pile).toHaveLength(77);
      const restored = insertIntoPile(drawn, c, address);
      expect(restored.pile).toHaveLength(78);
      if (address.kind === "top" || address.kind === "bottom") {
        expect(restored.pile.map((x) => x.defId)).toEqual(before);
      } else {
        expect(restored.pile[address.index]?.defId).toBe(c.defId);
      }
    }
  });

  test("drawFromPile on empty pile throws", () => {
    const state = {
      deckId: "empty",
      pile: [] as CardInstance[],
      desk: [],
    };
    expect(() => drawFromPile(state, { kind: "top" })).toThrow(/empty/);
  });
});
