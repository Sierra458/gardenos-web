import Link from "next/link";

export interface TodayItem {
  text: string;
  done: boolean;
}

export function TodayWidget({ items, sourceSlug, sourceDate }: { items: TodayItem[]; sourceSlug?: string; sourceDate?: string }) {
  if (items.length === 0) return null;
  const top = items.slice(0, 6);
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg p-4 mb-8">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-accent)]">Today</div>
          <div className="text-[15px] font-semibold text-[var(--color-text-primary)]">Pending actions</div>
        </div>
        {sourceSlug && (
          <Link href={sourceSlug} className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shrink-0">
            from {sourceDate}
          </Link>
        )}
      </div>
      <ul className="space-y-1.5">
        {top.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)] leading-snug">
            <span className="text-[var(--color-text-muted)] mt-[3px] shrink-0">▢</span>
            <span dangerouslySetInnerHTML={{ __html: renderInline(it.text) }} />
          </li>
        ))}
      </ul>
      {items.length > top.length && (
        <div className="mt-3 text-[11px] text-[var(--color-text-muted)]">
          + {items.length - top.length} more · see {sourceSlug ? <Link href={sourceSlug} className="underline">latest log</Link> : "latest log"}
        </div>
      )}
    </div>
  );
}

// Tiny safe-ish inline markdown renderer (bold + emphasis only)
function renderInline(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+?)\*/g, "<em>$1</em>");
}
