import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createFileMemoryStore } from "./store.ts";

describe("file memory store", () => {
  test("empty recall is keyed by seeker id without profile", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);
    const mem = await store.recall("seeker-a");
    expect(mem.seekerId).toBe("seeker-a");
    expect(mem.language).toBeUndefined();
    expect(mem.preferredName).toBeUndefined();
    expect(mem.selfNotes).toBeUndefined();
    expect(mem.notes).toEqual([]);
    expect(mem.pastDeckIds).toEqual([]);
  });

  test("save/recall persists language, preferred name, self notes", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);

    const saved = await store.save("seeker-a", {
      language: "ru",
      preferredName: "Anya",
      selfNotes: "works nights; anxious about change",
      notes: ["likes short readings"],
      pastDeckIds: ["light-seers"],
    });
    expect(saved.seekerId).toBe("seeker-a");
    expect(saved.language).toBe("ru");
    expect(saved.preferredName).toBe("Anya");
    expect(saved.selfNotes).toBe("works nights; anxious about change");

    const recalled = await store.recall("seeker-a");
    expect(recalled).toEqual(saved);
  });

  test("seekers are isolated by id", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);

    await store.save("seeker-a", {
      language: "en",
      preferredName: "Alex",
      selfNotes: "a",
    });
    await store.save("seeker-b", {
      language: "ru",
      preferredName: "Boris",
      selfNotes: "b",
    });

    const a = await store.recall("seeker-a");
    const b = await store.recall("seeker-b");
    expect(a.preferredName).toBe("Alex");
    expect(a.language).toBe("en");
    expect(b.preferredName).toBe("Boris");
    expect(b.language).toBe("ru");
  });

  test("refactor replaces notes but keeps profile + past decks", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);

    await store.save("seeker-a", {
      language: "en",
      preferredName: "Sam",
      selfNotes: "quiet",
      notes: ["old note", "stale"],
      pastDeckIds: ["light-seers"],
    });

    const next = await store.refactor("seeker-a", [
      "  Prefers clear questions  ",
      "",
      "Used light-seers",
    ]);
    expect(next.notes).toEqual([
      "Prefers clear questions",
      "Used light-seers",
    ]);
    expect(next.language).toBe("en");
    expect(next.preferredName).toBe("Sam");
    expect(next.selfNotes).toBe("quiet");
    expect(next.pastDeckIds).toEqual(["light-seers"]);
  });

  test("recall normalizes legacy json and forces seekerId from key", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);
    const file = path.join(dir, `${encodeURIComponent("seeker-a")}.json`);
    await writeFile(
      file,
      JSON.stringify({
        seekerId: "wrong-id",
        notes: ["legacy"],
        pastDeckIds: ["light-seers"],
        updatedAt: "2020-01-01T00:00:00.000Z",
      }),
      "utf8",
    );

    const mem = await store.recall("seeker-a");
    expect(mem.seekerId).toBe("seeker-a");
    expect(mem.notes).toEqual(["legacy"]);
    expect(mem.language).toBeUndefined();
    expect(mem.preferredName).toBeUndefined();
    expect(mem.selfNotes).toBeUndefined();
  });

  test("partial save merges profile without wiping other fields", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prophet-mem-"));
    const store = createFileMemoryStore(dir);

    await store.save("seeker-a", {
      language: "ru",
      preferredName: "Anya",
      selfNotes: "night worker",
      notes: ["n1"],
    });
    const next = await store.save("seeker-a", { language: "en" });
    expect(next.language).toBe("en");
    expect(next.preferredName).toBe("Anya");
    expect(next.selfNotes).toBe("night worker");
    expect(next.notes).toEqual(["n1"]);
  });
});
