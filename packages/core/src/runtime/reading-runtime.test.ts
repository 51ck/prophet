import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import {
  CARD_OF_DAY,
  CELTIC_CROSS,
  CHOICE,
  PAST_PRESENT_FUTURE,
  RELATIONSHIP,
  SINGLE_FOCUS,
  THREE_ROADS,
  THOUGHTS_FEELINGS_ACTIONS,
  TWELVE_HOUSES,
  TWO_POLES,
  WORK_FINANCE,
  YES_NO,
} from "../ritual/engine.ts";
import type { SpreadDef } from "../ritual/types.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";

/** All catalog spreads registered T8.2–T8.5 (runtime map). */
const CATALOG_SPREADS: SpreadDef[] = [
  CARD_OF_DAY,
  SINGLE_FOCUS,
  YES_NO,
  TWO_POLES,
  PAST_PRESENT_FUTURE,
  THOUGHTS_FEELINGS_ACTIONS,
  THREE_ROADS,
  RELATIONSHIP,
  WORK_FINANCE,
  CHOICE,
  CELTIC_CROSS,
  TWELVE_HOUSES,
];

async function runtimeAtCommitted() {
  const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
  const store = createFileMemoryStore(dir);
  const memory = await store.recall("seeker-1");
  const runtime = createReadingRuntime({
    seekerId: "seeker-1",
    sessionId: "sess-1",
    memoryStore: store,
    initialMemory: memory,
  });
  runtime.start();
  runtime.lockQuestion("What blocks my next step at work?");
  runtime.confirmDeck("light-seers");
  expect(runtime.session.phase).toBe("committed");
  return runtime;
}

describe("reading runtime arc", () => {
  test("question → deck → ritual → open real card", async () => {
    const runtime = await runtimeAtCommitted();

    runtime.beginRitual("three-roads");
    runtime.shuffle([{ type: "mix" }, { type: "cut" }, { type: "rotate", count: 5 }]);
    runtime.draw();
    const snap = runtime.open("situation");
    const sit = snap.desk.find((t) => t.id === "situation");
    expect(sit?.faceUp).toBe(true);
    expect(sit?.defId).toBeTruthy();

    runtime.close();
    await runtime.saveMemory(["Works on career questions"], "light-seers");
    await runtime.refactorMemory(["Prefers clear career questions", "Used light-seers"]);
    expect(runtime.session.phase).toBe("ended");
  });

  test("desk/pile mutators reject committed (pre-beginRitual)", async () => {
    const runtime = await runtimeAtCommitted();
    const pileBefore = runtime.deck!.pile.length;

    expect(() => runtime.place("premature")).toThrow(/Place only in ritual/);
    expect(() => runtime.draw()).toThrow(/Draw only in ritual/);
    expect(() => runtime.returnCard("x")).toThrow(/Return only in ritual/);
    expect(() => runtime.rotate("x")).toThrow(/Rotate only in ritual/);
    expect(() => runtime.open("x")).toThrow(/Open only in ritual/);
    expect(() => runtime.shuffle([{ type: "mix" }])).toThrow(
      /Shuffle only in ritual/,
    );

    expect(runtime.session.phase).toBe("committed");
    expect(runtime.deck!.pile.length).toBe(pileBefore);
    expect(runtime.deck!.desk).toEqual([]);

    runtime.beginRitual("three-roads");
    expect(runtime.session.phase).toBe("ritual");
    const after = runtime.place("free-1");
    expect(after.desk.some((s) => s.id === "free-1")).toBe(true);
  });

  describe("catalog spreads (T8.6)", () => {
    test.each(CATALOG_SPREADS.map((s) => [s.id, s] as const))(
      "beginRitual %s → correct desk slot count/ids/kinds",
      async (spreadId, spread) => {
        const runtime = await runtimeAtCommitted();
        runtime.beginRitual(spreadId);

        expect(runtime.session.phase).toBe("ritual");
        expect(runtime.session.spreadId).toBe(spread.id);
        const desk = runtime.deck!.desk;
        expect(desk).toHaveLength(spread.positions.length);
        expect(desk.map((slot) => slot.id)).toEqual(
          spread.positions.map((p) => p.id),
        );
        expect(desk.map((slot) => slot.role)).toEqual(
          spread.positions.map((p) => p.role),
        );
        expect(desk.every((slot) => slot.kind === "spread")).toBe(true);
        expect(desk.every((slot) => slot.card === null)).toBe(true);
      },
    );

    test("beginRitual replaces prior spread layout", async () => {
      const runtime = await runtimeAtCommitted();
      runtime.beginRitual("three-roads");
      runtime.place("situation");
      expect(runtime.deck!.desk.filter((s) => s.card !== null)).toHaveLength(1);
      expect(runtime.deck!.desk.map((s) => s.id)).toEqual([
        "situation",
        "counsel",
        "path",
      ]);

      runtime.beginRitual("celtic-cross");
      expect(runtime.session.spreadId).toBe("celtic-cross");
      expect(runtime.deck!.desk).toHaveLength(10);
      expect(runtime.deck!.desk.map((s) => s.id)).toEqual(
        CELTIC_CROSS.positions.map((p) => p.id),
      );
      expect(runtime.deck!.desk.every((s) => s.kind === "spread")).toBe(true);
      expect(runtime.deck!.desk.every((s) => s.card === null)).toBe(true);

      runtime.beginRitual("twelve-houses");
      expect(runtime.session.spreadId).toBe("twelve-houses");
      expect(runtime.deck!.desk).toHaveLength(12);
      expect(runtime.deck!.desk.map((s) => s.id)).toEqual(
        TWELVE_HOUSES.positions.map((p) => p.id),
      );
      expect(runtime.deck!.desk.every((s) => s.kind === "spread")).toBe(true);
      expect(runtime.deck!.desk.every((s) => s.card === null)).toBe(true);
    });
  });
});
