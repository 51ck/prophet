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

export type TablePosition = {
  id: string;
  role: string;
  card: CardInstance | null;
};

export type DeckState = {
  deckId: string;
  /** Top of array = top of pile (next draw). */
  pile: CardInstance[];
  table: TablePosition[];
};

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
