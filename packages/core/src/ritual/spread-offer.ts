import type { SessionPath, SessionPhase } from "../session/session.ts";

/** Catalog ids registered T8.2–T8.5 — beginRitual accepts only these. */
export const CATALOG_SPREAD_IDS = [
  "card-of-day",
  "single-focus",
  "yes-no",
  "two-poles",
  "past-present-future",
  "thoughts-feelings-actions",
  "three-roads",
  "relationship",
  "work-finance",
  "choice",
  "celtic-cross",
  "twelve-houses",
] as const;

export type CatalogSpreadId = (typeof CATALOG_SPREAD_IDS)[number];

/** Named spread select / beginRitual only in committed (before ritual layout applied). */
export function canSelectSpread(phase: SessionPhase): boolean {
  return phase === "committed";
}

export function assertCanSelectSpread(phase: SessionPhase): void {
  if (phase === "ritual") {
    throw new Error(
      "Spread already applied in ritual; continue with shuffle/draw/open — do not beginRitual again",
    );
  }
  if (!canSelectSpread(phase)) {
    throw new Error(
      `Cannot select spread in phase ${phase}; wait until Commit (question + deck locked)`,
    );
  }
}

/**
 * T9.3 / T9.4 / T8.7: day-card path → card-of-day only;
 * question path and unset (product: unset ≈ question) never get card-of-day.
 */
export function assertSpreadForSessionPath(
  spreadId: string,
  sessionPath: SessionPath | null,
): void {
  if (sessionPath === "day-card") {
    if (spreadId !== "card-of-day") {
      throw new Error(
        `Day-card path requires spread "card-of-day", got "${spreadId}"`,
      );
    }
    return;
  }
  if (spreadId === "card-of-day") {
    throw new Error(
      'Spread "card-of-day" only allowed when sessionPath is day-card',
    );
  }
}

/**
 * Phase-aware offer guidance for Pythia instructions.
 * Committed line is path-specific (T9.3 / T9.4); unset ≈ question for spread choice.
 */
export function spreadOfferStatusLine(
  phase: SessionPhase,
  sessionPath: SessionPath | null = null,
): string {
  if (phase === "committed") {
    if (sessionPath === "day-card") {
      return `Session phase: committed. Commit done — beginRitual with card-of-day only now.`;
    }
    // question or unset (T9.4): matched catalog, never card-of-day
    return `Session phase: committed. Commit done — beginRitual with a matched catalog spread now (not card-of-day; prefer fewer; lean three-roads unless another fits).`;
  }
  if (phase === "ritual") {
    return `Session phase: ritual. Spread already applied — do not beginRitual again (selectSpread would replace the desk). Continue with shuffle/draw/open as needed.`;
  }
  return `Session phase: ${phase}. Do not beginRitual or select a named spread before Commit (question + deck locked).`;
}
