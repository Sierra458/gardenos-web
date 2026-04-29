import type { Note } from "./content";
import type { TodayItem } from "../components/TodayWidget";

/**
 * Pulls the unchecked checkbox items from the most recent log note's
 * "Carry Forward" / "Pending" / "Next steps" section.
 *
 * Returns the items + the source log's slug + date so the widget can link back.
 */
export function getCarryForwardItems(notes: Note[]): { items: TodayItem[]; sourceSlug?: string; sourceDate?: string } {
  const logs = notes.filter(n => n.slug.startsWith("/log/"));
  for (const log of logs) {
    const items = parseCarryForward(log.body);
    if (items.length > 0) {
      return { items, sourceSlug: log.slug, sourceDate: log.date };
    }
  }
  return { items: [] };
}

const SECTION_HEADER = /^##+\s+(?:[^\w\s]*\s*)?(carry forward|pending|next steps?|todo|to do|to-do)\b/i;
const NEXT_HEADER = /^##+\s+/;
const UNCHECKED = /^\s*-\s*\[\s*\]\s+(.+)$/;
const CHECKED = /^\s*-\s*\[(x|X)\]\s+(.+)$/;

function parseCarryForward(body: string): TodayItem[] {
  const lines = body.split("\n");
  let inSection = false;
  const items: TodayItem[] = [];
  for (const line of lines) {
    if (SECTION_HEADER.test(line)) { inSection = true; continue; }
    if (inSection && NEXT_HEADER.test(line)) break;
    if (!inSection) continue;
    const u = line.match(UNCHECKED);
    if (u) { items.push({ text: u[1].trim(), done: false }); continue; }
    const c = line.match(CHECKED);
    if (c) { items.push({ text: c[2].trim(), done: true }); }
  }
  return items.filter(i => !i.done);
}
