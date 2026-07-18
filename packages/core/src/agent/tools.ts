import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  MAX_ASK_OPTIONS,
  MIN_ASK_OPTIONS,
  createAskWithOptions,
} from "../ask/ask-with-options.ts";
import type { ReadingRuntime } from "../runtime/reading-runtime.ts";
import type { PileAddress, ShuffleOp } from "../ritual/types.ts";

const shuffleOpSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("mix") }),
  z.object({ type: z.literal("cut"), at: z.number().optional() }),
  z.object({
    type: z.literal("shift"),
    from: z.number().int().nonnegative(),
    count: z.number().int().positive(),
    to: z.number().int().nonnegative(),
  }),
  z.object({ type: z.literal("rotate"), count: z.number().int().positive().optional() }),
  z.object({ type: z.literal("seekerCut"), at: z.number().min(0).max(1) }),
]);

/** Pile address for draw/return. Default top when omitted at call sites. */
const pileAddressSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("top") }),
  z.object({ kind: z.literal("bottom") }),
  z.object({
    kind: z.literal("index"),
    index: z.number().int().nonnegative(),
  }),
]);

const defaultPileAddress = { kind: "top" as const };

/**
 * Prophet-facing deck view only — never raw DeckState / peek.
 * Face-down slots keep defId + orientation hidden (T6.3 / T7.2).
 */
function secrecySafeSnapshot(runtime: ReadingRuntime) {
  return runtime.snapshot();
}

/** Current-seeker profile only — no seekerId selector. */
export const readSeekerProfileInputSchema = z.object({});

/** Current-seeker profile only — no seekerId selector. */
export const updateSeekerProfileInputSchema = z.object({
  language: z.enum(["ru", "en"]).optional(),
  preferredName: z.string().optional(),
  selfNotes: z.string().optional(),
});

export function createPythiaTools(runtime: ReadingRuntime) {
  const lockQuestion = createTool({
    id: "lockQuestion",
    description:
      "Lock the seeker's proper question after intake. Moves session to deck offer.",
    inputSchema: z.object({
      question: z.string().min(1),
    }),
    execute: async ({ question }) => {
      runtime.lockQuestion(question);
      return {
        phase: runtime.session.phase,
        question: runtime.session.question,
        pastDeckIds: runtime.memory.pastDeckIds,
      };
    },
  });

  const confirmDeck = createTool({
    id: "confirmDeck",
    description:
      "Confirm the offered deck after the question is locked. Phase 1: light-seers only.",
    inputSchema: z.object({
      deckId: z.string().default("light-seers"),
    }),
    execute: async ({ deckId }) => {
      runtime.confirmDeck(deckId);
      return { phase: runtime.session.phase, deckId: runtime.session.deckId };
    },
  });

  const beginRitual = createTool({
    id: "beginRitual",
    description: "Enter ritual with a spread (default three-roads).",
    inputSchema: z.object({
      spreadId: z.string().default("three-roads"),
    }),
    execute: async ({ spreadId }) => {
      runtime.beginRitual(spreadId);
      return {
        phase: runtime.session.phase,
        spreadId: runtime.session.spreadId,
        snapshot: secrecySafeSnapshot(runtime),
      };
    },
  });

  const shuffle = createTool({
    id: "shuffle",
    description:
      "Apply honest shuffle ops (mix, cut, shift, rotate, seekerCut). Changes real deck order/orientation.",
    inputSchema: z.object({
      ops: z.array(shuffleOpSchema).min(1),
    }),
    execute: async ({ ops }) => {
      runtime.shuffle(ops as ShuffleOp[]);
      return { snapshot: secrecySafeSnapshot(runtime) };
    },
  });

  const draw = createTool({
    id: "draw",
    description:
      "Place one card from the pile onto a desk slot face-down (top / bottom / index). Creates a free slot if id is new.",
    inputSchema: z.object({
      slotId: z.string().min(1),
      address: pileAddressSchema.optional(),
      role: z.string().optional(),
    }),
    execute: async ({ slotId, address, role }) => {
      // place/return/rotate/open already return getDeckSnapshot (secrecy-safe).
      const snapshot = runtime.place(
        slotId,
        (address ?? defaultPileAddress) as PileAddress,
        role,
      );
      return { snapshot };
    },
  });

  const drawToPositions = createTool({
    id: "drawToPositions",
    description:
      "Fill all empty desk slots from pile top face-down (composes draw/place). Convenience for named spreads.",
    inputSchema: z.object({}),
    execute: async () => {
      runtime.draw();
      return { snapshot: secrecySafeSnapshot(runtime) };
    },
  });

  const returnToPile = createTool({
    id: "returnToPile",
    description:
      "Return one desk card to the pile (top / bottom / index). Slot left empty; card face-down.",
    inputSchema: z.object({
      slotId: z.string().min(1),
      address: pileAddressSchema.optional(),
    }),
    execute: async ({ slotId, address }) => {
      const snapshot = runtime.returnCard(
        slotId,
        (address ?? defaultPileAddress) as PileAddress,
      );
      return { snapshot };
    },
  });

  const rotate = createTool({
    id: "rotate",
    description:
      "Flip orientation (upright ↔ reversed) on one desk card. Pile-segment rotate is a shuffle op.",
    inputSchema: z.object({
      slotId: z.string().min(1),
    }),
    execute: async ({ slotId }) => {
      const snapshot = runtime.rotate(slotId);
      return { snapshot };
    },
  });

  const openPosition = createTool({
    id: "openPosition",
    description:
      "Reveal (open) a face-down card at a desk slot. Identity stays hidden until this call.",
    inputSchema: z.object({
      positionId: z.string(),
    }),
    execute: async ({ positionId }) => {
      const snapshot = runtime.open(positionId);
      return { snapshot };
    },
  });

  const getDeckSnapshot = createTool({
    id: "getDeckSnapshot",
    description:
      "Inspect desk: face-up cards show identity; face-down hide identity. Never peeks face-down defId.",
    inputSchema: z.object({}),
    execute: async () => secrecySafeSnapshot(runtime),
  });

  const recallSeekerMemory = createTool({
    id: "recallSeekerMemory",
    description: "Return recalled seeker memory for fluent use.",
    inputSchema: z.object({}),
    execute: async () => runtime.memory,
  });

  const readSeekerProfile = createTool({
    id: "readSeekerProfile",
    description:
      "Read soft profile (language, preferred name, self notes) for the current seeker only. Never imply access to another seeker.",
    inputSchema: readSeekerProfileInputSchema,
    execute: async () => runtime.readProfile(),
  });

  const updateSeekerProfile = createTool({
    id: "updateSeekerProfile",
    description:
      "Silently update soft profile for the current seeker only (language, preferredName, selfNotes). Call when they share name/self, or when you judge they want to change language (ru|en) — never narrate saving, forms, CRM, or dossiers. Language change: you decide intent from their words; persist and speak the new language; do not re-ask introduce. No other seeker can be selected or compared.",
    inputSchema: updateSeekerProfileInputSchema,
    execute: async ({ language, preferredName, selfNotes }) =>
      runtime.updateProfile({ language, preferredName, selfNotes }),
  });

  const saveSeekerMemory = createTool({
    id: "saveSeekerMemory",
    description: "Append stable notes and optional past deck id.",
    inputSchema: z.object({
      notes: z.array(z.string()).optional(),
      pastDeckId: z.string().optional(),
    }),
    execute: async ({ notes, pastDeckId }) =>
      runtime.saveMemory(notes, pastDeckId),
  });

  const closeSession = createTool({
    id: "closeSession",
    description: "Close the reading (ritual → closing → refactor).",
    inputSchema: z.object({}),
    execute: async () => {
      runtime.close();
      return { phase: runtime.session.phase };
    },
  });

  const refactorSeekerMemory = createTool({
    id: "refactorSeekerMemory",
    description:
      "Replace memory notes with a fresh compressed list; ends the session.",
    inputSchema: z.object({
      notes: z.array(z.string()),
    }),
    execute: async ({ notes }) => {
      const memory = await runtime.refactorMemory(notes);
      return { memory, phase: runtime.session.phase };
    },
  });

  const endWithoutRitual = createTool({
    id: "endWithoutRitual",
    description: "End during intake/offer when no honest reading can proceed.",
    inputSchema: z.object({}),
    execute: async () => {
      runtime.endWithoutRitual();
      return { phase: runtime.session.phase };
    },
  });

  const askWithOptions = createTool({
    id: "askWithOptions",
    description:
      "Closed ask: 2–6 short options (prefer 2–3 when enough). Use for language, path, lock, deck, cut, open-next, yes/no / pick-one — not open intake, name/self, or free-prose questions. Adapter may render chrome; typed free answer or decline always valid — never force-retry until they tap. allowSkip enables skip/decline chrome.",
    inputSchema: z.object({
      options: z
        .array(
          z.object({
            id: z.string().min(1),
            label: z.string().min(1),
          }),
        )
        .min(MIN_ASK_OPTIONS)
        .max(MAX_ASK_OPTIONS),
      allowSkip: z.boolean().optional(),
    }),
    execute: async ({ options, allowSkip }) =>
      createAskWithOptions({ options, allowSkip }),
  });

  return {
    lockQuestion,
    confirmDeck,
    beginRitual,
    shuffle,
    draw,
    drawToPositions,
    returnToPile,
    rotate,
    openPosition,
    getDeckSnapshot,
    recallSeekerMemory,
    readSeekerProfile,
    updateSeekerProfile,
    saveSeekerMemory,
    closeSession,
    refactorSeekerMemory,
    endWithoutRitual,
    askWithOptions,
  };
}
