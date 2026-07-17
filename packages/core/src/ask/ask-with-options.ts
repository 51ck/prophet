import { z } from "zod";

/** Spec T1.1: at most N labeled choices; skip/decline chrome excluded. */
export const MAX_ASK_OPTIONS = 6;
export const MIN_ASK_OPTIONS = 2;

export const ASK_WITH_OPTIONS_KIND = "askWithOptions" as const;

export type AskOption = {
  id: string;
  label: string;
};

/** Channel-agnostic closed ask. Adapter decides chrome (buttons, etc.). */
export type AskWithOptions = {
  kind: typeof ASK_WITH_OPTIONS_KIND;
  options: AskOption[];
  /** When true, adapter may show skip/decline chrome (not counted toward N). */
  allowSkip: boolean;
};

export type AskWithOptionsInput = {
  options: AskOption[];
  allowSkip?: boolean;
};

const askOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const askWithOptionsSchema = z
  .object({
    kind: z.literal(ASK_WITH_OPTIONS_KIND),
    options: z
      .array(askOptionSchema)
      .min(MIN_ASK_OPTIONS)
      .max(MAX_ASK_OPTIONS),
    allowSkip: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const ids = val.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "option ids must be unique",
        path: ["options"],
      });
    }
  });

/** Validate and normalize a closed ask for tools / adapters. */
export function createAskWithOptions(
  input: AskWithOptionsInput,
): AskWithOptions {
  return askWithOptionsSchema.parse({
    kind: ASK_WITH_OPTIONS_KIND,
    options: input.options,
    allowSkip: input.allowSkip ?? false,
  });
}

export function isAskWithOptions(value: unknown): value is AskWithOptions {
  return askWithOptionsSchema.safeParse(value).success;
}
