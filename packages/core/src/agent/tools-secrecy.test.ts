import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import { getDeckSnapshot } from "../ritual/engine.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";
import { createPythiaTools } from "./tools.ts";

type DeckSnapshot = ReturnType<typeof getDeckSnapshot>;

describe("agent tool secrecy (T6.3)", () => {
  test("createPythiaTools exposes getDeckSnapshot but never peek", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-tool-secrecy-"));
    const store = createFileMemoryStore(dir);
    const runtime = createReadingRuntime({
      seekerId: "seeker-sec",
      sessionId: "sess-sec",
      memoryStore: store,
      initialMemory: await store.recall("seeker-sec"),
    });
    const tools = createPythiaTools(runtime);
    const keys = Object.keys(tools);

    expect(keys).toContain("getDeckSnapshot");
    expect(keys).not.toContain("peekDesk");
    expect(keys).not.toContain("peekTable");
    expect(keys.filter((k) => /peek/i.test(k))).toEqual([]);
  });

  test("ritual tool results use secrecy-safe snapshot only (face-down hidden)", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-tool-secrecy-"));
    const store = createFileMemoryStore(dir);
    const runtime = createReadingRuntime({
      seekerId: "seeker-sec2",
      sessionId: "sess-sec2",
      memoryStore: store,
      initialMemory: await store.recall("seeker-sec2"),
    });
    const tools = createPythiaTools(runtime);

    runtime.start();
    runtime.lockQuestion("What should I watch tonight?");
    runtime.confirmDeck("light-seers");

    const begun = (await tools.beginRitual.execute!(
      { spreadId: "three-roads" },
      {} as never,
    )) as { snapshot: DeckSnapshot };
    expect(begun.snapshot).toMatchObject({ pileCount: 78 });
    expect(
      begun.snapshot.desk.every((t) => t.defId === null && !t.faceUp),
    ).toBe(true);

    const drawn = (await tools.drawToPositions.execute!(
      {},
      {} as never,
    )) as { snapshot: DeckSnapshot };
    expect(drawn.snapshot.desk).toHaveLength(3);
    expect(
      drawn.snapshot.desk.every(
        (t) => t.defId === null && !t.faceUp && t.orientation === null,
      ),
    ).toBe(true);
    expect(drawn.snapshot).not.toHaveProperty("pile");
    expect(JSON.stringify(drawn.snapshot)).not.toContain('"defId":"');

    const viewed = (await tools.getDeckSnapshot.execute!(
      {},
      {} as never,
    )) as DeckSnapshot;
    expect(viewed).toEqual(drawn.snapshot);

    const opened = (await tools.openPosition.execute!(
      { positionId: "situation" },
      {} as never,
    )) as { snapshot: DeckSnapshot };
    const sit = opened.snapshot.desk.find((t) => t.id === "situation");
    expect(sit?.faceUp).toBe(true);
    expect(sit?.defId).toBeTruthy();
    expect(
      opened.snapshot.desk
        .filter((t) => t.id !== "situation")
        .every((t) => t.defId === null && !t.faceUp),
    ).toBe(true);
  });
});
