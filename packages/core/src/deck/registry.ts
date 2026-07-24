import type { CardDef } from "../ritual/types.ts";
import { LIGHT_SEERS_CARDS, LIGHT_SEERS_DECK_ID } from "./light-seers.ts";
import { RIDER_WAITE_CARDS, RIDER_WAITE_DECK_ID } from "./rider-waite.ts";

/** Catalog ids registered T10.2 — confirmDeck accepts only these. */
export const CATALOG_DECK_IDS = ["light-seers", "rider-waite"] as const;

export type CatalogDeckId = (typeof CATALOG_DECK_IDS)[number];

export const DECKS: Record<CatalogDeckId, readonly CardDef[]> = {
  [LIGHT_SEERS_DECK_ID]: LIGHT_SEERS_CARDS,
  [RIDER_WAITE_DECK_ID]: RIDER_WAITE_CARDS,
};
