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
import { dayCounselQuestion } from "../session/path.ts";

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
        if (spreadId === "card-of-day") {
          runtime.setSessionPath("day-card");
        }
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

    test("beginRitual rejects re-select mid-ritual (desk conserved)", async () => {
      const runtime = await runtimeAtCommitted();
      runtime.beginRitual("three-roads");
      runtime.place("situation");
      const deskBefore = runtime.deck!.desk.map((s) => ({
        id: s.id,
        hasCard: s.card !== null,
      }));
      const pileLen = runtime.deck!.pile.length;

      expect(() => runtime.beginRitual("celtic-cross")).toThrow(
        /Spread already applied in ritual/,
      );
      expect(runtime.session.spreadId).toBe("three-roads");
      expect(runtime.session.phase).toBe("ritual");
      expect(runtime.deck!.desk.map((s) => ({ id: s.id, hasCard: s.card !== null }))).toEqual(
        deskBefore,
      );
      expect(runtime.deck!.pile.length).toBe(pileLen);
    });
  });

  describe("day-card session path (T9.3)", () => {
    test("path → day counsel lock → deck → beginRitual defaults to card-of-day", async () => {
      const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
      const store = createFileMemoryStore(dir);
      const memory = await store.recall("seeker-day");
      const runtime = createReadingRuntime({
        seekerId: "seeker-day",
        sessionId: "sess-day",
        memoryStore: store,
        initialMemory: memory,
      });
      runtime.start();
      runtime.setSessionPath("day-card");
      runtime.lockQuestion(dayCounselQuestion("en"));
      runtime.confirmDeck("light-seers");
      runtime.beginRitual();
      expect(runtime.session.phase).toBe("ritual");
      expect(runtime.session.spreadId).toBe("card-of-day");
      expect(runtime.session.question).toMatch(/Counsel for this day/i);
      expect(runtime.deck!.desk).toHaveLength(1);
      expect(runtime.deck!.desk[0]?.id).toBe("focus");
    });

    test("rejects non-card-of-day spreads", async () => {
      const runtime = await runtimeAtCommitted();
      runtime.setSessionPath("day-card");
      expect(() => runtime.beginRitual("three-roads")).toThrow(
        /Day-card path requires spread "card-of-day"/,
      );
      expect(runtime.session.phase).toBe("committed");
    });

    test("card-of-day rejected without day-card path", async () => {
      const runtime = await runtimeAtCommitted();
      expect(() => runtime.beginRitual("card-of-day")).toThrow(
        /only allowed when sessionPath is day-card/,
      );
    });
  });

  describe("question session path (T9.4)", () => {
    test("path → lock → deck → beginRitual defaults to three-roads", async () => {
      const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
      const store = createFileMemoryStore(dir);
      const memory = await store.recall("seeker-q");
      const runtime = createReadingRuntime({
        seekerId: "seeker-q",
        sessionId: "sess-q",
        memoryStore: store,
        initialMemory: memory,
      });
      runtime.start();
      runtime.setSessionPath("question");
      runtime.lockQuestion("What blocks my next step at work?");
      runtime.confirmDeck("light-seers");
      runtime.beginRitual();
      expect(runtime.session.phase).toBe("ritual");
      expect(runtime.session.sessionPath).toBe("question");
      expect(runtime.session.spreadId).toBe("three-roads");
      expect(runtime.session.question).toMatch(/blocks my next step/i);
      expect(runtime.deck!.desk).toHaveLength(3);
    });

    test("matched catalog spread allowed on question path", async () => {
      const runtime = await runtimeAtCommitted();
      expect(runtime.session.sessionPath).toBe("question");
      runtime.beginRitual("single-focus");
      expect(runtime.session.spreadId).toBe("single-focus");
      expect(runtime.session.phase).toBe("ritual");
    });

    test("unset lockQuestion stamps question path; defaults three-roads", async () => {
      const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
      const store = createFileMemoryStore(dir);
      const memory = await store.recall("seeker-unset");
      const runtime = createReadingRuntime({
        seekerId: "seeker-unset",
        sessionId: "sess-unset",
        memoryStore: store,
        initialMemory: memory,
      });
      runtime.start();
      expect(runtime.session.sessionPath).toBeNull();
      runtime.lockQuestion("How should I approach this choice?");
      expect(runtime.session.sessionPath).toBe("question");
      runtime.confirmDeck("light-seers");
      expect(() => runtime.beginRitual("card-of-day")).toThrow(
        /only allowed when sessionPath is day-card/,
      );
      runtime.beginRitual();
      expect(runtime.session.spreadId).toBe("three-roads");
    });
  });
});
