import {
  createFileMemoryStore,
  startReading,
  type AskWithOptions,
  type MemoryStore,
  type ReadingRuntime,
} from "@prophet/core";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PythiaAgent = Awaited<ReturnType<typeof startReading>>["agent"];

/** Open closed-ask chrome until seeker taps or types over it. */
export type PendingAsk = {
  ask: AskWithOptions;
  chatId: number;
  messageId: number;
};

export type ActiveReading = {
  seekerId: string;
  sessionId: string;
  runtime: ReadingRuntime;
  agent: PythiaAgent;
  history: ChatMessage[];
  pendingAsk?: PendingAsk;
};

export type SessionHub = {
  getOrStart(seekerId: string): Promise<ActiveReading>;
  startFresh(seekerId: string): Promise<ActiveReading>;
  drop(seekerId: string): void;
};

/** Claim pending ask (typed reply or callback). Clears so free text never waits on a tap. */
export function claimPendingAsk(
  reading: Pick<ActiveReading, "pendingAsk">,
): PendingAsk | undefined {
  const pending = reading.pendingAsk;
  if (!pending) return undefined;
  reading.pendingAsk = undefined;
  return pending;
}

export function createSessionHub(memoryStore: MemoryStore): SessionHub {
  const active = new Map<string, ActiveReading>();

  async function startFresh(seekerId: string): Promise<ActiveReading> {
    const sessionId = `${seekerId}-${Date.now()}`;
    const { runtime, agent } = await startReading({
      seekerId,
      sessionId,
      memoryStore,
    });
    const reading: ActiveReading = {
      seekerId,
      sessionId,
      runtime,
      agent,
      history: [],
    };
    active.set(seekerId, reading);
    return reading;
  }

  return {
    async getOrStart(seekerId) {
      const current = active.get(seekerId);
      if (current && current.runtime.session.phase !== "ended") {
        return current;
      }
      return startFresh(seekerId);
    },
    startFresh,
    drop(seekerId) {
      active.delete(seekerId);
    },
  };
}

export function createDefaultMemoryStore(): MemoryStore {
  const dir = process.env.MEMORY_DIR ?? "./data/memory";
  return createFileMemoryStore(dir);
}
