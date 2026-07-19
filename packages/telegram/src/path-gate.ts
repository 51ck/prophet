import {
  createPathAsk,
  isPathAsk,
  isPathAskPrompt,
  parseSessionPath,
  pathAskPrompt,
  type AskWithOptions,
  type SeekerLanguage,
  type SessionPath,
} from "@prophet/core";

export { pathAskPrompt };

/** Build the session-path ask (T1 chrome). */
export function pathAsk(language: SeekerLanguage): AskWithOptions {
  return createPathAsk(language);
}

/** Resolve a seeker reply into day-card | question when choosing a path. */
export function resolvePathChoice(text: string): SessionPath | undefined {
  return parseSessionPath(text);
}

export type PathGateDecision =
  | { action: "accept"; path: SessionPath }
  /** Free text (or unclear) while path pending / already offered — continue; no force-retry. */
  | { action: "continue" }
  /** Present and path unset — offer buttons. */
  | { action: "offer" };

/**
 * Decide path gate after presence (language + name/self ready).
 * Unlike language: invalid/free text continues — never restore/force-retry.
 * Non-path pending ask → continue (never accept/offer path that turn).
 * Typed path labels only accept after presenceSpoken or while answering a path offer.
 */
export function decidePathGate(input: {
  turnText: string;
  pendingAsk?: AskWithOptions;
  alreadyPromptedInHistory: boolean;
  sessionPath: SessionPath | null;
  present: boolean;
  presenceSpoken: boolean;
}): PathGateDecision {
  if (input.sessionPath || !input.present) return { action: "continue" };
  // Non-path pending ask: never accept/offer path this turn — embedded path
  // phrases must not skip the agent turn for another closed ask.
  if (input.pendingAsk !== undefined && !isPathAsk(input.pendingAsk)) {
    return { action: "continue" };
  }
  const path = resolvePathChoice(input.turnText);
  const answeringPathAsk =
    input.pendingAsk !== undefined || input.alreadyPromptedInHistory;
  if (path && (input.presenceSpoken || answeringPathAsk)) {
    return { action: "accept", path };
  }
  // Path pending (or free text after offer): continue — never force-retry.
  if (input.pendingAsk) return { action: "continue" };
  if (input.alreadyPromptedInHistory) return { action: "continue" };
  if (!input.presenceSpoken) return { action: "continue" };
  return { action: "offer" };
}

export function pathPromptAlreadyInHistory(
  history: ReadonlyArray<{ role: string; content: string }>,
): boolean {
  return history.some(
    (m) => m.role === "assistant" && isPathAskPrompt(m.content),
  );
}

/**
 * Path ask only after a real presence/[new] turn this session.
 * Name/self-ready alone is not enough (T9.2).
 */
export function canOfferPathAsk(input: {
  presenceSpoken: boolean;
  sessionPath: SessionPath | null;
  needsNameSelf: boolean;
  pathPromptInHistory: boolean;
  /** Agent (or prior offer) already left a path ask pending — do not duplicate. */
  pendingIsPathAsk?: boolean;
}): boolean {
  return (
    input.presenceSpoken &&
    !input.sessionPath &&
    !input.needsNameSelf &&
    !input.pathPromptInHistory &&
    !input.pendingIsPathAsk
  );
}

/**
 * Cold open / first text this session: run presence then path,
 * instead of a plain agent turn + mid-turn path ask.
 */
export function shouldSpeakPresenceThenPath(input: {
  presenceSpoken: boolean;
  sessionPath: SessionPath | null;
  needsNameSelf: boolean;
  pathPromptInHistory: boolean;
}): boolean {
  if (
    input.needsNameSelf ||
    input.sessionPath ||
    input.presenceSpoken ||
    input.pathPromptInHistory
  ) {
    return false;
  }
  return true;
}
