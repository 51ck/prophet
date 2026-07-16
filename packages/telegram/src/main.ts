import { createBot } from "./bot.ts";
import { createDefaultMemoryStore, createSessionHub } from "./sessions.ts";

function requireModelEnv(): void {
  const model = process.env.MODEL_ID ?? "deepseek/deepseek-v4-flash";
  const needsDeepseek = model.startsWith("deepseek/");
  const needsOpenAI = model.startsWith("openai/");
  if (needsDeepseek && !process.env.DEEPSEEK_API_KEY) {
    throw new Error(`MODEL_ID=${model} requires DEEPSEEK_API_KEY`);
  }
  if (needsOpenAI && !process.env.OPENAI_API_KEY) {
    throw new Error(`MODEL_ID=${model} requires OPENAI_API_KEY`);
  }
}

async function main(): Promise<void> {
  requireModelEnv();
  const hub = createSessionHub(createDefaultMemoryStore());
  const bot = createBot(hub);

  const me = await bot.api.getMe();
  console.log(`Pythia listening as @${me.username} (DM only)`);
  await bot.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
