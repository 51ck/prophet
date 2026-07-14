import { describe, expect, test } from "bun:test";
import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import {
  THREE_ROADS,
  applyShuffleOps,
  createDeckState,
  drawToPositions,
  getDeckSnapshot,
  openPosition,
  peekTable,
  selectSpread,
} from "../ritual/engine.ts";

describe("ritual engine", () => {
  test("creates 78-card Light Seer's pile", () => {
    const state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    expect(state.pile).toHaveLength(78);
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

  test("draw and open reveal only when opened", () => {
    let state = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
    state = selectSpread(state, THREE_ROADS);
    state = drawToPositions(state);
    const before = getDeckSnapshot(state);
    expect(before.table.every((t) => t.defId === null)).toBe(true);

    const top = peekTable(state)[0]?.card?.defId;
    expect(top).toBeTruthy();

    state = openPosition(state, "situation");
    const after = getDeckSnapshot(state);
    const sit = after.table.find((t) => t.id === "situation");
    expect(sit?.faceUp).toBe(true);
    expect(sit?.defId).toBe(top);
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
