import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import type {
  MemoryStore,
  SeekerLanguage,
  SeekerMemory,
} from "../memory/store.ts";
import {
  THREE_ROADS,
  applyShuffleOps,
  createDeckState,
  drawToPositions,
  getDeckSnapshot,
  openPosition,
  selectSpread,
} from "../ritual/engine.ts";
import type { DeckState, ShuffleOp, SpreadDef } from "../ritual/types.ts";
import {
  confirmDeck,
  createSession,
  lockQuestion,
  transition,
  type ReadingSession,
} from "../session/session.ts";

const spreads: Record<string, SpreadDef> = {
  [THREE_ROADS.id]: THREE_ROADS,
};

/** Phase 1 soft profile — always the runtime session seeker. */
export type SeekerProfile = {
  language?: SeekerLanguage;
  preferredName?: string;
  selfNotes?: string;
};

export type SeekerProfilePatch = {
  language?: SeekerLanguage;
  preferredName?: string;
  selfNotes?: string;
};

export type ReadingRuntime = {
  session: ReadingSession;
  deck: DeckState | null;
  memory: SeekerMemory;
  start(): void;
  lockQuestion(question: string): void;
  confirmDeck(deckId: string): void;
  beginRitual(spreadId?: string): void;
  shuffle(ops: ShuffleOp[]): void;
  draw(): void;
  open(positionId: string): ReturnType<typeof getDeckSnapshot>;
  snapshot(): ReturnType<typeof getDeckSnapshot> | { empty: true };
  close(): void;
  /** Profile for `session.seekerId` only — no other seeker selector. */
  readProfile(): SeekerProfile;
  /** Patch profile for `session.seekerId` only — no other seeker selector. */
  updateProfile(patch: SeekerProfilePatch): Promise<SeekerProfile>;
  saveMemory(notes?: string[], pastDeckId?: string): Promise<SeekerMemory>;
  refactorMemory(notes: string[]): Promise<SeekerMemory>;
  endWithoutRitual(): void;
};

export function createReadingRuntime(opts: {
  seekerId: string;
  sessionId: string;
  memoryStore: MemoryStore;
  initialMemory: SeekerMemory;
}): ReadingRuntime {
  const { memoryStore } = opts;
  let session = createSession(opts.seekerId, opts.sessionId);
  let deck: DeckState | null = null;
  let memory = opts.initialMemory;

  const runtime: ReadingRuntime = {
    get session() {
      return session;
    },
    get deck() {
      return deck;
    },
    get memory() {
      return memory;
    },

    start() {
      session = transition(session, "recall");
      session = transition(session, "intake");
    },

    lockQuestion(question: string) {
      session = lockQuestion(session, question);
      if (session.phase === "intake") {
        session = transition(session, "offerDeck");
      }
    },

    confirmDeck(deckId: string) {
      const id = deckId || LIGHT_SEERS_DECK_ID;
      if (id !== LIGHT_SEERS_DECK_ID) {
        throw new Error(
          `Phase 1 only supports deck "${LIGHT_SEERS_DECK_ID}", got "${id}"`,
        );
      }
      session = confirmDeck(session, id);
      deck = createDeckState(LIGHT_SEERS_DECK_ID, LIGHT_SEERS_CARDS);
      session = transition(session, "committed");
    },

    beginRitual(spreadId = THREE_ROADS.id) {
      if (!deck) throw new Error("Deck not confirmed");
      const spread = spreads[spreadId];
      if (!spread) throw new Error(`Unknown spread "${spreadId}"`);
      session = { ...session, spreadId: spread.id };
      if (session.phase === "committed") {
        session = transition(session, "ritual");
      }
      deck = selectSpread(deck, spread);
    },

    shuffle(ops: ShuffleOp[]) {
      if (!deck) throw new Error("Deck not ready");
      if (session.phase !== "ritual") {
        throw new Error(`Shuffle only in ritual, got ${session.phase}`);
      }
      deck = applyShuffleOps(deck, ops);
    },

    draw() {
      if (!deck) throw new Error("Deck not ready");
      deck = drawToPositions(deck);
    },

    open(positionId: string) {
      if (!deck) throw new Error("Deck not ready");
      deck = openPosition(deck, positionId);
      return getDeckSnapshot(deck);
    },

    snapshot() {
      if (!deck) return { empty: true as const };
      return getDeckSnapshot(deck);
    },

    close() {
      if (session.phase === "ritual") {
        session = transition(session, "closing");
      }
      if (session.phase === "closing") {
        session = transition(session, "refactor");
      }
    },

    readProfile() {
      return {
        ...(memory.language ? { language: memory.language } : {}),
        ...(memory.preferredName ? { preferredName: memory.preferredName } : {}),
        ...(memory.selfNotes ? { selfNotes: memory.selfNotes } : {}),
      };
    },

    async updateProfile(patch) {
      memory = await memoryStore.save(session.seekerId, {
        ...(patch.language !== undefined ? { language: patch.language } : {}),
        ...(patch.preferredName !== undefined
          ? { preferredName: patch.preferredName }
          : {}),
        ...(patch.selfNotes !== undefined
          ? { selfNotes: patch.selfNotes }
          : {}),
      });
      return runtime.readProfile();
    },

    async saveMemory(notes, pastDeckId) {
      const pastDeckIds = pastDeckId
        ? [...new Set([...memory.pastDeckIds, pastDeckId])]
        : memory.pastDeckIds;
      const mergedNotes =
        notes && notes.length > 0
          ? [...memory.notes, ...notes]
          : memory.notes;
      memory = await memoryStore.save(session.seekerId, {
        notes: mergedNotes,
        pastDeckIds,
      });
      return memory;
    },

    async refactorMemory(notes: string[]) {
      memory = await memoryStore.refactor(session.seekerId, notes);
      if (session.phase === "refactor") {
        session = transition(session, "ended");
      }
      return memory;
    },

    endWithoutRitual() {
      if (session.phase === "intake" || session.phase === "offerDeck") {
        session = transition(session, "ended");
        return;
      }
      throw new Error(`Cannot end without ritual from ${session.phase}`);
    },
  };

  return runtime;
}
