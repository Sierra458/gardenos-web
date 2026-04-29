"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

interface IndexEntry {
  slug: string;
  title: string;
  date: string;
  section: string;
  body: string;
}

let cachedFuse: Fuse<IndexEntry> | null = null;
let loadingPromise: Promise<void> | null = null;

function ensureIndexLoaded(): Promise<void> {
  if (cachedFuse) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = fetch("/search-index.json")
    .then(r => r.json() as Promise<IndexEntry[]>)
    .then(data => {
      cachedFuse = new Fuse(data, {
        keys: [
          { name: "title", weight: 3 },
          { name: "section", weight: 2 },
          { name: "body", weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        includeMatches: false,
      });
    });
  return loadingPromise;
}

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      if (((isMac ? e.metaKey : e.ctrlKey)) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handler);
    // Listen for a custom event so the sidebar trigger can open it
    function openHandler() { setOpen(true); }
    document.addEventListener("gardenos:open-search", openHandler as EventListener);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("gardenos:open-search", openHandler as EventListener);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    ensureIndexLoaded().then(() => {
      // re-run with current q after load
      if (q && cachedFuse) setResults(cachedFuse.search(q, { limit: 10 }).map(r => r.item));
    });
    // focus input
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, q]);

  useEffect(() => {
    if (!cachedFuse || !q.trim()) { setResults([]); return; }
    setResults(cachedFuse.search(q, { limit: 10 }).map(r => r.item));
  }, [q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search notes"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[560px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-[var(--color-text-muted)]" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search across all notes…"
            className="flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] rounded text-[var(--color-text-muted)] font-sans">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q && results.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-[var(--color-text-muted)]">
              No matches for "{q}".
            </div>
          )}
          {!q && (
            <div className="px-4 py-3 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
              Search across all {/* count visible at first run */}notes — title, section, body.
              <br />
              <span className="text-[11px]">Press <kbd className="text-[10px] px-1 py-0.5 border border-[var(--color-border)] rounded">⌘K</kbd> or <kbd className="text-[10px] px-1 py-0.5 border border-[var(--color-border)] rounded">/</kbd> anywhere to open.</span>
            </div>
          )}
          {results.length > 0 && (
            <ul className="py-2">
              {results.map(r => (
                <li key={r.slug}>
                  <Link
                    href={r.slug}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 hover:bg-[var(--color-canvas)] focus:bg-[var(--color-canvas)] outline-none"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-semibold text-[14px] text-[var(--color-text-primary)] truncate">{r.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] shrink-0">{r.section}</div>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] truncate mt-0.5">{r.slug}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchTriggerButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => document.dispatchEvent(new CustomEvent("gardenos:open-search"))}
      className={className ?? "flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md transition-colors"}
      aria-label="Open search"
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
      <span className="flex-1 text-left">Search…</span>
      <kbd className="text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] rounded font-sans">⌘K</kbd>
    </button>
  );
}
