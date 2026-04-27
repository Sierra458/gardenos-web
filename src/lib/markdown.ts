import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkCallouts from "remark-callouts";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import rehypeMermaid from "rehype-mermaid";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import { resolveWikilink, type SlugMap } from "./wikilink";

interface RenderOptions {
  slugMap: SlugMap;
  sourceFile: string;
}

const remarkWikilinks: Plugin<[RenderOptions]> = (opts) => (tree) => {
  const re = /\[\[([^\]\n]+?)\]\]/g;
  visit(tree, "text", (node, index, parent) => {
    if (!parent || index === undefined) return;
    const value = (node as { value: string }).value;
    if (!value.includes("[[")) return;
    const newChildren: unknown[] = [];
    let cursor = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value)) !== null) {
      if (m.index > cursor) {
        newChildren.push({ type: "text", value: value.slice(cursor, m.index) });
      }
      const target = m[1];
      const url = resolveWikilink(target, opts.slugMap, opts.sourceFile);
      const display = target.split("#")[0];
      newChildren.push({ type: "link", url, children: [{ type: "text", value: display }] });
      cursor = m.index + m[0].length;
    }
    if (cursor < value.length) newChildren.push({ type: "text", value: value.slice(cursor) });
    (parent as { children: unknown[] }).children.splice(index, 1, ...newChildren);
  });
};

export async function renderMarkdown(input: string, opts: RenderOptions): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkWikilinks, opts)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeShiki, { theme: "github-dark" })
    .use(rehypeMermaid, { strategy: "pre-mermaid" })
    .use(rehypeStringify)
    .process(input);
  return String(file);
}
