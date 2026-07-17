import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type SeekerLanguage = "ru" | "en";

export type SeekerMemory = {
  seekerId: string;
  /** Phase 1 introduce — unset until seeker picks ru|en */
  language?: SeekerLanguage;
  preferredName?: string;
  /** Few words about the seeker from introduce */
  selfNotes?: string;
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

function normalizeMemory(seekerId: string, raw: Partial<SeekerMemory>): SeekerMemory {
  const language =
    raw.language === "ru" || raw.language === "en" ? raw.language : undefined;
  return {
    seekerId,
    ...(language ? { language } : {}),
    ...(typeof raw.preferredName === "string" && raw.preferredName.length > 0
      ? { preferredName: raw.preferredName }
      : {}),
    ...(typeof raw.selfNotes === "string" && raw.selfNotes.length > 0
      ? { selfNotes: raw.selfNotes }
      : {}),
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    pastDeckIds: Array.isArray(raw.pastDeckIds) ? raw.pastDeckIds : [],
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

/** File-backed JSON memory — MVP, not production DB. Keyed strictly by seeker id. */
export function createFileMemoryStore(dir: string): MemoryStore {
  const fileFor = (seekerId: string) =>
    path.join(dir, `${encodeURIComponent(seekerId)}.json`);

  return {
    async recall(seekerId) {
      try {
        const raw = await readFile(fileFor(seekerId), "utf8");
        return normalizeMemory(seekerId, JSON.parse(raw) as Partial<SeekerMemory>);
      } catch {
        return emptyMemory(seekerId);
      }
    },

    async save(seekerId, patch) {
      await mkdir(dir, { recursive: true });
      const current = await this.recall(seekerId);
      const next = normalizeMemory(seekerId, {
        language: patch.language !== undefined ? patch.language : current.language,
        preferredName:
          patch.preferredName !== undefined
            ? patch.preferredName
            : current.preferredName,
        selfNotes:
          patch.selfNotes !== undefined ? patch.selfNotes : current.selfNotes,
        notes: patch.notes ?? current.notes,
        pastDeckIds: patch.pastDeckIds ?? current.pastDeckIds,
        updatedAt: new Date().toISOString(),
      });
      await writeFile(fileFor(seekerId), JSON.stringify(next, null, 2), "utf8");
      return next;
    },

    async refactor(seekerId, notes) {
      const current = await this.recall(seekerId);
      const cleaned = notes
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, 40);
      // Profile fields stay; only continuity notes are replaced.
      return this.save(seekerId, {
        notes: cleaned,
        pastDeckIds: current.pastDeckIds,
      });
    },
  };
}
