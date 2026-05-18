import { describe, it, expect, vi } from "vitest";
import { diagnoseTool, diagnoseInputSchema } from "./tools";
import { proposePhotoTagsTool, proposePhotoTagsInputSchema } from "./tools";
import { draftDailyLogTool, draftDailyLogInputSchema } from "./tools";
import { commitToGithubTool, commitToGithubInputSchema } from "./tools";

describe("diagnoseTool", () => {
  it("has a zod schema accepting image_urls + optional question", () => {
    expect(diagnoseInputSchema.safeParse({ image_urls: ["https://x/y.jpg"] }).success).toBe(true);
    expect(diagnoseInputSchema.safeParse({ image_urls: ["https://x/y.jpg"], question: "what's wrong" }).success).toBe(true);
    expect(diagnoseInputSchema.safeParse({}).success).toBe(false);
    expect(diagnoseInputSchema.safeParse({ image_urls: [] }).success).toBe(false); // require at least 1
  });

  it("description mentions plant health", () => {
    expect((diagnoseTool.description ?? "").toLowerCase()).toContain("plant");
  });
});

describe("proposePhotoTagsTool", () => {
  it("requires image_urls + date in YYYY-MM-DD form", () => {
    expect(proposePhotoTagsInputSchema.safeParse({ image_urls: ["https://x/y.jpg"], date: "2026-05-18" }).success).toBe(true);
    expect(proposePhotoTagsInputSchema.safeParse({ image_urls: ["https://x/y.jpg"], date: "May 18 2026" }).success).toBe(false);
    expect(proposePhotoTagsInputSchema.safeParse({ image_urls: [], date: "2026-05-18" }).success).toBe(false);
  });

  it("accepts optional filenames array", () => {
    expect(proposePhotoTagsInputSchema.safeParse({
      image_urls: ["https://x/a.jpg"],
      date: "2026-05-18",
      filenames: ["img_5734.jpg"],
    }).success).toBe(true);
  });
});

describe("draftDailyLogTool", () => {
  it("requires a YYYY-MM-DD date", () => {
    expect(draftDailyLogInputSchema.safeParse({ date: "2026-05-18" }).success).toBe(true);
    expect(draftDailyLogInputSchema.safeParse({ date: "May 18" }).success).toBe(false);
  });

  it("accepts optional notes + image_urls", () => {
    expect(draftDailyLogInputSchema.safeParse({
      date: "2026-05-18",
      notes: "pruned the lavender",
      image_urls: ["https://x/a.jpg"],
    }).success).toBe(true);
  });
});

describe("commitToGithubTool", () => {
  it("validates files array shape", () => {
    expect(commitToGithubInputSchema.safeParse({
      title: "x", body: "y",
      files: [{ path: "content/x.md", content: "x" }],
    }).success).toBe(true);
    expect(commitToGithubInputSchema.safeParse({
      title: "x", body: "y",
      files: [], // empty rejected
    }).success).toBe(false);
  });

  it("execute() delegates to createAiPr and returns PR url", async () => {
    vi.resetModules();
    vi.doMock("./github", () => ({
      createAiPr: vi.fn().mockResolvedValue({ url: "https://github.com/x/y/pull/3", number: 3 }),
    }));
    const mod = await import("./tools");
    const result = await mod.commitToGithubTool.execute!({
      title: "AI: photos 2026-05-18",
      body: "test",
      files: [{ path: "content/photos/2026-05-18.md", content: "x" }],
    } as any, {} as any);
    expect(result.url).toContain("/pull/3");
    expect(result.number).toBe(3);
  });
});
