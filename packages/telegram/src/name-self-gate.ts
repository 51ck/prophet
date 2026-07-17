import {
  nameSelfAsk,
  needsNameSelf,
  type SeekerLanguage,
} from "@prophet/core";

export { nameSelfAsk, needsNameSelf };

/** True when introduce still needs preferredName and/or selfNotes. */
export function profileNeedsNameSelf(profile: {
  preferredName?: string;
  selfNotes?: string;
}): boolean {
  return needsNameSelf(profile);
}

/** Free-prose name + self ask in the seeker's language. */
export function introduceNameSelfAsk(language: SeekerLanguage): string {
  return nameSelfAsk(language);
}
