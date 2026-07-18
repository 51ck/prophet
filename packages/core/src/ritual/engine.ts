import type {
  CardDef,
  CardInstance,
  DeckState,
  DeskSlot,
  Orientation,
  PileAddress,
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
      // seekerCut.at is a depth fraction [0,1]; cut.at is a pile index.
      const at =
        op.type === "seekerCut"
          ? clampIndex(
              Math.max(0, Math.min(1, op.at)) * next.pile.length,
              next.pile.length,
            )
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
      const from = Math.max(0, op.from ?? 0);
      if (from >= next.pile.length) return next;
      const n = op.count ?? next.pile.length - from;
      const end = Math.min(from + Math.max(0, n), next.pile.length);
      for (let i = from; i < end; i++) {
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

export const CARD_OF_DAY: SpreadDef = {
  id: "card-of-day",
  name: "Card of the Day",
  positions: [
    { id: "focus", role: "Focus — daily atmosphere or one piece of counsel" },
  ],
};

export const SINGLE_FOCUS: SpreadDef = {
  id: "single-focus",
  name: "Single Focus",
  positions: [{ id: "focus", role: "Focus — the hinge of the question" }],
};

export const YES_NO: SpreadDef = {
  id: "yes-no",
  name: "Yes / No",
  positions: [
    { id: "answer", role: "Answer — the direct yes/no lean" },
    { id: "nuance", role: "Nuance — what colors or complicates the answer" },
    { id: "advice", role: "Advice — what to hold or do with it" },
  ],
};

export const TWO_POLES: SpreadDef = {
  id: "two-poles",
  name: "Two Poles",
  positions: [
    { id: "pole-a", role: "Pole A — one side of the either/or" },
    { id: "pole-b", role: "Pole B — the other side" },
  ],
};

export const PAST_PRESENT_FUTURE: SpreadDef = {
  id: "past-present-future",
  name: "Past — Present — Future",
  positions: [
    { id: "past", role: "Past — what led here" },
    { id: "present", role: "Present — how it sits now" },
    { id: "future", role: "Future — unfolding to watch" },
  ],
};

export const THOUGHTS_FEELINGS_ACTIONS: SpreadDef = {
  id: "thoughts-feelings-actions",
  name: "Thoughts — Feelings — Actions",
  positions: [
    { id: "thoughts", role: "Thoughts — mind / what is held" },
    { id: "feelings", role: "Feelings — heart / what is felt" },
    { id: "actions", role: "Actions — behavior / what is done" },
  ],
};

export const THREE_ROADS: SpreadDef = {
  id: "three-roads",
  name: "Three Roads",
  positions: [
    { id: "situation", role: "Situation — how the matter sits now" },
    { id: "counsel", role: "Counsel — what to hold or do" },
    { id: "path", role: "Path — unfolding to watch" },
  ],
};

export const RELATIONSHIP: SpreadDef = {
  id: "relationship",
  name: "Relationship",
  positions: [
    { id: "self-thoughts", role: "Seeker — thoughts about the bond" },
    { id: "self-feelings", role: "Seeker — feelings" },
    { id: "self-actions", role: "Seeker — behavior / what they do" },
    { id: "other-thoughts", role: "Other — thoughts" },
    { id: "other-feelings", role: "Other — feelings" },
    { id: "other-actions", role: "Other — behavior" },
    { id: "outlook", role: "Outlook — where the union is headed" },
  ],
};

export const WORK_FINANCE: SpreadDef = {
  id: "work-finance",
  name: "Work & Finances",
  positions: [
    { id: "situation", role: "Current work/money situation" },
    { id: "strength", role: "Strength or resource to lean on" },
    { id: "obstacle", role: "Obstacle or risk" },
    { id: "opportunity", role: "Opportunity or growth" },
    { id: "money", role: "Money / material thread" },
    { id: "counsel", role: "Counsel — what to do next" },
  ],
};

export const CHOICE: SpreadDef = {
  id: "choice",
  name: "Choice",
  positions: [
    { id: "hinge", role: "The choice itself — what is at stake" },
    { id: "path-a-near", role: "Path A — near consequence" },
    { id: "path-a-far", role: "Path A — farther unfolding" },
    { id: "path-b-near", role: "Path B — near consequence" },
    { id: "path-b-far", role: "Path B — farther unfolding" },
    { id: "hidden", role: "What is easy to miss" },
    { id: "counsel", role: "Counsel — how to choose" },
  ],
};

export const CELTIC_CROSS: SpreadDef = {
  id: "celtic-cross",
  name: "Celtic Cross",
  positions: [
    { id: "present", role: "Heart of the matter — present" },
    { id: "cross", role: "Crossing influence — challenge or catalyst" },
    { id: "foundation", role: "Foundation — root / basis" },
    { id: "recent-past", role: "Recent past — what is fading" },
    { id: "crown", role: "Crown — possible best / conscious aim" },
    { id: "near-future", role: "Near future — what approaches" },
    { id: "self", role: "Self — how the seeker stands in this" },
    { id: "environment", role: "Environment — others / setting" },
    { id: "hopes-fears", role: "Hopes and fears" },
    { id: "outcome", role: "Outcome — most likely resolution if the path continues" },
  ],
};

export const TWELVE_HOUSES: SpreadDef = {
  id: "twelve-houses",
  name: "Twelve Houses",
  positions: [
    { id: "house-1", role: "Self / vitality" },
    { id: "house-2", role: "Money / resources" },
    { id: "house-3", role: "Mind / communication / siblings" },
    { id: "house-4", role: "Home / roots / family" },
    { id: "house-5", role: "Pleasure / romance / creation" },
    { id: "house-6", role: "Work / health / daily duty" },
    { id: "house-7", role: "Partnerships" },
    { id: "house-8", role: "Shared resources / deep change" },
    { id: "house-9", role: "Belief / travel / learning" },
    { id: "house-10", role: "Career / public standing" },
    { id: "house-11", role: "Friends / community / hopes" },
    { id: "house-12", role: "Hidden / rest / release" },
  ],
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

/**
 * Resolve where to remove a card. Index 0 = top.
 * Throws if pile empty or index out of range.
 */
export function resolvePileDrawIndex(
  address: PileAddress,
  pileLength: number,
): number {
  if (pileLength <= 0) {
    throw new Error("Cannot draw from empty pile");
  }
  switch (address.kind) {
    case "top":
      return 0;
    case "bottom":
      return pileLength - 1;
    case "index": {
      const i = Math.floor(address.index);
      if (!Number.isFinite(i) || i < 0 || i >= pileLength) {
        throw new Error(
          `Pile draw index ${address.index} out of range for length ${pileLength}`,
        );
      }
      return i;
    }
    default: {
      const _exhaustive: never = address;
      return _exhaustive;
    }
  }
}

/**
 * Resolve where to insert a card. Index 0 = top; `bottom` = append (length).
 * Throws if index out of range `[0, pileLength]`.
 */
export function resolvePileInsertIndex(
  address: PileAddress,
  pileLength: number,
): number {
  switch (address.kind) {
    case "top":
      return 0;
    case "bottom":
      return pileLength;
    case "index": {
      const i = Math.floor(address.index);
      if (!Number.isFinite(i) || i < 0 || i > pileLength) {
        throw new Error(
          `Pile insert index ${address.index} out of range for length ${pileLength}`,
        );
      }
      return i;
    }
    default: {
      const _exhaustive: never = address;
      return _exhaustive;
    }
  }
}

/**
 * Remove one card from the pile at address. Does not touch desk.
 * Default address is top (same as physical draw).
 */
export function drawFromPile(
  state: DeckState,
  address: PileAddress = { kind: "top" },
): { state: DeckState; card: CardInstance } {
  const next = cloneState(state);
  const i = resolvePileDrawIndex(address, next.pile.length);
  const card = next.pile.splice(i, 1)[0];
  if (!card) {
    throw new Error("Cannot draw from empty pile");
  }
  return { state: next, card };
}

/**
 * Insert a card into the pile at address. Does not touch desk.
 * Default address is top.
 */
export function insertIntoPile(
  state: DeckState,
  card: CardInstance,
  address: PileAddress = { kind: "top" },
): DeckState {
  const next = cloneState(state);
  const i = resolvePileInsertIndex(address, next.pile.length);
  next.pile.splice(i, 0, { ...card });
  return next;
}

/**
 * Draw one card from the pile (PileAddress) and place it face-down on the desk.
 * Fills an existing empty slot (spread or free), or creates a free slot if id is new.
 * Default address is top. Throws if the slot already holds a card.
 */
export function placeOnDesk(
  state: DeckState,
  slotId: string,
  address: PileAddress = { kind: "top" },
  role = "free",
): DeckState {
  const existing = state.desk.find((s) => s.id === slotId);
  if (existing && existing.card !== null) {
    throw new Error(`Desk slot "${slotId}" already has a card`);
  }

  const { state: drawn, card } = drawFromPile(state, address);
  const next = existing ? drawn : addFreeSlot(drawn, slotId, role);
  const slot = next.desk.find((s) => s.id === slotId);
  if (!slot) {
    throw new Error(`Desk slot "${slotId}" missing after place`);
  }
  slot.card = { ...card, faceUp: false };
  return next;
}

/** Product verb alias: draw = place from pile onto desk face-down. */
export const draw = placeOnDesk;

/**
 * Return one card from a desk slot to the pile at PileAddress.
 * Leaves the desk slot empty (spread or free). Card goes face-down; orientation kept.
 * Default address is top. Throws if the slot is missing or empty.
 */
export function returnToPile(
  state: DeckState,
  slotId: string,
  address: PileAddress = { kind: "top" },
): DeckState {
  const existing = state.desk.find((s) => s.id === slotId);
  if (!existing?.card) {
    throw new Error(`No card at desk slot "${slotId}"`);
  }

  const card: CardInstance = { ...existing.card, faceUp: false };
  const next = cloneState(state);
  const slot = next.desk.find((s) => s.id === slotId);
  if (!slot) {
    throw new Error(`Desk slot "${slotId}" missing after clone`);
  }
  slot.card = null;
  return insertIntoPile(next, card, address);
}

/** Flip orientation on one desk card by slot id. Throws if missing or empty. */
export function rotateDeskCard(state: DeckState, slotId: string): DeckState {
  const existing = state.desk.find((s) => s.id === slotId);
  if (!existing?.card) {
    throw new Error(`No card at desk slot "${slotId}"`);
  }

  const next = cloneState(state);
  const slot = next.desk.find((s) => s.id === slotId);
  if (!slot?.card) {
    throw new Error(`Desk slot "${slotId}" missing after clone`);
  }
  slot.card = {
    ...slot.card,
    orientation:
      slot.card.orientation === "upright" ? "reversed" : "upright",
  };
  return next;
}

/**
 * Fill empty desk slots from pile top, in desk order, by composing placeOnDesk.
 * No bypass: same pile addressing and face-down place as free verbs.
 */
export function drawToPositions(state: DeckState): DeckState {
  const emptyIds = state.desk.filter((s) => s.card === null).map((s) => s.id);
  let next = state;
  for (const id of emptyIds) {
    if (next.pile.length === 0) break;
    next = placeOnDesk(next, id);
  }
  return next;
}

/**
 * Named-spread ritual: selectSpread layout, then place/draw into each empty role.
 * Composes free verbs — does not invent cards.
 */
export function laySpread(state: DeckState, spread: SpreadDef): DeckState {
  return drawToPositions(selectSpread(state, spread));
}

/** Flip a desk card face-up. Keeps defId and orientation; only faceUp changes. */
export function openPosition(state: DeckState, positionId: string): DeckState {
  const existing = state.desk.find((p) => p.id === positionId);
  if (!existing?.card) {
    throw new Error(`No card at desk slot "${positionId}"`);
  }

  const next = cloneState(state);
  const pos = next.desk.find((p) => p.id === positionId);
  if (!pos?.card) {
    throw new Error(`Desk slot "${positionId}" missing after clone`);
  }
  pos.card = { ...pos.card, faceUp: true };
  return next;
}

/** Product verb alias: reveal = open face-down desk card. */
export const reveal = openPosition;

/** Product verb alias: open = openPosition. */
export const open = openPosition;

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
