import { isAskWithOptions, type AskWithOptions } from "@prophet/core";

function unwrapToolResult(tr: unknown): {
  toolName?: string;
  result?: unknown;
} {
  if (!tr || typeof tr !== "object") return {};
  const o = tr as Record<string, unknown>;
  if (o.payload && typeof o.payload === "object") {
    const p = o.payload as Record<string, unknown>;
    return {
      toolName: typeof p.toolName === "string" ? p.toolName : undefined,
      result: p.result,
    };
  }
  return {
    toolName:
      typeof o.toolName === "string"
        ? o.toolName
        : typeof o.name === "string"
          ? o.name
          : undefined,
    result: o.result,
  };
}

function collectToolResults(result: unknown): unknown[] {
  if (!result || typeof result !== "object") return [];
  const r = result as Record<string, unknown>;
  const out: unknown[] = [];
  if (Array.isArray(r.toolResults)) out.push(...r.toolResults);
  if (Array.isArray(r.steps)) {
    for (const step of r.steps) {
      if (!step || typeof step !== "object") continue;
      const trs = (step as { toolResults?: unknown }).toolResults;
      if (Array.isArray(trs)) out.push(...trs);
    }
  }
  return out;
}

/**
 * Last askWithOptions tool result from an agent generate() payload.
 * Channel-agnostic shape; adapter decides chrome.
 */
export function extractAskWithOptions(
  result: unknown,
): AskWithOptions | undefined {
  const toolResults = collectToolResults(result);
  for (let i = toolResults.length - 1; i >= 0; i--) {
    const { toolName, result: toolResult } = unwrapToolResult(toolResults[i]);
    if (toolName !== "askWithOptions") continue;
    if (isAskWithOptions(toolResult)) return toolResult;
  }
  return undefined;
}
