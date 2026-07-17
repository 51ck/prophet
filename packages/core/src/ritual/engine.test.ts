import { describe, expect, test } from "bun:test";
import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import {
  THREE_ROADS,
  addFreeSlot,
  applyShuffleOps,
  createDeckState,
  drawToPositions,
  getDeckSnapshot,
  openPosition,
  peekDesk,
  selectSpread,
} from "../ritual/engine.ts";

describe("ritual engine", () => {
  test("creates 78-card Light Seer's pile with empty desk", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(state.pile).toHaveLength(78);
    expect(state.desk).toHaveLength(0);
    expect(LIGHT_SEERS_CARDS).toHaveLength(78);
  });

  test("mix changes order with seeded rng", () => {
    let i = 0;
    const seq = [0.9, 0.1, 0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6];
    const random = () => seq[i++ % seq.length] ?? 0.5;
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    const mixed = applyShuffleOps(state, [{ type: "mix" }], random);
    const sameOrder = mixed.pile.every(
      (c, idx) => c.defId === state.pile[idx]?.defId,
    );
    expect(sameOrder).toBe(false);
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

  test("rotate flips orientation on prefix", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = applyShuffleOps(state, [{ type: "rotate", count: 3 }]);
    expect(state.pile.slice(0, 3).every((c) => c.orientation === "reversed")).toBe(
      true,
    );
    expect(state.pile[3]?.orientation).toBe("upright");
  });
});
