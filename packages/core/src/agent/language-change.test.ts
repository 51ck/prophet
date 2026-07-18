import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";
import { createPythiaAgent } from "./pythia.ts";

describe("language change register (T3.13)", () => {
  test("updateProfile language flips prompt register; no re-introduce", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-lang-change-"));
    const store = createFileMemoryStore(dir);
    await store.save("seeker-a", {
      language: "ru",
      preferredName: "Anya",
      selfNotes: "nights",
    });
    const runtime = createReadingRuntime({
      seekerId: "seeker-a",
      sessionId: "sess-a",
      memoryStore: store,
      initialMemory: await store.recall("seeker-a"),
    });
    const agent = createPythiaAgent(runtime);
    const instructions = () => {
      const i = agent.getInstructions();
      return typeof i === "string" ? i : String(i);
    };

    expect(instructions()).toContain("Speak ru");
    expect(instructions()).toContain("Name/self complete");
    expect(instructions()).toContain("Language (change)");

    await runtime.updateProfile({ language: "en" });

    expect(runtime.readProfile().language).toBe("en");
    expect(runtime.readProfile().preferredName).toBe("Anya");
    expect(runtime.readProfile().selfNotes).toBe("nights");
    expect(instructions()).toContain("Speak en");
    expect(instructions()).not.toContain("Speak ru");
    expect(instructions()).toContain("Name/self complete");
    expect(instructions()).not.toContain("Name/self incomplete");

    const saved = await store.recall("seeker-a");
    expect(saved.language).toBe("en");
    expect(saved.preferredName).toBe("Anya");
  });
});
