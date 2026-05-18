const SECTION_HEADER = /^##+\s+(?:[^\w\s]*\s*)?(carry forward|pending|next steps?|todo|to do|to-do)\b/i;
const NEXT_HEADER = /^##+\s+/;
const UNCHECKED = /^\s*-\s*\[\s*\]\s+(.+)$/;

// NOTE: Identical regex shape to src/lib/today.ts — duplicated INTENTIONALLY.
// today.ts reads from Note[] in-process (the published site's "Today" widget);
// this lib reads raw markdown via Octokit (the AI chat route). Different consumers,
// same logic. Keeping them separate avoids coupling the console route to the
// published-site loader.
export function extractCarryForward(body: string): string[] {
  const lines = body.split("\n");
  let inSection = false;
  const items: string[] = [];
  for (const line of lines) {
    if (SECTION_HEADER.test(line)) { inSection = true; continue; }
    if (inSection && NEXT_HEADER.test(line)) break;
    if (!inSection) continue;
    const m = line.match(UNCHECKED);
    if (m) items.push(m[1].trim());
  }
  return items;
}
