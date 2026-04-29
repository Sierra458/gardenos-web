import type { Note } from "./content";
import { slugifySegment } from "./slug";

export interface PlantPhoto {
  basename: string;     // e.g. "img_5247.jpg"
  src: string;          // e.g. "/_assets/img_5247.jpg"
  date: string;         // YYYY-MM-DD (from the parent note)
  noteSlug: string;     // /photos/2026-04-21
  caption?: string;
}

export interface PlantSummary {
  slug: string;         // url segment, e.g. "lavender"
  label: string;        // display label, e.g. "Lavender"
  count: number;        // photo count
  thumb?: string;       // first photo src
  lastDate?: string;    // most recent photo date
}

/** Known plant labels used across the project — feeds the index even when no photos are tagged. */
const SEED_LABELS = [
  "Lavender", "Spearmint", "Citronella", "Potato Tower",
  "Lime Tree", "Watermelon", "Corn", "Tomato",
  "Bell Pepper", "Jalapeño", "Onion", "Lettuce",
  "Basil", "Oregano", "Rosemary", "Broccoli",
  "Carrot", "Cucumber", "Okra", "Indoor Nursery",
  "Raised Bed",
];

const PHOTO_REF_RE = /!\[\[([^\]\n]+?)\]\]|!\[[^\]]*\]\(([^)\s]+)\)/g;

/** Returns ordered list of `{basename, src}` for every image reference in a body. */
function extractPhotos(body: string): { basename: string; src: string }[] {
  const out: { basename: string; src: string }[] = [];
  let m: RegExpExecArray | null;
  PHOTO_REF_RE.lastIndex = 0;
  while ((m = PHOTO_REF_RE.exec(body)) !== null) {
    const ref = m[1] ?? m[2];
    if (!ref) continue;
    const basename = ref.split("/").pop()!;
    const src = ref.startsWith("/") ? ref : `/_assets/${basename}`;
    out.push({ basename, src });
  }
  return out;
}

/**
 * Walks every photo note (slug starts with /photos/) and produces a flat list of
 * `{plant -> [photos chronologically]}`. Tags come from the note's frontmatter:
 *
 *   plants: [Lavender, Citronella]              // entire note's photos tagged
 *
 * OR, for per-image granularity:
 *
 *   photos:
 *     img_5247.jpg: [Lavender, Citronella]
 *     img_5248.jpg: [Potato Tower]
 */
export function buildPlantIndex(notes: Note[]): Map<string, PlantPhoto[]> {
  const index = new Map<string, PlantPhoto[]>();

  for (const note of notes) {
    if (!note.slug.startsWith("/photos/")) continue;
    const fm = note.frontmatter as { plants?: string[]; photos?: Record<string, string[]> };
    const noteLevelTags = Array.isArray(fm.plants) ? fm.plants : [];
    const perImageTags: Record<string, string[]> = (fm.photos && typeof fm.photos === "object") ? fm.photos : {};

    const photos = extractPhotos(note.body);
    for (const p of photos) {
      const tags = perImageTags[p.basename] ?? noteLevelTags;
      for (const raw of tags) {
        const label = String(raw).trim();
        if (!label) continue;
        const slug = slugifySegment(label);
        if (!slug) continue;
        const list = index.get(slug) ?? [];
        list.push({ basename: p.basename, src: p.src, date: note.date, noteSlug: note.slug });
        index.set(slug, list);
      }
    }
  }

  // Sort photos within each plant chronologically (oldest first).
  for (const [, photos] of index) {
    photos.sort((a, b) => a.date.localeCompare(b.date));
  }
  return index;
}

/** Builds the directory listing for /plants — every known label, with counts, even if 0. */
export function buildPlantSummaries(notes: Note[]): PlantSummary[] {
  const index = buildPlantIndex(notes);
  const labelBySlug = new Map<string, string>();
  for (const seed of SEED_LABELS) labelBySlug.set(slugifySegment(seed), seed);
  // Add any plant slugs that exist in tags but aren't in the seed list.
  for (const slug of index.keys()) {
    if (!labelBySlug.has(slug)) {
      // Fall back to capitalized slug for display label.
      labelBySlug.set(slug, slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "));
    }
  }

  const summaries: PlantSummary[] = [];
  for (const [slug, label] of labelBySlug) {
    const photos = index.get(slug) ?? [];
    summaries.push({
      slug,
      label,
      count: photos.length,
      thumb: photos[photos.length - 1]?.src,  // newest as thumb
      lastDate: photos[photos.length - 1]?.date,
    });
  }
  // Plants with photos first, alphabetical within each group.
  summaries.sort((a, b) => {
    if ((a.count > 0) !== (b.count > 0)) return a.count > 0 ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
  return summaries;
}

export function getPlantPhotos(notes: Note[], slug: string): PlantPhoto[] {
  return buildPlantIndex(notes).get(slug) ?? [];
}

export function findPlantLabel(notes: Note[], slug: string): string | undefined {
  const summaries = buildPlantSummaries(notes);
  return summaries.find(s => s.slug === slug)?.label;
}
