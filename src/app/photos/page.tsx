import path from "node:path";
import Link from "next/link";
import { loadAllNotes } from "@/lib/content";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export const metadata = { title: "Photos · GardenOS" };

// Pull the first ![[basename]] reference from a note body — used as a thumbnail.
function firstImageRef(body: string): string | undefined {
  const m = body.match(/!\[\[([^\]\n]+?)\]\]/) ?? body.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
  if (!m) return undefined;
  const target = m[1];
  // Wikilink form is just a basename; rewritten form is `/_assets/...`
  return target.startsWith("/") ? target : `/_assets/${target}`;
}

function countPhotos(body: string): number {
  const m = body.match(/!\[\[/g) ?? body.match(/!\[[^\]]*\]\(/g);
  return m?.length ?? 0;
}

export default async function PhotosIndex() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const photoNotes = notes.filter(n => n.slug.startsWith("/photos/"));

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Photos</div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-2">Garden photos by day</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
        {photoNotes.length} day{photoNotes.length === 1 ? "" : "s"} of photos · grouped from EXIF dates.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photoNotes.map(n => {
          const thumb = firstImageRef(n.body);
          const count = countPhotos(n.body);
          return (
            <Link
              key={n.slug}
              href={n.slug}
              className="group border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg overflow-hidden hover:border-[var(--color-accent)] transition-colors"
            >
              {thumb && (
                <div
                  className="aspect-square bg-[var(--color-canvas)] bg-cover bg-center"
                  style={{ backgroundImage: `url(${thumb})` }}
                  aria-hidden="true"
                />
              )}
              <div className="px-3 py-2">
                <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{n.date}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">{count} photo{count === 1 ? "" : "s"}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
