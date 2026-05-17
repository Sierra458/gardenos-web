import { put, list } from "@vercel/blob";
import { fetchBlobBody } from "./blob-fetch";

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  ts: number;
  // Optional metadata
  toolName?: string;
  imageCount?: number;
}

const HISTORY_PREFIX = "chat-history";

function todayKey(date = new Date()): string {
  return `${HISTORY_PREFIX}/${date.toISOString().slice(0, 10)}.json`;
}

export async function readChatHistory(date = new Date()): Promise<ChatHistoryMessage[]> {
  const key = todayKey(date);
  const found = await list({ prefix: key });
  if (found.blobs.length === 0) return [];
  const body = await fetchBlobBody(found.blobs[0].url);
  if (!body) return [];
  try { return JSON.parse(body) as ChatHistoryMessage[]; }
  catch { return []; }
}

export async function appendChatMessage(msg: ChatHistoryMessage, date = new Date()): Promise<void> {
  const existing = await readChatHistory(date);
  const next = [...existing, msg];
  await put(todayKey(date), JSON.stringify(next), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
