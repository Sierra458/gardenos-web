import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAllNotes } from "@/lib/content";
import { buildPlantSummaries, getPlantPhotos, findPlantLabel } from "@/lib/plants";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export async function generateStaticParams() {
  const notes = await loadAllNotes(CONTENT_DIR);
  return buildPlantSummaries(notes).map(p => ({ plant: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ plant: string }> }) {
  const { plant } = await params;
  const notes = await loadAllNotes(CONTENT_DIR);
  const label = findPlantLabel(notes, plant);
  return label ? { title: `${label} · GardenOS` } : {};
}

export default async function PlantPage({ params }: { params: Promise<{ plant: string }> }) {
  const { plant } = await params;
  const notes = await loadAllNotes(CONTENT_DIR);
  const label = findPlantLabel(notes, plant);
  if (!label) notFound();

  const photos = getPlantPhotos(notes, plant);

  // Group photos by date for the chronological view
  const byDate = new Map<string, typeof photos>();
  for (const p of photos) {
    const list = byDate.get(p.date) ?? [];
    list.push(p);
    byDate.set(p.date, list);
  }
  const dates = Array.from(byDate.keys()).sort();

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
        <Link href="/plants" className="hover:text-[var(--color-text-secondary)]">← Plants</Link>
      </div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-2">{label}</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-8">
        {photos.length === 0
          ? <span>No photos tagged yet. Add <code className="text-[12px] bg-[var(--color-surface)] px-1 rounded">{`plants: [${label}]`}</code> to a photo note's frontmatter to populate this timeline.</span>
          : <span>{photos.length} photo{photos.length === 1 ? "" : "s"} across {dates.length} day{dates.length === 1 ? "" : "s"}.</span>
        }
      </p>

      <div className="space-y-10">
        {dates.map(date => {
          const list = byDate.get(date)!;
          return (
            <section key={date}>
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Date</div>
                  <div className="text-[18px] font-semibold text-[var(--color-text-primary)]">{date}</div>
                </div>
                <Link href={list[0].noteSlug} className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shrink-0">
                  view full day →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {list.map(p => (
                  <a
                    key={p.basename + date}
                    href={p.src}
                    target="_blank"
                    rel="noopener"
                    className="block border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div
                      className="aspect-square bg-cover bg-center"
                      style={{ backgroundImage: `url(${p.src})` }}
                      aria-label={p.basename}
                    />
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
