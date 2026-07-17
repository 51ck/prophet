export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Orientation = "upright" | "reversed";

export type CardDef = {
  id: string;
  name: string;
  arcana: Arcana;
  suit?: Suit;
};

/** Card in play — identity from deck definition + ritual orientation/face. */
export type CardInstance = {
  defId: string;
  orientation: Orientation;
  faceUp: boolean;
};

/** Named spread layout vs free placement on the desk. */
export type DeskSlotKind = "spread" | "free";

/** One place on the desk — may be empty or hold a card. */
export type DeskSlot = {
  id: string;
  role: string;
  kind: DeskSlotKind;
  card: CardInstance | null;
};

/** @deprecated Prefer DeskSlot — same shape. */
export type TablePosition = DeskSlot;

export type DeckState = {
  deckId: string;
  /** Top of array = top of pile (next draw). */
  pile: CardInstance[];
  /** Cards in play: named spread slots and/or free placements. */
  desk: DeskSlot[];
};

/**
 * First-class pile position for draw/insert.
 * Index 0 = top; last index = bottom for draw; insert at `bottom` appends.
 */
export type PileAddress =
  | { kind: "top" }
  | { kind: "bottom" }
  | { kind: "index"; index: number };

export type ShuffleOp =
  | { type: "mix" }
  | { type: "cut"; at?: number }
  | { type: "shift"; from: number; count: number; to: number }
  | { type: "rotate"; count?: number }
  | { type: "seekerCut"; at: number };

export type SpreadDef = {
  id: string;
  name: string;
  positions: { id: string; role: string }[];
};
