import path from "node:path";
import Link from "next/link";
import { loadAllNotes, firstProseLine } from "@/lib/content";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export const metadata = { title: "Plant Logs · GardenOS" };

export default async function PlantLogsIndex() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const logs = notes
    .filter(n => n.slug.startsWith("/plant-logs/"))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Plant Logs</div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-2">Per-plant care logs</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
        Latest observation, health rating, and recommended actions for every plant in the garden. Updated alongside the daily log.
      </p>

      <div className="space-y-2">
        {logs.map(n => (
          <Link
            key={n.slug}
            href={n.slug}
            className="block border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-4 py-3 hover:border-[var(--color-text-muted)] transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-semibold text-sm text-[var(--color-text-primary)]">{n.title}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] shrink-0">{n.date}</div>
            </div>
            {firstProseLine(n.body) && (
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{firstProseLine(n.body)}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
