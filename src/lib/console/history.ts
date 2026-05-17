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

// Hardcoded to Matt's timezone so a 11pm CST message lands in the SAME day blob
// as the daily log he'd write the next morning. If multi-region/multi-user is ever
// needed, switch to per-user timezone (stored alongside the admin session).
const HISTORY_TIMEZONE = "America/Chicago";
const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: HISTORY_TIMEZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
});

function todayKey(date = new Date()): string {
  return `${HISTORY_PREFIX}/${DATE_FORMATTER.format(date)}.json`;
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
