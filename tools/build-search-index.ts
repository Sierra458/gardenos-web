#!/usr/bin/env tsx
/**
 * Build-time search index generator.
 *
 * Reads every published note from content/, dumps a JSON file at
 * public/search-index.json that the client SearchModal fetches on first open.
 *
 * Run via the `prebuild` npm script before `next build`.
 */
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { loadAllNotes } from "../src/lib/content";

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const OUT_PATH = path.resolve(process.cwd(), "public", "search-index.json");

// Strip wikilink + image syntax + frontmatter-style noise so search hits real prose
function cleanForSearch(body: string): string {
  return body
    .replace(/!\[\[[^\]]+\]\]/g, "")
    .replace(/\[\[([^\]|]+?)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_>`]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const index = notes.map(n => ({
    slug: n.slug,
    title: n.title,
    date: n.date,
    section: n.slug.split("/")[1] || "home",
    body: cleanForSearch(n.body).slice(0, 4000),
  }));
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(index));
  console.log(`Wrote search index: ${index.length} notes → ${OUT_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
