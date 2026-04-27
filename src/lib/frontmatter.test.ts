import { describe, it, expect } from "vitest";
import { parseFrontmatter, FrontmatterError } from "./frontmatter";

describe("parseFrontmatter", () => {
  it("returns parsed frontmatter and body for a valid published note", () => {
    const raw = `---
publish: true
title: Hello
date: 2026-03-19
tags: [a, b]
---
Body content here.`;
    const result = parseFrontmatter(raw, "fake.md");
    expect(result.frontmatter.publish).toBe(true);
    expect(result.frontmatter.title).toBe("Hello");
    expect(result.frontmatter.date).toBe("2026-03-19");
    expect(result.frontmatter.tags).toEqual(["a", "b"]);
    expect(result.body.trim()).toBe("Body content here.");
  });

  it("returns publish=false for notes without the flag", () => {
    const raw = `---
title: Untitled
---
Body.`;
    const result = parseFrontmatter(raw, "fake.md");
    expect(result.frontmatter.publish).toBe(false);
  });

  it("throws FrontmatterError if publish:true but title missing", () => {
    const raw = `---
publish: true
date: 2026-03-19
---
Body.`;
    expect(() => parseFrontmatter(raw, "broken.md")).toThrow(FrontmatterError);
    expect(() => parseFrontmatter(raw, "broken.md")).toThrow(/broken\.md/);
    expect(() => parseFrontmatter(raw, "broken.md")).toThrow(/title/);
  });

  it("throws FrontmatterError if publish:true but date missing", () => {
    const raw = `---
publish: true
title: X
---
Body.`;
    expect(() => parseFrontmatter(raw, "no-date.md")).toThrow(/date/);
  });

  it("throws FrontmatterError if date is not ISO YYYY-MM-DD", () => {
    const raw = `---
publish: true
title: X
date: March 19 2026
---
Body.`;
    expect(() => parseFrontmatter(raw, "bad-date.md")).toThrow(/date/i);
  });
});
