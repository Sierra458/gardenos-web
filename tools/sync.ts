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
  frontmatter: PublishedFrontmatter;
}

const ALLOWED_TOP = ["Architecture", "Hardware", "Software", "Daily Log", "Photos"];

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
      frontmatter: parsed.frontmatter,
    });
  }
  return out;
}

async function buildVaultAssetIndex(vaultRoot: string): Promise<Map<string, string>> {
  const allAssets = await fg(["**/*.{png,jpg,jpeg,gif,svg,webp,pdf,mp4,webm}"], { cwd: vaultRoot, dot: false });
  const byBasename = new Map<string, string>();
  for (const p of allAssets) {
    const k = path.basename(p);
    if (!byBasename.has(k)) byBasename.set(k, p);
  }
  return byBasename;
}

interface ResolvedAsset {
  filename: string;     // basename only (e.g., "diagram.png")
  vaultPath: string;    // path within vault for copying
}

function findAssetReferences(notes: DiscoveredNote[], assetIndex: Map<string, string>): {
  resolved: Map<string, ResolvedAsset>; // key = original ref string
  missing: Array<{ ref: string; sourceFile: string }>;
} {
  const resolved = new Map<string, ResolvedAsset>();
  const missing: Array<{ ref: string; sourceFile: string }> = [];
  for (const note of notes) {
    let m: RegExpExecArray | null;
    const re = /!\[\[([^\]\n]+?)\]\]/g;
    while ((m = re.exec(note.body)) !== null) {
      const ref = m[1];
      const filename = path.basename(ref);
      if (resolved.has(ref)) continue;
      const vaultPath = assetIndex.get(filename);
      if (!vaultPath) {
        missing.push({ ref, sourceFile: note.vaultRelPath });
      } else {
        resolved.set(ref, { filename, vaultPath });
      }
    }
  }
  return { resolved, missing };
}

async function copyAssets(resolved: Map<string, ResolvedAsset>, vaultRoot: string, contentRoot: string): Promise<void> {
  // Assets go to public/_assets/ so Next.js's static file server serves them at /_assets/<name>.
  const repoRoot = path.resolve(contentRoot, "..");
  const assetsDir = path.join(repoRoot, "public", "_assets");
  for (const asset of resolved.values()) {
    const src = path.join(vaultRoot, asset.vaultPath);
    const dst = path.join(assetsDir, asset.filename);
    await mkdir(path.dirname(dst), { recursive: true });
    await copyFile(src, dst);
  }
}

function rewriteBody(body: string): string {
  // Asset refs already validated upstream; rewrite to standard markdown.
  return body.replace(/!\[\[([^\]\n]+?)\]\]/g, (_m, ref: string) => {
    const filename = path.basename(ref);
    return `![${filename}](/_assets/${filename})`;
  });
}

async function writeNotes(notes: DiscoveredNote[], contentRoot: string): Promise<{ written: string[] }> {
  const written: string[] = [];
  const seen = new Map<string, string>(); // dst -> source vaultRelPath (for collision detection)
  for (const note of notes) {
    const rel = mapVaultPathToContentPath(note.vaultRelPath);
    const existing = seen.get(rel);
    if (existing) {
      throw new Error(`Duplicate slug: "${existing}" and "${note.vaultRelPath}" both map to ${rel}`);
    }
    seen.set(rel, note.vaultRelPath);
    const dst = path.join(contentRoot, rel);
    const body = rewriteBody(note.body);
    const trimmed = body.trimStart();
    const tail = trimmed.endsWith("\n") ? "" : "\n";
    // Only round-trip the fields PublishedFrontmatter declares; vault-only fields ignored.
    const frontmatter = `---\npublish: true\ntitle: ${JSON.stringify(note.title)}\ndate: ${note.date}\n---\n`;
    await mkdir(path.dirname(dst), { recursive: true });
    await writeFile(dst, frontmatter + trimmed + tail, "utf8");
    written.push(rel);
  }
  return { written };
}

const MANAGED_PATHS = ["index.md", "architecture/", "hardware/", "software/", "log/", "photos/"];

function isManaged(rel: string): boolean {
  return MANAGED_PATHS.some(p => p.endsWith("/") ? rel.startsWith(p) : rel === p);
}

export async function pruneStale(contentRoot: string, written: Set<string>): Promise<string[]> {
  const existing = await fg(["**/*.md", "!_assets/**"], { cwd: contentRoot });
  const removed: string[] = [];
  for (const rel of existing) {
    if (!isManaged(rel)) continue; // leave hand-authored files alone
    if (!written.has(rel)) {
      await rm(path.join(contentRoot, rel));
      removed.push(rel);
    }
  }
  return removed;
}

function runGit(args: string[], cwd: string, opts: { capture?: boolean } = {}): { stdout: string } {
  const r = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: opts.capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed (exit ${r.status})`);
  return { stdout: r.stdout ?? "" };
}

function gitCommitAndPush(contentRoot: string, summary: string): void {
  const repoRoot = path.resolve(contentRoot, "..");
  runGit(["add", "content", "public/_assets"], repoRoot);
  const status = runGit(["status", "--porcelain", "content", "public/_assets"], repoRoot, { capture: true });
  if (!status.stdout.trim()) {
    console.log("  ↳ no changes to commit");
    return;
  }
  runGit(["commit", "-m", `Publish: ${summary}`], repoRoot);
  runGit(["push"], repoRoot);
}

async function main() {
  const vaultRoot = process.env.GARDEN_VAULT_PATH ?? path.join(process.env.HOME ?? "", "Documents/MaRs/Projects/Garden Monitor");
  const contentRoot = path.resolve(process.cwd(), "content");
  const dryRun = process.env.GARDEN_DRY_RUN === "1" || process.argv.includes("--dry-run");
  await stat(vaultRoot).catch(() => { throw new Error(`Vault not found: ${vaultRoot}`); });
  await mkdir(contentRoot, { recursive: true });

  console.log(`Vault:   ${vaultRoot}`);
  console.log(`Content: ${contentRoot}`);
  if (dryRun) console.log("(dry-run mode — no commit/push)");

  const notes = await discoverPublishedNotes(vaultRoot);
  console.log(`Discovered ${notes.length} published notes.`);

  const assetIndex = await buildVaultAssetIndex(vaultRoot);
  const { resolved, missing } = findAssetReferences(notes, assetIndex);
  if (missing.length > 0) {
    console.error(`\n  ${missing.length} unresolved asset reference(s):`);
    for (const m of missing) console.error(`    - "${m.ref}" referenced by ${m.sourceFile}`);
    throw new Error(`Sync aborted — fix missing assets in vault and re-run.`);
  }

  const { written } = await writeNotes(notes, contentRoot);
  await copyAssets(resolved, vaultRoot, contentRoot);
  const removed = await pruneStale(contentRoot, new Set(written));

  const summary = `${written.length} written, ${removed.length} removed`;
  console.log(`  ↳ ${summary}`);

  if (dryRun) {
    console.log("  ↳ dry-run: skipping git commit/push");
    return;
  }
  gitCommitAndPush(contentRoot, summary);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
