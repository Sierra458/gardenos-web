#!/usr/bin/env tsx
import fg from "fast-glob";
import { readFile, writeFile, mkdir, rm, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseFrontmatter, PublishedFrontmatter } from "../src/lib/frontmatter";
import { vaultPathToSiteSlug } from "../src/lib/slug";

interface DiscoveredNote {
  vaultRelPath: string;
  title: string;
  date: string;
  body: string;
  raw: string;
  frontmatter: PublishedFrontmatter;
}

const ALLOWED_TOP = ["Architecture", "Hardware", "Software", "Daily Log"];

export function mapVaultPathToContentPath(vaultRelPath: string): string {
  if (vaultRelPath === "Garden Monitor.md") return "index.md";
  const slug = vaultPathToSiteSlug(vaultRelPath);
  if (!slug || slug === "/") throw new Error(`Cannot map ${vaultRelPath}`);
  return slug.slice(1) + ".md";
}

export async function discoverPublishedNotes(vaultRoot: string): Promise<DiscoveredNote[]> {
  const patterns = [
    "Garden Monitor.md",
    ...ALLOWED_TOP.map(t => `${t}/**/*.md`),
  ];
  const files = await fg(patterns, { cwd: vaultRoot, dot: false });
  const out: DiscoveredNote[] = [];
  for (const rel of files) {
    const abs = path.join(vaultRoot, rel);
    const raw = await readFile(abs, "utf8");
    const parsed = parseFrontmatter(raw, rel);
    if (parsed.frontmatter.publish !== true) continue;
    out.push({
      vaultRelPath: rel,
      title: parsed.frontmatter.title,
      date: parsed.frontmatter.date,
      body: parsed.body,
      raw,
      frontmatter: parsed.frontmatter,
    });
  }
  return out;
}

const ASSET_REF_RE = /!\[\[([^\]\n]+?)\]\]/g;

async function copyReferencedAssets(notes: DiscoveredNote[], vaultRoot: string, contentRoot: string): Promise<void> {
  const assetsDir = path.join(contentRoot, "_assets");
  for (const note of notes) {
    let m: RegExpExecArray | null;
    ASSET_REF_RE.lastIndex = 0;
    while ((m = ASSET_REF_RE.exec(note.body)) !== null) {
      const ref = m[1];
      const candidates = await fg([`**/${ref}`], { cwd: vaultRoot, dot: false });
      if (candidates.length === 0) {
        console.warn(`  ⚠️  asset not found: ${ref} (referenced by ${note.vaultRelPath})`);
        continue;
      }
      const src = path.join(vaultRoot, candidates[0]);
      const dst = path.join(assetsDir, path.basename(ref));
      await mkdir(path.dirname(dst), { recursive: true });
      await copyFile(src, dst);
    }
  }
}

async function rewriteAssets(body: string): Promise<string> {
  return body.replace(ASSET_REF_RE, (_m, ref: string) => {
    const filename = path.basename(ref);
    return `![${filename}](/_assets/${filename})`;
  });
}

async function writeNotes(notes: DiscoveredNote[], contentRoot: string): Promise<{ written: string[] }> {
  const written: string[] = [];
  for (const note of notes) {
    const rel = mapVaultPathToContentPath(note.vaultRelPath);
    const dst = path.join(contentRoot, rel);
    const body = await rewriteAssets(note.body);
    const frontmatter = `---\npublish: true\ntitle: ${JSON.stringify(note.title)}\ndate: ${note.date}\n---\n`;
    const out = frontmatter + body.trimStart() + (body.endsWith("\n") ? "" : "\n");
    await mkdir(path.dirname(dst), { recursive: true });
    await writeFile(dst, out, "utf8");
    written.push(rel);
  }
  return { written };
}

async function pruneStale(contentRoot: string, written: Set<string>): Promise<string[]> {
  const existing = await fg(["**/*.md", "!_assets/**"], { cwd: contentRoot });
  const removed: string[] = [];
  for (const rel of existing) {
    if (!written.has(rel)) {
      await rm(path.join(contentRoot, rel));
      removed.push(rel);
    }
  }
  return removed;
}

function gitCommitAndPush(contentRoot: string, summary: string): void {
  const repoRoot = path.resolve(contentRoot, "..");
  spawnSync("git", ["add", "content"], { cwd: repoRoot, stdio: "inherit" });
  const status = spawnSync("git", ["status", "--porcelain", "content"], { cwd: repoRoot, encoding: "utf8" });
  if (!status.stdout.trim()) {
    console.log("  ↳ no changes to commit");
    return;
  }
  spawnSync("git", ["commit", "-m", `Publish: ${summary}`], { cwd: repoRoot, stdio: "inherit" });
  spawnSync("git", ["push"], { cwd: repoRoot, stdio: "inherit" });
}

async function main() {
  const vaultRoot = process.env.GARDEN_VAULT_PATH ?? path.join(process.env.HOME ?? "", "Documents/MaRs/Projects/Garden Monitor");
  const contentRoot = path.resolve(process.cwd(), "content");
  await stat(vaultRoot).catch(() => { throw new Error(`Vault not found: ${vaultRoot}`); });
  await mkdir(contentRoot, { recursive: true });

  console.log(`Vault:   ${vaultRoot}`);
  console.log(`Content: ${contentRoot}`);

  const notes = await discoverPublishedNotes(vaultRoot);
  console.log(`Discovered ${notes.length} published notes.`);

  const { written } = await writeNotes(notes, contentRoot);
  await copyReferencedAssets(notes, vaultRoot, contentRoot);
  const removed = await pruneStale(contentRoot, new Set(written));

  const summary = `${written.length} written, ${removed.length} removed`;
  console.log(`  ↳ ${summary}`);
  gitCommitAndPush(contentRoot, summary);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
