import path from "node:path";
import { notFound } from "next/navigation";
import { loadAllNotes, getNoteBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { buildSlugMap } from "@/lib/wikilink";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export async function generateStaticParams() {
  const notes = await loadAllNotes(CONTENT_DIR);
  return notes
    .filter(n => n.slug !== "/")
    .map(n => ({ slug: n.slug.slice(1).split("/") }));
}

export default async function NotePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugParts } = await params;
  const slug = "/" + slugParts.join("/");

  const notes = await loadAllNotes(CONTENT_DIR);
  const note = getNoteBySlug(notes, slug);
  if (!note) notFound();

  const slugMap = buildSlugMap(notes.map(n => ({ vaultPath: n.contentPath, title: n.title, slug: n.slug })));
  const html = await renderMarkdown(note.body, { slugMap, sourceFile: note.contentPath });

  return (
    <article className="note-prose">
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{note.date}</div>
      <h1 className="text-[26px] font-semibold tracking-tight mb-6 text-[var(--color-text-primary)]">{note.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
