import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";
import { buildSlugMap } from "./wikilink";

const map = buildSlugMap([
  { vaultPath: "x", title: "Raspberry Pi 5", slug: "/hardware/raspberry-pi-5" },
]);

describe("renderMarkdown", () => {
  it("renders a paragraph", async () => {
    const html = await renderMarkdown("Hello world.", { slugMap: map, sourceFile: "x.md" });
    expect(html).toContain("<p>Hello world.</p>");
  });

  it("rewrites [[wikilinks]] to anchor tags", async () => {
    const html = await renderMarkdown("See [[Raspberry Pi 5]].", { slugMap: map, sourceFile: "x.md" });
    expect(html).toContain('href="/hardware/raspberry-pi-5"');
    expect(html).toContain(">Raspberry Pi 5</a>");
  });

  it("throws on broken wikilinks with source file context", async () => {
    await expect(
      renderMarkdown("See [[Nonexistent]].", { slugMap: map, sourceFile: "broken.md" })
    ).rejects.toThrow(/broken\.md/);
  });

  it("renders Obsidian callouts", async () => {
    const html = await renderMarkdown("> [!note]\n> Watch out.", { slugMap: map, sourceFile: "x.md" });
    expect(html.toLowerCase()).toContain("callout");
  });

  it("highlights fenced code", async () => {
    const html = await renderMarkdown("```ts\nconst x = 1;\n```", { slugMap: map, sourceFile: "x.md" });
    expect(html).toContain("<pre");
    expect(html).toContain("const");
  });
});
