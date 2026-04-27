import { slugifySegment } from "./slug";

export interface PublishedNote {
  vaultPath: string;
  title: string;
  slug: string;
}

export class DuplicateTitleError extends Error {
  constructor(public title: string, public conflictingPaths: string[]) {
    super(`Duplicate published note title "${title}" — appears in: ${conflictingPaths.join(", ")}`);
    this.name = "DuplicateTitleError";
  }
}

export class WikilinkError extends Error {
  constructor(public sourceFile: string, public target: string) {
    super(`${sourceFile}: broken wikilink [[${target}]] — target not published`);
    this.name = "WikilinkError";
  }
}

export type SlugMap = Map<string, string>;

export function buildSlugMap(notes: PublishedNote[]): SlugMap {
  const map = new Map<string, string>();
  const titles = new Map<string, string>(); // title → vaultPath of first occurrence
  for (const n of notes) {
    const existing = titles.get(n.title);
    if (existing && existing !== n.vaultPath) {
      throw new DuplicateTitleError(n.title, [existing, n.vaultPath]);
    }
    titles.set(n.title, n.vaultPath);
    map.set(n.title, n.slug);
    map.set(n.title.toLowerCase(), n.slug);
  }
  return map;
}

export function resolveWikilink(target: string, map: SlugMap, sourceFile: string): string {
  const hashIdx = target.indexOf("#");
  const titlePart = hashIdx === -1 ? target : target.slice(0, hashIdx);
  const sectionPart = hashIdx === -1 ? undefined : target.slice(hashIdx + 1);
  const slug = map.get(titlePart) ?? map.get(titlePart.toLowerCase());
  if (!slug) throw new WikilinkError(sourceFile, target);
  return sectionPart ? `${slug}#${slugifySegment(sectionPart)}` : slug;
}
