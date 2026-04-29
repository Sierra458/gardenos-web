import path from "node:path";
import { loadAllNotes, firstProseLine } from "@/lib/content";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SectionGrid, Section } from "@/components/SectionGrid";
import { StatsHero } from "@/components/StatsHero";
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

  const archCount = notes.filter(n => n.slug.startsWith("/architecture/")).length;
  const hwCount = notes.filter(n => n.slug.startsWith("/hardware/")).length;
  const swCount = notes.filter(n => n.slug.startsWith("/software/")).length;
  const logCount = notes.filter(n => n.slug.startsWith("/log/")).length;
  const photoCount = notes.filter(n => n.slug.startsWith("/photos/")).length;
  const lastUpdate = notes[0]?.date ?? "—";

  const sections: Section[] = [
    {
      href: "/architecture",
      emoji: "🏗️",
      label: "Architecture",
      count: archCount,
      unit: "docs",
      unitSingular: "doc",
      description: "System design, watering logic, planting calendar, and patio layout.",
    },
    {
      href: "/hardware",
      emoji: "🔧",
      label: "Hardware",
      count: hwCount,
      unit: "items",
      unitSingular: "item",
      description: "Boards, sensors, and modules powering the build.",
    },
    {
      href: "/software",
      emoji: "💻",
      label: "Software",
      count: swCount,
      unit: "guides",
      unitSingular: "guide",
      description: "Step-by-step setup guides for every component.",
    },
    {
      href: "/log",
      emoji: "📓",
      label: "Daily Log",
      count: logCount,
      unit: "entries",
      unitSingular: "entry",
      description: "Day-by-day progress and observations.",
    },
    {
      href: "/photos",
      emoji: "📸",
      label: "Photos",
      count: photoCount,
      unit: "days",
      unitSingular: "day",
      description: "Garden photos grouped by the day they were taken.",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-accent)] mb-1">
          <span>●</span> <span>Live</span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-[var(--color-text-primary)] leading-tight">GardenOS</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Automated garden monitoring &amp; watering — Houston, TX.</p>
      </div>

      <StatsHero
        stats={[
          { label: "Sections", value: 4 },
          { label: "Hardware", value: hwCount, detail: hwCount === 1 ? "item" : "items" },
          { label: "Entries", value: logCount, detail: logCount === 1 ? "log" : "logs" },
          { label: "Updated", value: lastUpdate.slice(5), detail: lastUpdate.slice(0, 4) },
        ]}
      />

      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Recent updates</div>
      <ActivityFeed items={logs} />

      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mt-8 mb-3">Jump to</div>
      <SectionGrid sections={sections} />

      {homeHtml && (
        <>
          <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mt-10 mb-3">Overview</div>
          <article className="note-prose" dangerouslySetInnerHTML={{ __html: homeHtml }} />
        </>
      )}
    </div>
  );
}
