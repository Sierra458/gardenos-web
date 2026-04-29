import path from "node:path";
import Link from "next/link";
import { loadAllNotes } from "@/lib/content";
import { buildPlantSummaries } from "@/lib/plants";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export const metadata = { title: "Plants · GardenOS" };

export default async function PlantsIndex() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const plants = buildPlantSummaries(notes);
  const totalTagged = plants.reduce((n, p) => n + p.count, 0);

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Plants</div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-2">Photo timeline by plant</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
        {totalTagged} photo{totalTagged === 1 ? "" : "s"} tagged across {plants.filter(p => p.count > 0).length} plant{plants.filter(p => p.count > 0).length === 1 ? "" : "s"} ·
        click any plant to see its photos in chronological order.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {plants.map(p => (
          <Link
            key={p.slug}
            href={`/plants/${p.slug}`}
            className="group border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg overflow-hidden hover:border-[var(--color-accent)] transition-colors"
          >
            {p.thumb ? (
              <div
                className="aspect-square bg-[var(--color-canvas)] bg-cover bg-center"
                style={{ backgroundImage: `url(${p.thumb})` }}
                aria-hidden="true"
              />
            ) : (
              <div className="aspect-square bg-[var(--color-canvas)] flex items-center justify-center text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
                no photos yet
              </div>
            )}
            <div className="px-3 py-2">
              <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{p.label}</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                {p.count} photo{p.count === 1 ? "" : "s"}{p.lastDate ? ` · last ${p.lastDate}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
