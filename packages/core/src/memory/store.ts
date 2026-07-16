import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type SeekerMemory = {
  seekerId: string;
  notes: string[];
  pastDeckIds: string[];
  updatedAt: string;
};

export type MemoryStore = {
  recall(seekerId: string): Promise<SeekerMemory>;
  save(seekerId: string, patch: Partial<Omit<SeekerMemory, "seekerId">>): Promise<SeekerMemory>;
  refactor(seekerId: string, notes: string[]): Promise<SeekerMemory>;
};

function emptyMemory(seekerId: string): SeekerMemory {
  return {
    seekerId,
    notes: [],
    pastDeckIds: [],
    updatedAt: new Date().toISOString(),
  };
}

/** File-backed JSON memory — MVP, not production DB. */
export function createFileMemoryStore(dir: string): MemoryStore {
  const fileFor = (seekerId: string) =>
    path.join(dir, `${encodeURIComponent(seekerId)}.json`);

  return {
    async recall(seekerId) {
      try {
        const raw = await readFile(fileFor(seekerId), "utf8");
        return JSON.parse(raw) as SeekerMemory;
      } catch {
        return emptyMemory(seekerId);
      }
    },

    async save(seekerId, patch) {
      await mkdir(dir, { recursive: true });
      const current = await this.recall(seekerId);
      const next: SeekerMemory = {
        seekerId,
        notes: patch.notes ?? current.notes,
        pastDeckIds: patch.pastDeckIds ?? current.pastDeckIds,
        updatedAt: new Date().toISOString(),
      };
      await writeFile(fileFor(seekerId), JSON.stringify(next, null, 2), "utf8");
      return next;
    },

    async refactor(seekerId, notes) {
      const current = await this.recall(seekerId);
      const cleaned = notes
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, 40);
      return this.save(seekerId, {
        notes: cleaned,
        pastDeckIds: current.pastDeckIds,
      });
    },
  };
}
