import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { kv } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";
import { phase1Tools } from "@/lib/console/tools";
import { SYSTEM_PROMPT } from "@/lib/console/prompts";
import { appendChatMessage } from "@/lib/console/history";

export const runtime = "nodejs";
export const maxDuration = 60; // streaming responses; allow up to 60s

const USER_ID = "admin"; // single-user today; namespaced for future multi-user

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const o = new URL(origin);
    return o.host === req.headers.get("host");
  } catch { return false; }
}

function currentMinuteBucket(): string {
  return new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}

function currentDayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });

  // BURST cap: 10 turns/minute
  const burst = await checkRateLimit(kv, `console:turns:${USER_ID}:burst:${currentMinuteBucket()}`, 10, 60);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too fast — slow down (10/min)" }, {
      status: 429,
      headers: { "Retry-After": String(burst.retryAfterSeconds) },
    });
  }

  // DAILY cap: 200 turns/day
  const daily = await checkRateLimit(kv, `console:turns:${USER_ID}:daily:${currentDayBucket()}`, 200, 24 * 60 * 60);
  if (!daily.allowed) {
    return NextResponse.json({ error: "Daily limit reached (200 turns). Resets at midnight UTC." }, {
      status: 429,
      headers: { "Retry-After": String(daily.retryAfterSeconds) },
    });
  }

  const body = await req.json().catch(() => ({}));
  const messages: UIMessage[] = body.messages ?? [];

  // Log user's last message metadata. AI SDK v6 UIMessage has no top-level `content`;
  // text lives in `parts: [{type: "text", text: "..."}, ...]`. We concatenate text parts
  // for history and count non-text parts as image attachments.
  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    const parts = Array.isArray((last as { parts?: unknown[] }).parts)
      ? (last as { parts: unknown[] }).parts
      : [];
    const textParts = parts
      .filter((p): p is { type: string; text: string } =>
        typeof p === "object" && p !== null && (p as { type?: unknown }).type === "text" && typeof (p as { text?: unknown }).text === "string")
      .map(p => p.text);
    const imageCount = parts.length - textParts.length;
    await appendChatMessage({
      role: "user",
      content: textParts.join("\n") || (imageCount > 0 ? "(images only)" : ""),
      ts: Date.now(),
      imageCount,
    }).catch(() => { /* non-blocking */ });
  }

  const result = streamText({
    model: "anthropic/claude-sonnet-4-6",
    system: SYSTEM_PROMPT,
    providerOptions: {
      anthropic: {
        // Prompt caching for the static system prompt (D12)
        cacheControl: { type: "ephemeral" },
      },
    },
    messages: await convertToModelMessages(messages),
    tools: phase1Tools,
    maxOutputTokens: 1500,
    onFinish: async ({ text }) => {
      await appendChatMessage({
        role: "assistant",
        content: text,
        ts: Date.now(),
      }).catch(() => {});
    },
  });

  return result.toUIMessageStreamResponse();
}
