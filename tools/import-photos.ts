#!/usr/bin/env tsx
/**
 * One-shot photo import script.
 *
 *   1. Reads source photos from a folder (default: ~/Desktop/Garden Photos)
 *   2. Extracts EXIF DateTimeOriginal (falls back to file mtime)
 *   3. Resizes each photo to max 1600px wide, JPEG quality 80
 *   4. Saves under <vault>/Photos/_assets/<basename>.jpg
 *   5. Generates one note per date at <vault>/Photos/<YYYY-MM-DD>.md
 *      with publish frontmatter and `![](_assets/...)` references for that day's photos.
 *
 * Run from the gardenos-web repo root:
 *   tsx tools/import-photos.ts
 *
 * Override defaults via env:
 *   PHOTOS_SOURCE_DIR=/path/to/source GARDEN_VAULT_PATH=/path/to/vault tsx tools/import-photos.ts
 */
import fg from "fast-glob";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as exifr from "exifr";

interface PhotoEntry {
  sourcePath: string;
  basename: string;       // e.g. "img_5247.jpg" (lowercased, .jpg extension)
  takenAt: Date;
  isoDate: string;        // YYYY-MM-DD
}

const SOURCE_DIR = process.env.PHOTOS_SOURCE_DIR
  ?? path.join(process.env.HOME ?? "", "Desktop/Garden Photos");

const VAULT_ROOT = process.env.GARDEN_VAULT_PATH
  ?? path.join(process.env.HOME ?? "", "Documents/MaRs/Projects/Garden Monitor");

const PHOTOS_FOLDER = path.join(VAULT_ROOT, "Photos");
const ASSETS_FOLDER = path.join(PHOTOS_FOLDER, "_assets");

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;

async function getTakenAt(sourcePath: string): Promise<Date> {
  try {
    const exif = await exifr.parse(sourcePath, { pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"] });
    const candidate = exif?.DateTimeOriginal ?? exif?.CreateDate ?? exif?.ModifyDate;
    if (candidate instanceof Date && !isNaN(candidate.getTime())) return candidate;
  } catch {
    // Fall through to mtime
  }
  const stats = await stat(sourcePath);
  return stats.mtime;
}

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sanitizeBasename(name: string): string {
  // "IMG_5247.jpeg" -> "img_5247.jpg"
  const stem = path.basename(name, path.extname(name)).toLowerCase();
  return `${stem}.jpg`;
}

async function main() {
  await stat(SOURCE_DIR).catch(() => { throw new Error(`Source folder not found: ${SOURCE_DIR}`); });
  await mkdir(ASSETS_FOLDER, { recursive: true });

  console.log(`Source:  ${SOURCE_DIR}`);
  console.log(`Vault:   ${VAULT_ROOT}`);
  console.log(`Photos:  ${PHOTOS_FOLDER}`);

  const sourceFiles = await fg(["*.{jpg,jpeg,JPG,JPEG,png,PNG,heic,HEIC}"], { cwd: SOURCE_DIR });
  console.log(`Found ${sourceFiles.length} source files.`);

  // Step 1: extract metadata for each
  const entries: PhotoEntry[] = [];
  for (const rel of sourceFiles) {
    const sourcePath = path.join(SOURCE_DIR, rel);
    const takenAt = await getTakenAt(sourcePath);
    const basename = sanitizeBasename(rel);
    entries.push({ sourcePath, basename, takenAt, isoDate: isoDate(takenAt) });
  }
  entries.sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());

  // Step 2: resize + write to assets
  console.log(`\nResizing ${entries.length} photos to max ${MAX_WIDTH}px wide @ Q${JPEG_QUALITY}...`);
  let totalBytesIn = 0;
  let totalBytesOut = 0;
  for (const e of entries) {
    const dst = path.join(ASSETS_FOLDER, e.basename);
    const srcStats = await stat(e.sourcePath);
    totalBytesIn += srcStats.size;

    const buf = await readFile(e.sourcePath);
    const out = await sharp(buf, { failOn: "none" })
      .rotate() // honor EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: "inside" })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    await writeFile(dst, out);
    totalBytesOut += out.length;

    process.stdout.write(`  ${e.basename} (${e.isoDate}) — ${(srcStats.size / 1024 / 1024).toFixed(1)}MB → ${(out.length / 1024).toFixed(0)}KB\n`);
  }
  console.log(`  ↳ ${(totalBytesIn / 1024 / 1024).toFixed(1)}MB → ${(totalBytesOut / 1024 / 1024).toFixed(1)}MB total (${((1 - totalBytesOut / totalBytesIn) * 100).toFixed(0)}% reduction)`);

  // Step 3: group by date and generate notes
  const byDate = new Map<string, PhotoEntry[]>();
  for (const e of entries) {
    const list = byDate.get(e.isoDate) ?? [];
    list.push(e);
    byDate.set(e.isoDate, list);
  }

  console.log(`\nGenerating ${byDate.size} date-grouped notes...`);
  for (const [date, photos] of byDate) {
    const notePath = path.join(PHOTOS_FOLDER, `${date}.md`);
    const title = `${date} — Garden photos (${photos.length})`;

    const lines: string[] = [];
    lines.push("---");
    lines.push("publish: true");
    lines.push(`title: "${title}"`);
    lines.push(`date: ${date}`);
    lines.push("---");
    lines.push("");
    lines.push(`> [[Garden Monitor]] · ${photos.length} photo${photos.length === 1 ? "" : "s"} taken on ${date}.`);
    lines.push("");
    for (const p of photos) {
      const time = p.takenAt.toTimeString().slice(0, 5); // HH:MM
      lines.push(`### ${time}`);
      lines.push("");
      lines.push(`![[${p.basename}]]`);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
    lines.push("#garden-monitor #photos");
    lines.push("");

    await writeFile(notePath, lines.join("\n"), "utf8");
    console.log(`  ${date}.md — ${photos.length} photos`);
  }

  console.log(`\nDone. Run \`npm run publish\` to push to the site.`);
}

main().catch(e => { console.error(e); process.exit(1); });
