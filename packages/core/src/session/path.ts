import {
  createAskWithOptions,
  type AskWithOptions,
} from "../ask/ask-with-options.ts";
import type { SeekerLanguage } from "../memory/store.ts";
import type { SessionPath } from "./session.ts";

/** Closed path ask prompt in the seeker's language (T9.2). */
export function pathAskPrompt(language: SeekerLanguage): string {
  if (language === "ru") {
    return "Как зайдём — карта дня или найдём вопрос?";
  }
  return "How shall we begin — Card of the Day, or find a question?";
}

/**
 * Short implicit day-counsel lock text (T9.3).
 * Counts as the locked question for Commit — no fake specificity.
 */
export function dayCounselQuestion(language: SeekerLanguage): string {
  if (language === "ru") {
    return "Совет на этот день: атмосфера, фокус или напутствие.";
  }
  return "Counsel for this day: atmosphere, focus, or advice.";
}

/** True when content is a path-ask prompt (either language). */
export function isPathAskPrompt(content: string): boolean {
  return (
    content === pathAskPrompt("ru") || content === pathAskPrompt("en")
  );
}

/** Closed Card of the Day vs find-a-question ask — adapter shows T1 buttons. */
export function createPathAsk(language: SeekerLanguage): AskWithOptions {
  if (language === "ru") {
    return createAskWithOptions({
      options: [
        { id: "day-card", label: "Карта дня" },
        { id: "question", label: "Найти вопрос" },
      ],
    });
  }
  return createAskWithOptions({
    options: [
      { id: "day-card", label: "Card of the Day" },
      { id: "question", label: "Find a question" },
    ],
  });
}

/** True when ask is the Phase 1 session-path pick (no skip). */
export function isPathAsk(ask: AskWithOptions): boolean {
  if (ask.allowSkip || ask.options.length !== 2) return false;
  const ids = new Set(ask.options.map((o) => o.id));
  return ids.has("day-card") && ids.has("question");
}

function normalizePathText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?…]+$/u, "");
}

/** Exact whole-string aliases (includes short forms unsafe for containment). */
const EXACT_DAY_CARD = new Set([
  "day-card",
  "card of the day",
  "card of day",
  "day card",
  "карта дня",
  "карту дня",
  "дневная карта",
]);

const EXACT_QUESTION = new Set([
  "question",
  "find a question",
  "find question",
  "a question",
  "найти вопрос",
  "вопрос",
  "искать вопрос",
  "найдём вопрос",
]);

/**
 * Distinctive phrases safe to match inside free prose (name/self + path).
 * Short ambiguous tokens like "question" / "вопрос" stay exact-only.
 * Longer phrases first so scanning order is stable; last end-index wins.
 */
const EMBEDDED_PATH_PHRASES: ReadonlyArray<{
  phrase: string;
  path: SessionPath;
}> = [
  { phrase: "card of the day", path: "day-card" },
  { phrase: "дневная карта", path: "day-card" },
  { phrase: "find a question", path: "question" },
  { phrase: "найдём вопрос", path: "question" },
  { phrase: "найти вопрос", path: "question" },
  { phrase: "искать вопрос", path: "question" },
  { phrase: "card of day", path: "day-card" },
  { phrase: "day card", path: "day-card" },
  { phrase: "карта дня", path: "day-card" },
  { phrase: "карту дня", path: "day-card" },
  { phrase: "find question", path: "question" },
  { phrase: "day-card", path: "day-card" },
];

function isLetterOrDigit(ch: string | undefined): boolean {
  if (!ch) return false;
  return /\p{L}|\p{N}/u.test(ch);
}

/**
 * Last embedded distinctive path label in normalized prose, or undefined.
 * Word-ish bounds avoid matching inside longer tokens.
 */
function lastEmbeddedPath(normalized: string): SessionPath | undefined {
  let bestEnd = -1;
  let bestPath: SessionPath | undefined;
  let bestLen = -1;
  for (const { phrase, path } of EMBEDDED_PATH_PHRASES) {
    let from = 0;
    while (from <= normalized.length - phrase.length) {
      const idx = normalized.indexOf(phrase, from);
      if (idx === -1) break;
      const before = normalized[idx - 1];
      const after = normalized[idx + phrase.length];
      if (!isLetterOrDigit(before) && !isLetterOrDigit(after)) {
        const end = idx + phrase.length;
        // Last match wins; equal end → longer phrase (more specific).
        if (
          end > bestEnd ||
          (end === bestEnd && phrase.length > bestLen)
        ) {
          bestEnd = end;
          bestPath = path;
          bestLen = phrase.length;
        }
      }
      from = idx + 1;
    }
  }
  return bestPath;
}

/** Map button label, id, typed reply, or embedded path label → session path. */
export function parseSessionPath(text: string): SessionPath | undefined {
  const t = normalizePathText(text);
  if (EXACT_DAY_CARD.has(t)) return "day-card";
  if (EXACT_QUESTION.has(t)) return "question";
  return lastEmbeddedPath(t);
}
