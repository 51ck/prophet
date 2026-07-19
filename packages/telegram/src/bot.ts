import { Bot, type Context } from "grammy";
import type { InlineKeyboard } from "grammy";
import { isPathAsk, type SeekerLanguage } from "@prophet/core";
import { extractAskWithOptions } from "./ask.ts";
import { isTelegramParseError, toTelegramHtml } from "./format.ts";
import {
  buildAskKeyboard,
  normalizeTypedAskReply,
  parseAskCallback,
  resolveAskChoice,
} from "./keyboard.ts";
import {
  LANGUAGE_ASK_PROMPT,
  decideLanguageGate,
  languageAsk,
  languagePromptAlreadyInHistory,
  savedLanguage,
} from "./language-gate.ts";
import {
  introduceNameSelfAsk,
  profileNeedsNameSelf,
} from "./name-self-gate.ts";
import {
  canOfferPathAsk,
  decidePathGate,
  pathAsk,
  pathAskPrompt,
  pathPromptAlreadyInHistory,
  resolvePathChoice,
  shouldSpeakPresenceThenPath,
} from "./path-gate.ts";
import {
  claimPendingAsk,
  type ActiveReading,
  type PendingAsk,
  type SessionHub,
} from "./sessions.ts";

type PythiaAgent = ActiveReading["agent"];

const TELEGRAM_MAX = 4000;

function chunkText(text: string): string[] {
  if (text.length <= TELEGRAM_MAX) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= TELEGRAM_MAX) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n", TELEGRAM_MAX);
    if (cut < TELEGRAM_MAX / 2) cut = TELEGRAM_MAX;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  return parts;
}

function extractReplyText(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "The cards are quiet for a moment — try again.";
  }
  const r = result as Record<string, unknown>;
  if (typeof r.text === "string" && r.text.trim()) return r.text;
  if (typeof r.response === "string" && r.response.trim()) return r.response;
  const message = r.message;
  if (message && typeof message === "object") {
    const content = (message as { content?: unknown }).content;
    if (typeof content === "string" && content.trim()) return content;
  }
  return "The cards are quiet for a moment — try again.";
}

/** Phase 1 outbound parse_mode. HTML over MarkdownV2: escape only <>& vs many MarkdownV2 specials. */
export const PHASE1_PARSE_MODE = "HTML" as const;

type ReplyExtra = {
  reply_markup?: InlineKeyboard;
};

/** Send HTML (with parse fallback). Returns last Message when markup attached. */
async function reply(
  ctx: Context,
  text: string,
  extra?: ReplyExtra,
): Promise<{ message_id: number; chat: { id: number } } | undefined> {
  const parts = chunkText(text);
  let last:
    | { message_id: number; chat: { id: number } }
    | undefined;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const isLast = i === parts.length - 1;
    const markup =
      isLast && extra?.reply_markup
        ? { reply_markup: extra.reply_markup }
        : {};
    const html = toTelegramHtml(part);
    try {
      last = await ctx.reply(html, {
        parse_mode: PHASE1_PARSE_MODE,
        ...markup,
      });
    } catch (err) {
      if (!isTelegramParseError(err)) throw err;
      console.warn("telegram HTML parse rejected; resending plain text");
      // Original chunk, no parse_mode — avoid half-broken markup tags.
      last = await ctx.reply(part, markup);
    }
  }
  return last;
}

async function clearPendingKeyboard(
  bot: Bot,
  reading: ActiveReading,
): Promise<PendingAsk | undefined> {
  const pending = claimPendingAsk(reading);
  if (!pending) return undefined;
  try {
    await bot.api.editMessageReplyMarkup(pending.chatId, pending.messageId, {
      reply_markup: { inline_keyboard: [] },
    });
  } catch (err) {
    // Message may already lack markup or be too old — ignore.
    console.warn("clear pending keyboard failed", err);
  }
  return pending;
}

/** Restore language keyboard on the original message after an invalid typed reply. */
async function restoreLanguageAsk(
  bot: Bot,
  reading: ActiveReading,
  pending: PendingAsk,
): Promise<void> {
  reading.pendingAsk = pending;
  try {
    await bot.api.editMessageReplyMarkup(pending.chatId, pending.messageId, {
      reply_markup: buildAskKeyboard(pending.ask),
    });
  } catch (err) {
    console.warn("restore language keyboard failed", err);
  }
}

/**
 * Offer ru|en with T1 buttons.
 * `pushHistory` false when re-offering after a bad reply (no duplicate prompt in thread).
 */
async function offerLanguageAsk(
  ctx: Context,
  reading: ActiveReading,
  opts?: { pushHistory?: boolean },
): Promise<void> {
  const ask = languageAsk();
  const sent = await reply(ctx, LANGUAGE_ASK_PROMPT, {
    reply_markup: buildAskKeyboard(ask),
  });
  if (opts?.pushHistory !== false) {
    reading.history.push({ role: "assistant", content: LANGUAGE_ASK_PROMPT });
  }
  if (sent) {
    reading.pendingAsk = {
      ask,
      chatId: sent.chat.id,
      messageId: sent.message_id,
    };
  }
}

/** Ask ru|en with T1 buttons; skip when language already saved. */
async function askLanguageIfNeeded(
  ctx: Context,
  reading: ActiveReading,
): Promise<boolean> {
  if (savedLanguage(reading.runtime.readProfile())) return false;
  await offerLanguageAsk(ctx, reading);
  return true;
}

/** Nudge name + few words when profile incomplete; skip when already set. */
async function askNameSelfIfNeeded(
  ctx: Context,
  reading: ActiveReading,
  language: SeekerLanguage,
): Promise<boolean> {
  if (!profileNeedsNameSelf(reading.runtime.readProfile())) return false;
  const ask = introduceNameSelfAsk(language);
  reading.history.push({ role: "assistant", content: ask });
  await reply(ctx, ask);
  return true;
}

/** Offer day-card vs find-a-question with T1 buttons. */
async function offerPathAsk(
  ctx: Context,
  reading: ActiveReading,
  language: SeekerLanguage,
): Promise<void> {
  const ask = pathAsk(language);
  const prompt = pathAskPrompt(language);
  const sent = await reply(ctx, prompt, {
    reply_markup: buildAskKeyboard(ask),
  });
  reading.history.push({ role: "assistant", content: prompt });
  if (sent) {
    reading.pendingAsk = {
      ask,
      chatId: sent.chat.id,
      messageId: sent.message_id,
    };
  }
}

/**
 * After a presence/[new] turn: offer path once if unset.
 * Requires presenceSpoken — name/self-ready alone is not enough (T9.2).
 */
async function offerPathAskIfNeeded(
  ctx: Context,
  reading: ActiveReading,
  language: SeekerLanguage,
): Promise<boolean> {
  if (
    !canOfferPathAsk({
      presenceSpoken: Boolean(reading.presenceSpoken),
      sessionPath: reading.runtime.session.sessionPath,
      needsNameSelf: profileNeedsNameSelf(reading.runtime.readProfile()),
      pathPromptInHistory: pathPromptAlreadyInHistory(reading.history),
      pendingIsPathAsk: Boolean(
        reading.pendingAsk && isPathAsk(reading.pendingAsk.ask),
      ),
    })
  ) {
    return false;
  }
  await offerPathAsk(ctx, reading, language);
  return true;
}

type ChannelCue = "presence" | "new";

/** Consume deferred /new cue (or explicit override); default presence. */
function takeChannelCue(
  reading: ActiveReading,
  override?: ChannelCue,
): ChannelCue {
  if (override) {
    reading.pendingCue = undefined;
    return override;
  }
  const cue = reading.pendingCue ?? "presence";
  reading.pendingCue = undefined;
  return cue;
}

/** Run Pythia generate and send reply. Channel cues are not stored in history. */
async function deliverAgentReply(
  ctx: Context,
  reading: ActiveReading,
  hub: SessionHub,
  seekerId: string,
  opts?: { channelCue?: ChannelCue },
): Promise<void> {
  await ctx.replyWithChatAction("typing");

  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    reading.history.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  if (opts?.channelCue === "presence") {
    messages.push({ role: "user", content: "[presence]" });
  } else if (opts?.channelCue === "new") {
    messages.push({ role: "user", content: "[new]" });
  }

  const result = await reading.agent.generate(
    messages as Parameters<PythiaAgent["generate"]>[0],
  );
  const answer = extractReplyText(result);
  reading.history.push({ role: "assistant", content: answer });
  if (opts?.channelCue) {
    reading.presenceSpoken = true;
  }

  const ask = extractAskWithOptions(result);
  // Always expire prior keyboard before this reply. T9.2 name/self→presence
  // chains two generates on one turn; if the first left a non-path ask and the
  // second attaches a path ask, stale taps must not hit the new pendingAsk.
  // Also drops leftover chrome when generate yields no ask (pre-presence path
  // ask cannot block post-presence channel offer).
  await expirePendingAskMarkup(
    ctx,
    reading,
    ask
      ? "expire prior ask before agent askWithOptions failed"
      : "expire stale ask after agent reply without ask failed",
  );
  if (ask) {
    const sent = await reply(ctx, answer, {
      reply_markup: buildAskKeyboard(ask),
    });
    if (sent) {
      reading.pendingAsk = {
        ask,
        chatId: sent.chat.id,
        messageId: sent.message_id,
      };
    }
  } else {
    await reply(ctx, answer);
  }

  if (reading.runtime.session.phase === "ended") {
    hub.drop(seekerId);
  }
}

/** Claim pending ask and strip its inline keyboard so stale taps die. */
async function expirePendingAskMarkup(
  ctx: Context,
  reading: ActiveReading,
  warnLabel: string,
): Promise<PendingAsk | undefined> {
  const pending = claimPendingAsk(reading);
  if (!pending) return undefined;
  try {
    await ctx.api.editMessageReplyMarkup(pending.chatId, pending.messageId, {
      reply_markup: { inline_keyboard: [] },
    });
  } catch (err) {
    console.warn(warnLabel, err);
  }
  return pending;
}

/**
 * Presence or /new cue, then path: honor typed path label on this turn,
 * else offer once (skip if agent already returned a path ask).
 */
async function deliverPresenceThenPath(
  ctx: Context,
  reading: ActiveReading,
  hub: SessionHub,
  seekerId: string,
  language: SeekerLanguage,
  opts?: { cue?: ChannelCue; turnText?: string },
): Promise<void> {
  const cue = takeChannelCue(reading, opts?.cue);
  await deliverAgentReply(ctx, reading, hub, seekerId, { channelCue: cue });
  const pathFromText = opts?.turnText
    ? resolvePathChoice(opts.turnText)
    : undefined;
  if (pathFromText) {
    // Typed path wins over any ask chrome the presence turn attached.
    await expirePendingAskMarkup(
      ctx,
      reading,
      "expire path keyboard after typed choice failed",
    );
    reading.runtime.setSessionPath(pathFromText);
    await deliverAgentReply(ctx, reading, hub, seekerId);
    return;
  }
  // Agent may already have offered path via askWithOptions — do not duplicate.
  if (reading.pendingAsk && isPathAsk(reading.pendingAsk.ask)) {
    return;
  }
  // After presence, path is next closed ask — expire any other pending keyboard
  // so channel path offer does not orphan live non-path markup.
  if (reading.pendingAsk) {
    await expirePendingAskMarkup(
      ctx,
      reading,
      "expire non-path keyboard before path offer failed",
    );
  }
  await offerPathAskIfNeeded(ctx, reading, language);
}

/**
 * After language known: name/self nudge, else presence then path offer (T9.2).
 */
async function continueAfterLanguage(
  ctx: Context,
  reading: ActiveReading,
  hub: SessionHub,
  seekerId: string,
  language: SeekerLanguage,
): Promise<void> {
  if (await askNameSelfIfNeeded(ctx, reading, language)) return;
  await deliverPresenceThenPath(ctx, reading, hub, seekerId, language);
}

async function runSeekerTurn(
  ctx: Context,
  hub: SessionHub,
  bot: Bot,
  seekerId: string,
  text: string,
): Promise<void> {
  const reading = await hub.getOrStart(seekerId);
  // Typed reply always claims pending ask — never force-retry until they tap.
  const pending = await clearPendingKeyboard(bot, reading);
  const turnText = normalizeTypedAskReply(pending?.ask, text);

  const currentLanguage = savedLanguage(reading.runtime.readProfile());
  if (!currentLanguage) {
    const decision = decideLanguageGate({
      turnText,
      pendingAsk: pending?.ask,
      alreadyPromptedInHistory: languagePromptAlreadyInHistory(reading.history),
    });
    if (decision.action === "accept") {
      const { language } = decision;
      await reading.runtime.updateProfile({ language });
      reading.history.push({ role: "user", content: turnText });
      await continueAfterLanguage(ctx, reading, hub, seekerId, language);
      return;
    }
    if (decision.action === "restore-pending" && pending) {
      await restoreLanguageAsk(bot, reading, pending);
      return;
    }
    if (decision.action === "ask") {
      await offerLanguageAsk(ctx, reading);
      return;
    }
    // reoffer, or restore-pending without pending handle
    await offerLanguageAsk(ctx, reading, { pushHistory: false });
    return;
  }

  // Language change is agent-owned via updateSeekerProfile — no phrase parse here.
  const neededNameSelfBefore = profileNeedsNameSelf(
    reading.runtime.readProfile(),
  );
  const present = !neededNameSelfBefore;
  const pathPromptInHistory = pathPromptAlreadyInHistory(reading.history);
  const pathDecision = decidePathGate({
    turnText,
    pendingAsk: pending?.ask,
    alreadyPromptedInHistory: pathPromptInHistory,
    sessionPath: reading.runtime.session.sessionPath,
    present,
    presenceSpoken: Boolean(reading.presenceSpoken),
  });
  if (pathDecision.action === "accept") {
    reading.runtime.setSessionPath(pathDecision.path);
    reading.history.push({ role: "user", content: turnText });
    await deliverAgentReply(ctx, reading, hub, seekerId);
    return;
  }
  if (pathDecision.action === "offer") {
    // Presence already spoken; channel path keyboard once (no force-retry).
    reading.history.push({ role: "user", content: turnText });
    await offerPathAsk(ctx, reading, currentLanguage);
    return;
  }

  // continue — free text / already offered / not ready; never restore keyboard.
  reading.history.push({ role: "user", content: turnText });

  // Name/self introduce answer: agent fills profile, then presence, then path.
  // Path label in the same message still counts after presence (free-text path).
  if (neededNameSelfBefore) {
    await deliverAgentReply(ctx, reading, hub, seekerId);
    if (!profileNeedsNameSelf(reading.runtime.readProfile())) {
      await deliverPresenceThenPath(
        ctx,
        reading,
        hub,
        seekerId,
        currentLanguage,
        { turnText },
      );
    }
    return;
  }

  // Cold DM / first text this session: presence first, then path (not mid-turn).
  // Typed path labels wait until after presence — then apply without re-asking.
  if (
    shouldSpeakPresenceThenPath({
      presenceSpoken: Boolean(reading.presenceSpoken),
      sessionPath: reading.runtime.session.sessionPath,
      needsNameSelf: false,
      pathPromptInHistory,
    })
  ) {
    await deliverPresenceThenPath(
      ctx,
      reading,
      hub,
      seekerId,
      currentLanguage,
      { turnText },
    );
    return;
  }

  await deliverAgentReply(ctx, reading, hub, seekerId);
}

export function createBot(hub: SessionHub): Bot {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await reply(ctx, "Write me in a private chat for a reading.");
      return;
    }
    const seekerId = String(ctx.from?.id ?? "");
    if (!seekerId) return;

    const reading = await hub.startFresh(seekerId);
    if (await askLanguageIfNeeded(ctx, reading)) return;

    const language = savedLanguage(reading.runtime.readProfile())!;
    await continueAfterLanguage(ctx, reading, hub, seekerId, language);
  });

  bot.command("new", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await reply(ctx, "Write me in a private chat for a reading.");
      return;
    }
    const seekerId = String(ctx.from?.id ?? "");
    if (!seekerId) return;
    const reading = await hub.startFresh(seekerId);
    // Preserve [new] if language / name-self gates defer presence.
    reading.pendingCue = "new";
    if (await askLanguageIfNeeded(ctx, reading)) return;

    const language = savedLanguage(reading.runtime.readProfile())!;
    if (await askNameSelfIfNeeded(ctx, reading, language)) return;
    await deliverPresenceThenPath(ctx, reading, hub, seekerId, language);
  });

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const parsed = parseAskCallback(data);
    if (!parsed) {
      await ctx.answerCallbackQuery();
      return;
    }

    if (ctx.chat?.type !== "private") {
      await ctx.answerCallbackQuery({
        text: "Write me in a private chat for a reading.",
      });
      return;
    }

    const seekerId = String(ctx.from?.id ?? "");
    if (!seekerId) {
      await ctx.answerCallbackQuery();
      return;
    }

    const reading = await hub.getOrStart(seekerId);
    const pending = reading.pendingAsk;
    if (!pending) {
      await ctx.answerCallbackQuery({ text: "That choice has passed." });
      try {
        await ctx.editMessageReplyMarkup({
          reply_markup: { inline_keyboard: [] },
        });
      } catch {
        // ignore
      }
      return;
    }

    const choice = resolveAskChoice(pending.ask, parsed);
    if (!choice) {
      await ctx.answerCallbackQuery({ text: "That choice has passed." });
      return;
    }

    // Claim before generate so stale taps cannot double-submit.
    claimPendingAsk(reading);
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageReplyMarkup({
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.warn("expire ask keyboard failed", err);
    }

    try {
      await runSeekerTurn(ctx, hub, bot, seekerId, choice);
    } catch (err) {
      console.error("pythia callback turn failed", err);
      await reply(
        ctx,
        "Something snagged in the ritual path. Send /new to begin again, or try once more.",
      );
    }
  });

  bot.on("message:text", async (ctx) => {
    if (ctx.chat.type !== "private") {
      return;
    }
    if (ctx.message.text.startsWith("/")) {
      return;
    }

    const seekerId = String(ctx.from?.id ?? "");
    if (!seekerId) return;

    const text = ctx.message.text.trim();
    if (!text) return;

    try {
      await runSeekerTurn(ctx, hub, bot, seekerId, text);
    } catch (err) {
      console.error("pythia turn failed", err);
      await reply(
        ctx,
        "Something snagged in the ritual path. Send /new to begin again, or try once more.",
      );
    }
  });

  bot.catch((err) => {
    console.error("grammy error", err);
  });

  return bot;
}
