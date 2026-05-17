const ALLOWED_TOP_LEVELS = new Set(["Architecture", "Hardware", "Software", "Daily Log", "Photos", "Plant Logs"]);
const TOP_LEVEL_TO_URL: Record<string, string> = {
  "Architecture": "architecture",
  "Hardware": "hardware",
  "Software": "software",
  "Daily Log": "log",
  "Photos": "photos",
  "Plant Logs": "plant-logs",
};
const DAILY_LOG_DATE = /^(\d{4}-\d{2}-\d{2})\b/;

export function slugifySegment(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[‐-―]/g, "-") // hyphens, en-dash, em-dash
    .replace(/[‘’“”]/g, "")  // curly quotes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps a vault-relative path (e.g. "Architecture/System Architecture.md")
 * to a site URL (e.g. "/architecture/system-architecture"), or null if
 * the file is not in a published top-level folder.
 *
 * Special cases:
 *   - "Garden Monitor.md" at the root → "/" (home overview)
 *   - "Daily Log/<YYYY-MM-DD>...md" → "/log/<YYYY-MM-DD>" (date is the slug)
 */
export function vaultPathToSiteSlug(vaultRelPath: string): string | null {
  if (vaultRelPath === "Garden Monitor.md") return "/";

  const parts = vaultRelPath.split("/");
  if (parts.length < 2) return null;

  const topLevel = parts[0];
  if (!ALLOWED_TOP_LEVELS.has(topLevel)) return null;

  const filename = parts[parts.length - 1].replace(/\.md$/, "");

  if (topLevel === "Daily Log") {
    const m = filename.match(DAILY_LOG_DATE);
    if (!m) return null;
    return `/log/${m[1]}`;
  }

  const subSlug = slugifySegment(filename);
  return `/${TOP_LEVEL_TO_URL[topLevel]}/${subSlug}`;
}
