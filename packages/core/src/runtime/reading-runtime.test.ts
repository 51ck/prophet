import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";

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
});
