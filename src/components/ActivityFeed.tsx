import Link from "next/link";

interface FeedItem {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  source: "log" | "sensor" | "alert"; // sensor + alert are Phase 2; only "log" used in v1
}

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-[var(--color-border)] rounded-lg p-5 text-[var(--color-text-secondary)] text-sm">
        Nothing published yet. Run <code>npm run publish</code> from the site repo.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map(item => (
        <Link
          key={item.slug}
          href={item.slug}
          className="block border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-4 py-3 hover:border-[var(--color-text-muted)] transition-colors"
          data-source={item.source}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-semibold text-[var(--color-text-primary)] text-sm">{item.title}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] shrink-0">{item.date}</div>
          </div>
          {item.excerpt && (
            <div className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{item.excerpt}</div>
          )}
        </Link>
      ))}
    </div>
  );
}
