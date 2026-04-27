import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter, PublishedFrontmatter } from "./frontmatter";

export interface Note {
  slug: string;
  title: string;
  date: string;
  frontmatter: PublishedFrontmatter;
  body: string;
  contentPath: string; // path inside content/
}

export class DuplicateSlugError extends Error {
  constructor(public slug: string, public files: string[]) {
    super(`Duplicate slug "${slug}" — files: ${files.join(", ")}`);
    this.name = "DuplicateSlugError";
  }
}

/**
 * Maps a path inside content/ to a site slug.
 * "index.md" → "/"
 * "log/2026-03-19.md" → "/log/2026-03-19"
 * "hardware/raspberry-pi-5.md" → "/hardware/raspberry-pi-5"
 */
function contentPathToSlug(rel: string): string {
  if (rel === "index.md") return "/";
  return "/" + rel.replace(/\.md$/, "");
}

export async function loadAllNotes(contentDir: string): Promise<Note[]> {
  const files = await fg(["**/*.md", "!_assets/**"], { cwd: contentDir });
  const notes: Note[] = [];
  const seenSlugs = new Map<string, string>();
  for (const rel of files) {
    const abs = path.join(contentDir, rel);
    const raw = await readFile(abs, "utf8");
    const { frontmatter, body } = parseFrontmatter(raw, rel);
    if (frontmatter.publish !== true) continue;
    const slug = contentPathToSlug(rel);
    const existing = seenSlugs.get(slug);
    if (existing) throw new DuplicateSlugError(slug, [existing, rel]);
    seenSlugs.set(slug, rel);
    notes.push({
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      frontmatter,
      body,
      contentPath: rel,
    });
  }
  notes.sort((a, b) => b.date.localeCompare(a.date));
  return notes;
}

export function getNoteBySlug(notes: Note[], slug: string): Note | undefined {
  return notes.find(n => n.slug === slug);
}
