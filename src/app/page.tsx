import path from "node:path";
import { loadAllNotes, firstProseLine } from "@/lib/content";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SectionGrid, Section } from "@/components/SectionGrid";
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
      excerpt: firstProseLine(n.body),
      source: "log" as const,
    }));

  const sections: Section[] = [
    { href: "/architecture", emoji: "🏗️", label: "Architecture", count: notes.filter(n => n.slug.startsWith("/architecture/")).length, unit: "docs", unitSingular: "doc" },
    { href: "/hardware", emoji: "🔧", label: "Hardware", count: notes.filter(n => n.slug.startsWith("/hardware/")).length, unit: "items", unitSingular: "item" },
    { href: "/software", emoji: "💻", label: "Software", count: notes.filter(n => n.slug.startsWith("/software/")).length, unit: "guides", unitSingular: "guide" },
    { href: "/log", emoji: "📓", label: "Daily Log", count: notes.filter(n => n.slug.startsWith("/log/")).length, unit: "entries", unitSingular: "entry" },
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
        <article className="note-prose mt-9" dangerouslySetInnerHTML={{ __html: homeHtml }} />
      )}
    </div>
  );
}
