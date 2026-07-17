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
  openPosition,
  peekDesk,
  placeOnDesk,
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
