export type SessionPhase =
  | "idle"
  | "recall"
  | "intake"
  | "offerDeck"
  | "committed"
  | "ritual"
  | "closing"
  | "refactor"
  | "ended";

export type ReadingSession = {
  id: string;
  seekerId: string;
  phase: SessionPhase;
  question: string | null;
  deckId: string | null;
  spreadId: string | null;
  createdAt: string;
  updatedAt: string;
};

const transitions: Record<SessionPhase, SessionPhase[]> = {
  idle: ["recall"],
  recall: ["intake"],
  intake: ["offerDeck", "ended"],
  offerDeck: ["committed", "ended"],
  committed: ["ritual"],
  ritual: ["closing"],
  closing: ["refactor"],
  refactor: ["ended"],
  ended: [],
};

export function createSession(seekerId: string, id: string): ReadingSession {
  const now = new Date().toISOString();
  return {
    id,
    seekerId,
    phase: "idle",
    question: null,
    deckId: null,
    spreadId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function transition(
  session: ReadingSession,
  to: SessionPhase,
): ReadingSession {
  const allowed = transitions[session.phase];
  if (!allowed.includes(to)) {
    throw new Error(`Illegal session transition ${session.phase} → ${to}`);
  }
  return { ...session, phase: to, updatedAt: new Date().toISOString() };
}

export function lockQuestion(
  session: ReadingSession,
  question: string,
): ReadingSession {
  if (session.phase !== "intake" && session.phase !== "offerDeck") {
    throw new Error(`Cannot lock question in phase ${session.phase}`);
  }
  return {
    ...session,
    question: question.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function confirmDeck(
  session: ReadingSession,
  deckId: string,
): ReadingSession {
  if (session.phase !== "offerDeck") {
    throw new Error(`Cannot confirm deck in phase ${session.phase}`);
  }
  if (!session.question) {
    throw new Error("Question must be locked before confirming deck");
  }
  return {
    ...session,
    deckId,
    updatedAt: new Date().toISOString(),
  };
}
