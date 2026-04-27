import matter from "gray-matter";

export interface PublishedFrontmatter {
  publish: true;
  title: string;
  date: string; // YYYY-MM-DD
  tags?: string[];
  [key: string]: unknown;
}

export interface UnpublishedFrontmatter {
  publish: false;
  [key: string]: unknown;
}

export type Frontmatter = PublishedFrontmatter | UnpublishedFrontmatter;

export class FrontmatterError extends Error {
  constructor(public file: string, message: string) {
    super(`${file}: ${message}`);
    this.name = "FrontmatterError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseFrontmatter(
  raw: string,
  file: string,
): { frontmatter: Frontmatter; body: string } {
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;

  if (fm.publish !== true) {
    return { frontmatter: { ...(fm as object), publish: false } as UnpublishedFrontmatter, body: parsed.content };
  }

  if (typeof fm.title !== "string" || fm.title.trim() === "") {
    throw new FrontmatterError(file, "publish:true requires a non-empty `title`");
  }

  const dateValue = fm.date instanceof Date
    ? fm.date.toISOString().slice(0, 10)
    : typeof fm.date === "string" ? fm.date : "";

  if (!ISO_DATE.test(dateValue)) {
    throw new FrontmatterError(file, "publish:true requires a `date` in YYYY-MM-DD format");
  }

  return {
    frontmatter: { ...(fm as object), publish: true, title: fm.title, date: dateValue } as PublishedFrontmatter,
    body: parsed.content,
  };
}
