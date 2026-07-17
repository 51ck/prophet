import { describe, expect, test } from "bun:test";
import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import {
  THREE_ROADS,
  addFreeSlot,
  applyShuffleOps,
  createDeckState,
  drawFromPile,
  drawToPositions,
  getDeckSnapshot,
  insertIntoPile,
  openPosition,
  peekDesk,
  resolvePileDrawIndex,
  resolvePileInsertIndex,
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
