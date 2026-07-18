import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "../memory/store.ts";
import { createReadingRuntime } from "../runtime/reading-runtime.ts";
import { createPythiaAgent } from "./pythia.ts";
import { createPythiaTools } from "./tools.ts";

describe("profile prompt transparency (T3.14)", () => {
  test("instructions require fluent use, no save narration, one-seeker only", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-profile-prompt-"));
    const store = createFileMemoryStore(dir);
    await store.save("seeker-a", {
      language: "en",
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
    const raw = agent.getInstructions();
    const instructions = typeof raw === "string" ? raw : String(raw);

    expect(instructions).toContain("Profile (transparent use)");
    expect(instructions).toContain("preferredName");
    expect(instructions).toContain("selfNotes");
    expect(instructions).toMatch(/Never narrate persistence/);
    expect(instructions).toMatch(/one seeker only/i);
    expect(instructions).toContain(
      "use preferredName/selfNotes fluently",
    );
    expect(instructions).toContain("do not ask again");
  });

  test("incomplete name/self status warns once + isolation", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-profile-prompt-"));
    const store = createFileMemoryStore(dir);
    await store.save("seeker-b", { language: "ru" });
    const runtime = createReadingRuntime({
      seekerId: "seeker-b",
      sessionId: "sess-b",
      memoryStore: store,
      initialMemory: await store.recall("seeker-b"),
    });
    const agent = createPythiaAgent(runtime);
    const raw = agent.getInstructions();
    const instructions = typeof raw === "string" ? raw : String(raw);

    expect(instructions).toContain("ask once");
    expect(instructions).toContain("skip if ask already in thread");
    expect(instructions).toContain("never imply other seekers");
  });

  test("profile tools forbid other-seeker access in descriptions", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-profile-prompt-"));
    const store = createFileMemoryStore(dir);
    const runtime = createReadingRuntime({
      seekerId: "seeker-c",
      sessionId: "sess-c",
      memoryStore: store,
      initialMemory: await store.recall("seeker-c"),
    });
    const tools = createPythiaTools(runtime);
    const readDesc = tools.readSeekerProfile.description ?? "";
    const updateDesc = tools.updateSeekerProfile.description ?? "";

    expect(readDesc).toMatch(/current seeker only/i);
    expect(readDesc).toMatch(/Never imply access to another seeker/);
    expect(updateDesc).toMatch(/never narrate saving/i);
    expect(updateDesc).toMatch(/No other seeker/);
  });
});
