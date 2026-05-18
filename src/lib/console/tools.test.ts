import { describe, it, expect } from "vitest";
import { diagnoseTool, diagnoseInputSchema } from "./tools";
import { proposePhotoTagsTool, proposePhotoTagsInputSchema } from "./tools";
import { draftDailyLogTool, draftDailyLogInputSchema } from "./tools";

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
