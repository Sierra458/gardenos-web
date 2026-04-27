import { describe, it, expect } from "vitest";
import { loadAllNotes, getNoteBySlug, DuplicateSlugError } from "./content";
import path from "node:path";

const FIXTURES = path.resolve(__dirname, "../../tests/fixtures/content");

describe("loadAllNotes", () => {
  it("loads every published note from a content directory", async () => {
    const notes = await loadAllNotes(FIXTURES);
    const titles = notes.map(n => n.title).sort();
    expect(titles).toEqual([
      "GardenOS",
      "Pi 5 first boot",
      "Raspberry Pi 5",
      "System Architecture",
    ]);
  });

  it("each note has slug, body, and frontmatter populated", async () => {
    const notes = await loadAllNotes(FIXTURES);
    const home = notes.find(n => n.title === "GardenOS")!;
    expect(home.slug).toBe("/");
    expect(home.body).toContain("Welcome");
    expect(home.frontmatter.date).toBe("2026-03-18");
  });

  it("notes are sorted by date descending", async () => {
    const notes = await loadAllNotes(FIXTURES);
    expect(notes[0].date).toBe("2026-03-19"); // most recent first
  });

  it("exports DuplicateSlugError for the sync layer to use", () => {
    expect(DuplicateSlugError).toBeDefined();
    expect(new DuplicateSlugError("/foo", ["a.md", "b.md"]).name).toBe("DuplicateSlugError");
  });
});

describe("getNoteBySlug", () => {
  it("returns the matching note", async () => {
    const notes = await loadAllNotes(FIXTURES);
    const note = getNoteBySlug(notes, "/hardware/raspberry-pi-5");
    expect(note?.title).toBe("Raspberry Pi 5");
  });
  it("returns undefined for unknown slug", async () => {
    const notes = await loadAllNotes(FIXTURES);
    expect(getNoteBySlug(notes, "/nope")).toBeUndefined();
  });
});
