import path from "node:path";
import { loadAllNotes } from "@/lib/content";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SectionGrid } from "@/components/SectionGrid";
import { renderMarkdown } from "@/lib/markdown";
import { buildSlugMap } from "@/lib/wikilink";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export default async function HomePage() {
  const notes = await loadAllNotes(CONTENT_DIR);
  const slugMap = buildSlugMap(notes.map(n => ({ vaultPath: n.contentPath, title: n.title, slug: n.slug })));

  const home = notes.find(n => n.slug === "/");
  const homeHtml = home
    ? await renderMarkdown(home.body, { slugMap, sourceFile: home.contentPath })
    : null;

  const logs = notes
    .filter(n => n.slug.startsWith("/log/"))
    .slice(0, 5)
    .map(n => ({
      slug: n.slug,
      title: n.title,
      date: n.date,
      excerpt: n.body.split("\n").find(l => l.trim().length > 0)?.slice(0, 140),
      source: "log" as const,
    }));

  const sections = [
    { href: "/architecture", emoji: "🏗️", label: "Architecture", count: notes.filter(n => n.slug.startsWith("/architecture/")).length, unit: "docs" },
    { href: "/hardware", emoji: "🔧", label: "Hardware", count: notes.filter(n => n.slug.startsWith("/hardware/")).length, unit: "items" },
    { href: "/software", emoji: "💻", label: "Software", count: notes.filter(n => n.slug.startsWith("/software/")).length, unit: "guides" },
    { href: "/log", emoji: "📓", label: "Daily Log", count: notes.filter(n => n.slug.startsWith("/log/")).length, unit: "entries" },
  ];

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Latest</div>
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]">Recent updates</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">What's changed in the project.</p>

      <ActivityFeed items={logs} />

      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mt-7 mb-2">Jump to</div>
      <SectionGrid sections={sections} />

      {homeHtml && (
        <article className="mt-9 prose-invert max-w-none [&_a]:text-[var(--color-accent)] [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:mb-3 [&_p]:text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{ __html: homeHtml }} />
      )}
    </div>
  );
}
