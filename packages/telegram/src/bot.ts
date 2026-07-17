import { Bot, type Context } from "grammy";
import type { InlineKeyboard } from "grammy";
import { extractAskWithOptions } from "./ask.ts";
import { isTelegramParseError, toTelegramHtml } from "./format.ts";
import {
  buildAskKeyboard,
  normalizeTypedAskReply,
  parseAskCallback,
  resolveAskChoice,
} from "./keyboard.ts";
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

async function runSeekerTurn(
  ctx: Context,
  hub: SessionHub,
  bot: Bot,
  seekerId: string,
  text: string,
): Promise<void> {
  await ctx.replyWithChatAction("typing");

  const reading = await hub.getOrStart(seekerId);
  // Typed reply always claims pending ask — never force-retry until they tap.
  const pending = await clearPendingKeyboard(bot, reading);
  const turnText = normalizeTypedAskReply(pending?.ask, text);

  reading.history.push({ role: "user", content: turnText });

  const result = await reading.agent.generate(
    reading.history.map((m) => ({
      role: m.role,
      content: m.content,
    })) as Parameters<PythiaAgent["generate"]>[0],
  );
  const answer = extractReplyText(result);
  reading.history.push({ role: "assistant", content: answer });

  const ask = extractAskWithOptions(result);
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
    const opener =
      "I am Pythia. Tell me what you cannot settle by ordinary means — we will find a proper question, then read.";
    reading.history.push({ role: "assistant", content: opener });
    await reply(ctx, opener);
  });

  bot.command("new", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await reply(ctx, "Write me in a private chat for a reading.");
      return;
    }
    const seekerId = String(ctx.from?.id ?? "");
    if (!seekerId) return;
    await hub.startFresh(seekerId);
    await reply(
      ctx,
      "Fresh session. What question do you want answered esoterically?",
    );
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
