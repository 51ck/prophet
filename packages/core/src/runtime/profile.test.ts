import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createPythiaTools,
  readSeekerProfileInputSchema,
  updateSeekerProfileInputSchema,
} from "../agent/tools.ts";
import { createFileMemoryStore } from "../memory/store.ts";
import { createReadingRuntime } from "./reading-runtime.ts";

async function runtimeFor(seekerId: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "prophet-profile-"));
  const store = createFileMemoryStore(dir);
  const initialMemory = await store.recall(seekerId);
  const runtime = createReadingRuntime({
    seekerId,
    sessionId: `sess-${seekerId}`,
    memoryStore: store,
    initialMemory,
  });
  return { runtime, store, dir };
}

describe("profile read/write (current seeker only)", () => {
  test("updateProfile writes current seeker fields", async () => {
    const { runtime, store } = await runtimeFor("seeker-a");

    expect(runtime.readProfile()).toEqual({});

    const profile = await runtime.updateProfile({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "works nights",
    });

    expect(profile).toEqual({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "works nights",
    });
    expect(runtime.readProfile()).toEqual(profile);

    const saved = await store.recall("seeker-a");
    expect(saved.language).toBe("ru");
    expect(saved.preferredName).toBe("Anya");
    expect(saved.selfNotes).toBe("works nights");
  });

  test("updateProfile never touches another seeker file", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-profile-iso-"));
    const store = createFileMemoryStore(dir);
    await store.save("seeker-b", {
      language: "en",
      preferredName: "Boris",
      selfNotes: "keep me",
    });

    const runtimeA = createReadingRuntime({
      seekerId: "seeker-a",
      sessionId: "sess-a",
      memoryStore: store,
      initialMemory: await store.recall("seeker-a"),
    });

    await runtimeA.updateProfile({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "a",
    });

    const b = await store.recall("seeker-b");
    expect(b.preferredName).toBe("Boris");
    expect(b.selfNotes).toBe("keep me");
    expect(b.language).toBe("en");
  });

  test("tools bind to runtime seeker and expose no seekerId param", async () => {
    const { runtime, store } = await runtimeFor("seeker-a");
    await store.save("seeker-b", {
      language: "en",
      preferredName: "Boris",
      selfNotes: "other",
    });

    expect(Object.keys(readSeekerProfileInputSchema.shape)).toEqual([]);
    expect(Object.keys(updateSeekerProfileInputSchema.shape).sort()).toEqual([
      "language",
      "preferredName",
      "selfNotes",
    ]);
    expect("seekerId" in updateSeekerProfileInputSchema.shape).toBe(false);

    // Extra seekerId is stripped — cannot retarget write.
    const parsed = updateSeekerProfileInputSchema.parse({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "from tool",
      seekerId: "seeker-b",
    });
    expect(parsed).toEqual({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "from tool",
    });

    const tools = createPythiaTools(runtime);
    await tools.updateSeekerProfile.execute!(parsed, {} as never);

    expect(await tools.readSeekerProfile.execute!({}, {} as never)).toEqual({
      language: "ru",
      preferredName: "Anya",
      selfNotes: "from tool",
    });

    const a = await store.recall("seeker-a");
    expect(a.preferredName).toBe("Anya");
    const b = await store.recall("seeker-b");
    expect(b.preferredName).toBe("Boris");
    expect(b.selfNotes).toBe("other");
  });
});
