import { Bot, type Context } from "grammy";
import type { ActiveReading, SessionHub } from "./sessions.ts";

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

async function reply(ctx: Context, text: string): Promise<void> {
  for (const part of chunkText(text)) {
    await ctx.reply(part);
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
      await ctx.reply("Write me in a private chat for a reading.");
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
      await ctx.reply("Write me in a private chat for a reading.");
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

    await ctx.replyWithChatAction("typing");

    try {
      const reading = await hub.getOrStart(seekerId);
      reading.history.push({ role: "user", content: text });

      const result = await reading.agent.generate(
        reading.history.map((m) => ({
          role: m.role,
          content: m.content,
        })) as Parameters<PythiaAgent["generate"]>[0],
      );
      const answer = extractReplyText(result);
      reading.history.push({ role: "assistant", content: answer });

      await reply(ctx, answer);

      if (reading.runtime.session.phase === "ended") {
        hub.drop(seekerId);
      }
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
