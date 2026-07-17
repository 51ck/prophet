import type { SeekerLanguage } from "../memory/store.ts";

/** True when preferred name and/or self notes still need introduce. */
export function needsNameSelf(profile: {
  preferredName?: string;
  selfNotes?: string;
}): boolean {
  const name = profile.preferredName?.trim();
  const notes = profile.selfNotes?.trim();
  return !name || !notes;
}

/** Free-prose introduce ask after language is known (T3.12). */
export function nameSelfAsk(language: SeekerLanguage): string {
  if (language === "ru") {
    return "Как тебя зовут, и скажи пару слов о себе — кто ты, что сейчас важно.";
  }
  return "What shall I call you, and a few words about yourself — who you are, what matters now.";
}
