import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "../deck/light-seers.ts";
import type {
  MemoryStore,
  SeekerLanguage,
  SeekerMemory,
} from "../memory/store.ts";
import {
  CARD_OF_DAY,
  CELTIC_CROSS,
  CHOICE,
  PAST_PRESENT_FUTURE,
  RELATIONSHIP,
  SINGLE_FOCUS,
  THREE_ROADS,
  THOUGHTS_FEELINGS_ACTIONS,
  TWELVE_HOUSES,
  TWO_POLES,
  WORK_FINANCE,
  YES_NO,
  applyShuffleOps,
  createDeckState,
  getDeckSnapshot,
  openPosition,
  placeOnDesk,
  returnToPile,
  rotateDeskCard,
  selectSpread,
} from "../ritual/engine.ts";
import {
  assertCanSelectSpread,
  assertSpreadForSessionPath,
} from "../ritual/spread-offer.ts";
import type {
  DeckState,
  PileAddress,
  ShuffleOp,
  SpreadDef,
} from "../ritual/types.ts";
import {
  confirmDeck,
  createSession,
  lockQuestion,
  setSessionPath,
  transition,
  type ReadingSession,
  type SessionPath,
} from "../session/session.ts";

const spreads: Record<string, SpreadDef> = {
  [CARD_OF_DAY.id]: CARD_OF_DAY,
  [SINGLE_FOCUS.id]: SINGLE_FOCUS,
  [YES_NO.id]: YES_NO,
  [TWO_POLES.id]: TWO_POLES,
  [PAST_PRESENT_FUTURE.id]: PAST_PRESENT_FUTURE,
  [THOUGHTS_FEELINGS_ACTIONS.id]: THOUGHTS_FEELINGS_ACTIONS,
  [THREE_ROADS.id]: THREE_ROADS,
  [RELATIONSHIP.id]: RELATIONSHIP,
  [WORK_FINANCE.id]: WORK_FINANCE,
  [CHOICE.id]: CHOICE,
  [CELTIC_CROSS.id]: CELTIC_CROSS,
  [TWELVE_HOUSES.id]: TWELVE_HOUSES,
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
  /** Persist day-card vs question path after presence (T9.2). */
  setSessionPath(path: SessionPath): void;
  lockQuestion(question: string): void;
  confirmDeck(deckId: string): void;
  beginRitual(spreadId?: string): void;
  shuffle(ops: ShuffleOp[]): void;
  /**
   * Fill empty desk slots from pile top by composing placeOnDesk
   * (same free verbs as engine T5.6 — not a drawToPositions bypass).
   */
  draw(): void;
  /** Place one card from pile address onto a desk slot (face-down). */
  place(
    slotId: string,
    address?: PileAddress,
    role?: string,
  ): ReturnType<typeof getDeckSnapshot>;
  /** Return one desk card to the pile at address. */
  returnCard(
    slotId: string,
    address?: PileAddress,
  ): ReturnType<typeof getDeckSnapshot>;
  /** Flip orientation on one desk card. */
  rotate(slotId: string): ReturnType<typeof getDeckSnapshot>;
  /** Reveal (open) a face-down desk card. */
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

  /** Desk/pile mutators only after beginRitual — avoids lost cards when selectSpread replaces desk. */
  const requireRitualDeck = (verb: string): DeckState => {
    if (!deck) throw new Error("Deck not ready");
    if (session.phase !== "ritual") {
      throw new Error(`${verb} only in ritual, got ${session.phase}`);
    }
    return deck;
  };

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

    setSessionPath(path: SessionPath) {
      session = setSessionPath(session, path);
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

    beginRitual(spreadId?: string) {
      if (!deck) throw new Error("Deck not confirmed");
      assertCanSelectSpread(session.phase);
      const id =
        spreadId ??
        (session.sessionPath === "day-card" ? CARD_OF_DAY.id : THREE_ROADS.id);
      assertSpreadForSessionPath(id, session.sessionPath);
      const spread = spreads[id];
      if (!spread) throw new Error(`Unknown spread "${id}"`);
      session = { ...session, spreadId: spread.id };
      if (session.phase === "committed") {
        session = transition(session, "ritual");
      }
      deck = selectSpread(deck, spread);
    },

    shuffle(ops: ShuffleOp[]) {
      deck = applyShuffleOps(requireRitualDeck("Shuffle"), ops);
    },

    draw() {
      // Compose place into each empty slot (T7.4 / T5.6) — same as drawToPositions.
      let next = requireRitualDeck("Draw");
      const emptyIds = next.desk
        .filter((s) => s.card === null)
        .map((s) => s.id);
      for (const id of emptyIds) {
        if (next.pile.length === 0) break;
        next = placeOnDesk(next, id);
      }
      deck = next;
    },

    place(slotId, address = { kind: "top" }, role = "free") {
      deck = placeOnDesk(requireRitualDeck("Place"), slotId, address, role);
      return getDeckSnapshot(deck);
    },

    returnCard(slotId, address = { kind: "top" }) {
      deck = returnToPile(requireRitualDeck("Return"), slotId, address);
      return getDeckSnapshot(deck);
    },

    rotate(slotId) {
      deck = rotateDeskCard(requireRitualDeck("Rotate"), slotId);
      return getDeckSnapshot(deck);
    },

    open(positionId: string) {
      deck = openPosition(requireRitualDeck("Open"), positionId);
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
