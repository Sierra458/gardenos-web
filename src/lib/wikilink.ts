export interface PublishedNote {
  vaultPath: string;
  title: string;
  slug: string;
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
  for (const n of notes) {
    map.set(n.title, n.slug);
    map.set(n.title.toLowerCase(), n.slug);
  }
  return map;
}

function anchorize(section: string): string {
  return section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveWikilink(target: string, map: SlugMap, sourceFile: string): string {
  const hashIdx = target.indexOf("#");
  const titlePart = hashIdx === -1 ? target : target.slice(0, hashIdx);
  const sectionPart = hashIdx === -1 ? undefined : target.slice(hashIdx + 1);
  const slug = map.get(titlePart) ?? map.get(titlePart.toLowerCase());
  if (!slug) throw new WikilinkError(sourceFile, target);
  return sectionPart ? `${slug}#${anchorize(sectionPart)}` : slug;
}
