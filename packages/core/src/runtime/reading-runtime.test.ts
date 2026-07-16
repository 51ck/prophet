import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";

describe("reading runtime arc", () => {
  test("question → deck → ritual → open real card", async () => {
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
    expect(runtime.session.phase).toBe("offerDeck");

    runtime.confirmDeck("light-seers");
    runtime.beginRitual("three-roads");
    runtime.shuffle([{ type: "mix" }, { type: "cut" }, { type: "rotate", count: 5 }]);
    runtime.draw();
    const snap = runtime.open("situation");
    const sit = snap.table.find((t) => t.id === "situation");
    expect(sit?.faceUp).toBe(true);
    expect(sit?.defId).toBeTruthy();

    runtime.close();
    await runtime.saveMemory(["Works on career questions"], "light-seers");
    await runtime.refactorMemory(["Prefers clear career questions", "Used light-seers"]);
    expect(runtime.session.phase).toBe("ended");
  });
});
