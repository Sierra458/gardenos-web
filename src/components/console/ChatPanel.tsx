"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage, type UIMessagePart } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";

interface HistoryMessage {
  role: "user" | "assistant" | "tool";
  content: string;
}

export function ChatPanel() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/console/chat" }),
  });
  const [pending, setPending] = useState<UploadedImage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load today's history on mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/history")
      .then(r => r.json())
      .then(({ history }: { history: HistoryMessage[] }) => {
        if (cancelled) return;
        if (!Array.isArray(history) || history.length === 0) return;
        const seeded: UIMessage[] = history
          .filter(m => m.role === "user" || m.role === "assistant")
          .map((m, i) => ({
            id: `hist-${i}`,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text", text: m.content }],
          }));
        if (seeded.length > 0) setMessages(seeded);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setMessages]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim() && pending.length === 0) return;
    const text = draft.trim() || "(see attached photos)";
    const fileParts: FileUIPart[] = pending.map(img => ({
      type: "file",
      url: img.url,
      mediaType: "image/jpeg",
    }));
    const parts: UIMessagePart<never, never>[] = [
      { type: "text", text },
      ...fileParts,
    ];
    await sendMessage({ role: "user", parts });
    setDraft("");
    setPending([]);
  }

  const inFlight = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-[13px] text-[var(--color-text-muted)] text-center mt-12">
            Drop photos, ask Claude anything about your garden.
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`max-w-[640px] ${m.role === "user" ? "ml-auto" : ""}`}>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
              {m.role}
            </div>
            <div
              className={`rounded-lg border px-4 py-3 text-[14px] leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--color-surface)] border-[var(--color-accent)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)]"
              }`}
            >
              {m.parts.map((p, i) => {
                if (p.type === "text") {
                  return (
                    <div key={i} className="whitespace-pre-wrap">
                      {p.text}
                    </div>
                  );
                }
                if (p.type === "file") {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p.url} alt="" className="max-w-full rounded mt-2" />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {status === "submitted" && (
          <div className="text-[12px] text-[var(--color-text-muted)]">Thinking…</div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-[var(--color-border)] p-3 bg-[var(--color-canvas)]"
      >
        {pending.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {pending.map((img, i) => (
              <div key={i} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt=""
                  className="h-16 w-16 object-cover rounded border border-[var(--color-border)]"
                />
                <button
                  type="button"
                  onClick={() => setPending(p => p.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 bg-black border border-[var(--color-border)] rounded-full w-4 h-4 text-[10px] leading-none"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <ImageDropzone onUploaded={img => setPending(p => [...p, img])} />
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask Claude…"
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-[14px] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            disabled={inFlight}
            className="bg-[var(--color-accent)] text-black font-medium px-4 py-2 rounded text-[13px] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
