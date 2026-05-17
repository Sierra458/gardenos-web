import { describe, it, expect } from "vitest";
import { diagnoseTool } from "./tools";

describe("diagnoseTool", () => {
  it("has a zod schema accepting image_urls + optional question", () => {
    const schema = diagnoseTool.inputSchema;
    expect(schema.safeParse({ image_urls: ["https://x/y.jpg"] }).success).toBe(true);
    expect(schema.safeParse({ image_urls: ["https://x/y.jpg"], question: "what's wrong" }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ image_urls: [] }).success).toBe(false); // require at least 1
  });

  it("description mentions plant health", () => {
    expect(diagnoseTool.description.toLowerCase()).toContain("plant");
  });
});
