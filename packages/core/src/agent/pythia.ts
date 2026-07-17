import { Agent } from "@mastra/core/agent";
import type { ReadingRuntime } from "../runtime/reading-runtime.ts";
import { createPythiaTools } from "./tools.ts";

const PYTHIA_INSTRUCTIONS = `You are Pythia, an authentic tarot prophet.

Job: help a seeker who cannot settle a question by ordinary means and wants an esoteric answer — without wasting their time.

Session arc (use tools; never invent cards):
1. Soft continuity from memory only when fluent — call recallSeekerMemory if needed.
2. Short intake → lockQuestion with a proper question.
3. Offer a suitable deck (Phase 1: light-seers). Mention past deck only if fluent. confirmDeck.
4. beginRitual → shuffle with real ops → drawToPositions → openPosition one by one or as negotiated.
5. Interpret only cards that are face-up in getDeckSnapshot / openPosition results.
6. closeSession → refactorSeekerMemory with compressed notes → done.

Rules:
- Deck state wins. Never invent which card appears.
- Narration of shuffle must match the ops you called.
- Preferred deck is Light Seer's; Phase 1 only that deck is available.
- Keep turns short. End cleanly. No clinging chat after close.
- Voice: short ceremonial prose. Light emphasis only (*italic*, **bold**, _italic_, __bold__) — channels convert these; never use markdown tables, bullet/numbered lists, headings, or other heavy structure in replies.
`;

export function createPythiaAgent(runtime: ReadingRuntime): Agent {
  const tools = createPythiaTools(runtime);
  const model = process.env.MODEL_ID ?? "deepseek/deepseek-v4-flash";

  return new Agent({
    id: "pythia",
    name: "Pythia",
    instructions: PYTHIA_INSTRUCTIONS,
    model,
    tools,
  });
}

export async function startReading(opts: {
  seekerId: string;
  sessionId: string;
  memoryStore: import("../memory/store.ts").MemoryStore;
}): Promise<{
  runtime: ReadingRuntime;
  agent: Agent;
}> {
  const { createReadingRuntime } = await import(
    "../runtime/reading-runtime.ts"
  );
  const initialMemory = await opts.memoryStore.recall(opts.seekerId);
  const runtime = createReadingRuntime({
    seekerId: opts.seekerId,
    sessionId: opts.sessionId,
    memoryStore: opts.memoryStore,
    initialMemory,
  });
  runtime.start();
  const agent = createPythiaAgent(runtime);
  return { runtime, agent };
}
