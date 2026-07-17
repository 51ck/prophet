import type {
  CardDef,
  CardInstance,
  DeckState,
  DeskSlot,
  Orientation,
  ShuffleOp,
  SpreadDef,
} from "./types.ts";

function cloneState(state: DeckState): DeckState {
  return {
    deckId: state.deckId,
    pile: state.pile.map((c) => ({ ...c })),
    desk: state.desk.map((p) => ({
      id: p.id,
      role: p.role,
      kind: p.kind,
      card: p.card ? { ...p.card } : null,
    })),
  };
}

export function createDeckState(
  deckId: string,
  cards: readonly CardDef[],
): DeckState {
  const pile: CardInstance[] = cards.map((c) => ({
    defId: c.id,
    orientation: "upright" as Orientation,
    faceUp: false,
  }));
  return { deckId, pile, desk: [] };
}

/** Fisher–Yates mix; optional RNG for tests. */
export function mixPile(
  pile: CardInstance[],
  random: () => number = Math.random,
): CardInstance[] {
  const next = pile.map((c) => ({ ...c }));
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

function clampIndex(at: number, len: number): number {
  if (len <= 0) return 0;
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.min(len, Math.floor(at)));
}

export function applyShuffleOp(
  state: DeckState,
  op: ShuffleOp,
  random: () => number = Math.random,
): DeckState {
  const next = cloneState(state);
  switch (op.type) {
    case "mix": {
      next.pile = mixPile(next.pile, random);
      return next;
    }
    case "cut":
    case "seekerCut": {
      const at =
        op.type === "seekerCut"
          ? clampIndex(op.at * next.pile.length, next.pile.length)
          : clampIndex(
              op.at ?? Math.floor(random() * next.pile.length),
              next.pile.length,
            );
      next.pile = [...next.pile.slice(at), ...next.pile.slice(0, at)];
      return next;
    }
    case "shift": {
      const { from, count, to } = op;
      if (count <= 0 || from < 0 || from >= next.pile.length) return next;
      const block = next.pile.splice(from, count);
      const insertAt = clampIndex(to, next.pile.length);
      next.pile.splice(insertAt, 0, ...block);
      return next;
    }
    case "rotate": {
      const n = op.count ?? next.pile.length;
      const take = Math.min(n, next.pile.length);
      for (let i = 0; i < take; i++) {
        const card = next.pile[i];
        if (!card) continue;
        card.orientation =
          card.orientation === "upright" ? "reversed" : "upright";
      }
      return next;
    }
    default: {
      const _exhaustive: never = op;
      return _exhaustive;
    }
  }
}

export function applyShuffleOps(
  state: DeckState,
  ops: ShuffleOp[],
  random: () => number = Math.random,
): DeckState {
  return ops.reduce((s, op) => applyShuffleOp(s, op, random), state);
}

export const THREE_ROADS: SpreadDef = {
  id: "three-roads",
  name: "Three Roads",
  positions: [
    { id: "situation", role: "Situation — how the matter sits now" },
    { id: "counsel", role: "Counsel — what to hold or do" },
    { id: "path", role: "Path — unfolding to watch" },
  ],
};

export const SINGLE_FOCUS: SpreadDef = {
  id: "single-focus",
  name: "Single Focus",
  positions: [{ id: "focus", role: "Focus — the hinge of the question" }],
};

/** Named spread replaces the desk layout (spread-kind empty slots). */
export function selectSpread(state: DeckState, spread: SpreadDef): DeckState {
  const next = cloneState(state);
  next.desk = spread.positions.map(
    (p): DeskSlot => ({
      id: p.id,
      role: p.role,
      kind: "spread",
      card: null,
    }),
  );
  return next;
}

/**
 * Add an empty free placement on the desk (no named spread required).
 * Does not touch the pile. Fails if id already exists.
 */
export function addFreeSlot(
  state: DeckState,
  id: string,
  role = "free",
): DeckState {
  const next = cloneState(state);
  if (next.desk.some((s) => s.id === id)) {
    throw new Error(`Desk already has slot "${id}"`);
  }
  next.desk.push({ id, role, kind: "free", card: null });
  return next;
}

/** Draw from top of pile into empty desk slots in order. */
export function drawToPositions(state: DeckState): DeckState {
  const next = cloneState(state);
  for (const pos of next.desk) {
    if (pos.card !== null) continue;
    const card = next.pile.shift();
    if (!card) break;
    pos.card = { ...card, faceUp: false };
  }
  return next;
}

export function openPosition(state: DeckState, positionId: string): DeckState {
  const next = cloneState(state);
  const pos = next.desk.find((p) => p.id === positionId);
  if (!pos?.card) {
    throw new Error(`No card at position "${positionId}"`);
  }
  pos.card = { ...pos.card, faceUp: true };
  return next;
}

export function getDeckSnapshot(state: DeckState): {
  deckId: string;
  pileCount: number;
  desk: {
    id: string;
    role: string;
    kind: DeskSlot["kind"];
    faceUp: boolean;
    defId: string | null;
    orientation: Orientation | null;
  }[];
} {
  return {
    deckId: state.deckId,
    pileCount: state.pile.length,
    desk: state.desk.map((p) => ({
      id: p.id,
      role: p.role,
      kind: p.kind,
      faceUp: p.card?.faceUp ?? false,
      defId: p.card?.faceUp ? (p.card.defId ?? null) : null,
      orientation: p.card?.faceUp ? (p.card.orientation ?? null) : null,
    })),
  };
}

/** Inspect face-down identity — for tests / trusted ritual path only. */
export function peekDesk(state: DeckState): DeskSlot[] {
  return cloneState(state).desk;
}

/** @deprecated Prefer peekDesk */
export const peekTable = peekDesk;
