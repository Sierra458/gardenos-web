import path from "node:path";
import Link from "next/link";
import { loadAllNotes } from "@/lib/content";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export default async function LogIndex() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const logs = notes.filter(n => n.slug.startsWith("/log/"));

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Daily Log</div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-6">All entries</h1>

      <div className="space-y-2">
        {logs.map(n => (
          <Link
            key={n.slug}
            href={n.slug}
            className="block border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-4 py-3 hover:border-[var(--color-text-muted)] transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <div className="font-semibold text-sm">{n.title}</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">{n.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
